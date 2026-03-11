import json
import math
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from mlxtend.frequent_patterns import association_rules, fpgrowth

DATA_FILE = Path(__file__).resolve().parent / "data" / "transactions.json"

def load_transactions() -> pd.DataFrame:
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Transaction data not found at {DATA_FILE}\n"
            "Run generate_data.py first to create the data file."
        )
    with open(DATA_FILE, encoding="utf-8") as f:
        rows = json.load(f)
    return pd.DataFrame(rows)


def get_max_transaction_id(df: pd.DataFrame) -> int:
    if df.empty:
        return 0
    return int(df["transaction_id"].max())


def filter_transactions(df: pd.DataFrame, min_id: int, max_id: int) -> pd.DataFrame:
    return df[
        (df["transaction_id"] >= min_id) & (df["transaction_id"] <= max_id)
    ].copy()


def clean_transactions(df: pd.DataFrame) -> pd.DataFrame:

    original_count = len(df)

    df = df.dropna(subset=["transaction_id", "item_name"])
    after_nulls = len(df)

    df["item_name"] = df["item_name"].str.strip()

    df = df.drop_duplicates(subset=["transaction_id", "item_name"])
    after_dupes = len(df)

    df["transaction_id"] = df["transaction_id"].astype(int)

    df = df.reset_index(drop=True)

    nulls_removed = original_count - after_nulls
    dupes_removed = after_nulls - after_dupes
    print(
        f"  [Clean] {original_count} rows in "
        f"| nulls removed: {nulls_removed} "
        f"| duplicates removed: {dupes_removed} "
        f"| {len(df)} rows out"
    )
    return df

def build_iteration_ranges(max_transaction_id: int) -> list:

    if max_transaction_id <= 0:
        return [
            ("Iteration 1: Early Launch Phase", 1, 500),
            ("Iteration 2: Mid-Season Update",  1, 1000),
            ("Iteration 3: Full Holiday Trend", 1, 2000),
        ]

    first_cutoff  = max(1, round(max_transaction_id * 0.25))
    second_cutoff = max(first_cutoff + 1, round(max_transaction_id * 0.50))
    full_cutoff   = max_transaction_id

    return [
        ("Iteration 1: Early Launch Phase", 1, first_cutoff),
        ("Iteration 2: Mid-Season Update",  1, second_cutoff),
        ("Iteration 3: Full Holiday Trend", 1, full_cutoff),
    ]

def to_rule_signature(antecedents, consequents) -> str:

    left  = "|".join(sorted(str(i) for i in antecedents))
    right = "|".join(sorted(str(i) for i in consequents))
    return f"{left}=>{right}"


def to_symmetric_signature(antecedents, consequents) -> str:

    left  = "|".join(sorted(str(i) for i in antecedents))
    right = "|".join(sorted(str(i) for i in consequents))
    return " <-> ".join(sorted([left, right]))


def is_collector_theme_rule(antecedents, consequents) -> bool:

    all_items = [str(i).lower() for i in list(antecedents) + list(consequents)]
    return any(
        kw in item
        for item in all_items
        for kw in ("card", "graded", "elite", "booster")
    )


def first_top_rule_signature(result) -> str:

    if not result:
        return None
    top_rules = result.get("topRules") or []
    if not top_rules:
        return None
    r = top_rules[0]
    return to_rule_signature(
        r.get("antecedentItems", []),
        r.get("consequentItems", []),
    )

def pick_canonical_direction(rules: pd.DataFrame, item_support: dict) -> pd.DataFrame:

    kept_rows = []
    seen_symmetric = set()

    rules_sorted = rules.sort_values("score", ascending=False).reset_index(drop=True)

    for _, row in rules_sorted.iterrows():
        sym_sig = to_symmetric_signature(row["antecedents"], row["consequents"])

        if sym_sig in seen_symmetric:
            continue  

        ant_list = list(row["antecedents"])
        con_list = list(row["consequents"])

        if len(ant_list) == 1 and len(con_list) == 1:
            ant_item = ant_list[0]
            con_item = con_list[0]
            ant_supp = item_support.get(ant_item, 0.0)
            con_supp = item_support.get(con_item, 0.0)

            if con_supp > ant_supp:
                flipped_mask = (
                    rules_sorted["antecedents"].apply(
                        lambda x: sorted(list(x)) == sorted(con_list)
                    )
                    & rules_sorted["consequents"].apply(
                        lambda x: sorted(list(x)) == sorted(ant_list)
                    )
                )
                flipped = rules_sorted[flipped_mask]
                if not flipped.empty:
                    kept_rows.append(flipped.iloc[0])
                    seen_symmetric.add(sym_sig)
                    continue

        kept_rows.append(row)
        seen_symmetric.add(sym_sig)

    if not kept_rows:
        return rules.head(0)

    return pd.DataFrame(kept_rows).reset_index(drop=True)

def _empty_result(
    iteration_name, min_id, max_id,
    total_transactions=0, raw_row_count=0, min_support=0.0
) -> dict:

    return {
        "name":             iteration_name,
        "range":            {"min_id": min_id, "max_id": max_id},
        "transactionCount": int(total_transactions),
        "rawRowCount":      int(raw_row_count),
        "autoSupport":      float(min_support),
        "stabilitySupport": float(min(min_support * 2, 1.0)),
        "topRules":         [],
    }


def analyze_iteration(
    all_data: pd.DataFrame,
    iteration_name: str,
    min_id: int,
    max_id: int,
) -> dict:

    print("\n" + "=" * 60)
    print(f"RUNNING: {iteration_name}")
    print("=" * 60)

    df = filter_transactions(all_data, min_id, max_id)
    if df.empty:
        print("  No data found for this range.")
        return _empty_result(iteration_name, min_id, max_id)

    df = clean_transactions(df)

    basket_counts = (
        df.groupby(["transaction_id", "item_name"])["item_name"]
        .count()
        .unstack()
        .fillna(0)
    )
    basket = basket_counts.gt(0)

    total_transactions = len(basket)
    raw_row_count      = len(df)

    if total_transactions <= 500:
        min_support = 0.04
    elif total_transactions <= 1000:
        min_support = 0.02
    else:
        min_support = 0.01

    print(f"  Transactions: {total_transactions} | Auto-Support: {min_support}")

    frequent_itemsets = fpgrowth(basket, min_support=min_support, use_colnames=True)
    if frequent_itemsets.empty:
        print("  No frequent itemsets found.")
        return _empty_result(
            iteration_name, min_id, max_id,
            total_transactions, raw_row_count, min_support
        )

    rules = association_rules(
        frequent_itemsets,
        num_itemsets=total_transactions,
        metric="lift",
        min_threshold=1.0,
    )
    if rules.empty:
        print("  No association rules found.")
        return _empty_result(
            iteration_name, min_id, max_id,
            total_transactions, raw_row_count, min_support
        )

    # Support    × 0.4  — how common is this pattern across all transactions?
    # Confidence × 0.4  — how reliably does antecedent predict consequent?
    # Lift       × 0.2  — how much stronger than random chance? (capped at 20%
    #                      weight because lift can inflate for rare pairs)
    rules["score"] = (
          (rules["support"]    * 0.4)
        + (rules["confidence"] * 0.4)
        + (rules["lift"]       * 0.2)
    )

    # ── Step 8: Canonical direction deduplication ──────────────────────────
    # Build item-level individual support from single-item frequent sets.
    item_support = {
        list(row["itemsets"])[0]: float(row["support"])
        for _, row in frequent_itemsets.iterrows()
        if len(row["itemsets"]) == 1
    }
    
    rules = pick_canonical_direction(rules, item_support)

   
    rules["collectorThemeEligible"] = rules.apply(
        lambda row: is_collector_theme_rule(row["antecedents"], row["consequents"]),
        axis=1,
    )
    rules["rankingScore"] = (
        rules["score"]
        + rules["collectorThemeEligible"].astype(float) * 0.005
    )

    top_rules = (
        rules
        .sort_values(
            ["rankingScore", "confidence", "support", "lift"],
            ascending=[False, False, False, False],
        )
        .head(3)
        .reset_index(drop=True)
    )

    stability_support = min(min_support * 2, 1.0)
    stable_rule_signatures = set()

    stable_itemsets = fpgrowth(basket, min_support=stability_support, use_colnames=True)
    if not stable_itemsets.empty:
        stable_rules_df = association_rules(
            stable_itemsets,
            num_itemsets=total_transactions,
            metric="lift",
            min_threshold=1.0,
        )
        if not stable_rules_df.empty:
            stable_item_support = {
                list(row["itemsets"])[0]: float(row["support"])
                for _, row in stable_itemsets.iterrows()
                if len(row["itemsets"]) == 1
            }
            stable_rules_df = pick_canonical_direction(
                stable_rules_df, stable_item_support
            )
            stable_rule_signatures = {
                to_rule_signature(row["antecedents"], row["consequents"])
                for _, row in stable_rules_df.iterrows()
            }

    print("\n  --- TOP RULES ---")
    top_rule_payload = []

    for rank, row in top_rules.iterrows():
        ant_items  = sorted(list(row["antecedents"]))
        con_items  = sorted(list(row["consequents"]))
        antecedent = ", ".join(ant_items)
        consequent = ", ".join(con_items)

        lift_value     = float(row["lift"])
        conviction     = row.get("conviction", float("nan"))
        promo_discount = 20 if lift_value > 1.5 else 10
        con_prefix     = "".join(c for c in consequent.upper() if c.isalnum())[:4]
        promo_code     = f"POKE{con_prefix}{int(round(lift_value * 100))}"
        weighted_score = float(row["score"])
        signature      = to_rule_signature(ant_items, con_items)
        highly_stable  = signature in stable_rule_signatures

        print(f"\n  Rank {rank + 1}: '{antecedent}' -> '{consequent}'")
        print(
            f"    Score={weighted_score:.3f} | "
            f"Supp={row['support']:.3f} | "
            f"Conf={row['confidence']:.3f} | "
            f"Lift={lift_value:.3f} | "
            f"Lev={row['leverage']:.3f}"
        )
        print(
            f"    Stable={highly_stable} | "
            f"TCG={bool(row['collectorThemeEligible'])} | "
            f"Promo={promo_code} | Discount={promo_discount}%"
        )

        top_rule_payload.append({
            "rank":                   int(rank + 1),
            "antecedentItems":        ant_items,
            "consequentItems":        con_items,
            "antecedent":             antecedent,
            "consequent":             consequent,
            "support":                float(row["support"]),
            "confidence":             float(row["confidence"]),
            "lift":                   lift_value,
            "leverage":               float(row["leverage"]),
            "conviction": (
                float(conviction)
                if not pd.isna(conviction) and math.isfinite(float(conviction))
                else None
            ),
            "score":                  weighted_score,
            "promoCode":              promo_code,
            "promoDiscount":          promo_discount,
            "collectorThemeEligible": bool(row["collectorThemeEligible"]),
            "highlyStable":           highly_stable,
            "ruleSignature":          signature,
        })

    return {
        "name":             iteration_name,
        "range":            {"min_id": min_id, "max_id": max_id},
        "transactionCount": int(total_transactions),
        "rawRowCount":      int(raw_row_count),
        "autoSupport":      float(min_support),
        "stabilitySupport": float(stability_support),
        "topRules":         top_rule_payload,
    }


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main() -> None:
    print("PokéML Recommender — ML Engine")
    print("=" * 60)
    print(f"Loading transactions from: {DATA_FILE}")

    all_data = load_transactions()
    print(f"Loaded {len(all_data)} rows.\n")

    max_transaction_id = get_max_transaction_id(all_data)
    iteration_ranges   = build_iteration_ranges(max_transaction_id)

    iterations      = []
    model_history   = {}
    previous_result = None

    for idx, (iteration_name, min_id, max_id) in enumerate(
        iteration_ranges, start=1
    ):
        current_result   = analyze_iteration(all_data, iteration_name, min_id, max_id)
        current_top_sig  = first_top_rule_signature(current_result)
        previous_top_sig = first_top_rule_signature(previous_result)

        drift_detected = bool(
            previous_top_sig
            and current_top_sig
            and previous_top_sig != current_top_sig
        )
        if drift_detected:
            print(
                f"\n  DRIFT DETECTED between iteration {idx - 1} and {idx}:"
                f"\n    Was : {previous_top_sig}"
                f"\n    Now : {current_top_sig}"
            )

        current_result["driftDetected"]            = drift_detected
        current_result["previousTopRuleSignature"] = previous_top_sig
        current_result["currentTopRuleSignature"]  = current_top_sig

        iterations.append(current_result)
        model_history[f"iteration_{idx}"] = {
            "name":             iteration_name,
            "range":            current_result.get("range"),
            "topRules":         current_result.get("topRules", []),
            "topRuleSignature": current_top_sig,
        }
        previous_result = current_result

    sig_1 = model_history.get("iteration_1", {}).get("topRuleSignature")
    sig_3 = model_history.get("iteration_3", {}).get("topRuleSignature")

    output = {
        "generatedAt":             datetime.now(timezone.utc).isoformat(),
        "source":                  "local.data/transactions.json",
        "iterations":              iterations,
        "modelHistory":            model_history,
        "comparisonIteration1Vs3": {
            "iteration1TopRule": sig_1,
            "iteration3TopRule": sig_3,
            "topRuleChanged":    sig_1 != sig_3,
        },
    }

    public_dir  = Path(__file__).resolve().parent / "public"
    public_dir.mkdir(parents=True, exist_ok=True)
    output_file = public_dir / "analysis-results.json"
    output_file.write_text(json.dumps(output, indent=2), encoding="utf-8")

    print(f"\n{'=' * 60}")
    print(f"Results saved to: {output_file}")
    print(f"Iteration 1 top rule : {sig_1}")
    print(f"Iteration 3 top rule : {sig_3}")
    print(f"Top rule changed     : {sig_1 != sig_3}")
    print("\nRun 'npm run dev' and open localhost:5173 to view the dashboard.")


if __name__ == "__main__":
    main()