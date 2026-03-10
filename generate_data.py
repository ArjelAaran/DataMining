import json
import random
from pathlib import Path
from typing import List, Dict

# ─────────────────────────────────────────────────────────────────────────────
# PokéML Recommender — Data Generator
# No database required. Generates synthetic transaction data entirely in memory
# and saves it to data/transactions.json for the ML engine to read.
# ─────────────────────────────────────────────────────────────────────────────

ITEMS = [
    # Plushies & Figures
    "Pikachu Plushie",
    "Eevee Plushie",
    "Snorlax Bean Bag",
    # Trading Cards
    "Booster Pack (Scarlet & Violet)",
    "Elite Trainer Box",
    "Graded Charizard Card",
    # Apparel
    "Pikachu Hoodie",
    "Team Rocket Tee",
    "Pokemon Trainer Cap",
    # Accessories & Stationery
    "Pokedex Notebook",
    "Poke Ball Pen Set",
    "Gym Badge Enamel Pin Set",
    # Home & Lifestyle
    "Gengar Night Light",
    "Bulbasaur Succulent Planter",
    "Pokemon Advent Calendar",
]


def generate_transactions(start_id: int, end_id: int, dataset_type: str = "A") -> List[Dict]:
    """
    Generate synthetic transaction rows for a given ID range.

    Dataset A (IDs 1–1000):   Early launch phase — Pikachu Plushie + Booster Pack dominates.
    Dataset B (IDs 1001–2000): Holiday season shift — Pikachu Hoodie + Pokedex Notebook rises.

    Each transaction has a random basket size of 2–5 items.
    70% of transactions start with the seeded bias pair for that dataset type.
    """
    rows: List[Dict] = []

    for transaction_id in range(start_id, end_id + 1):
        basket_size = random.randint(2, 5)
        current_basket: List[str] = []

        # Seed the dominant pattern for this dataset phase
        if dataset_type == "A":
            if random.random() < 0.65:
                current_basket.extend(
                    ["Pikachu Plushie", "Booster Pack (Scarlet & Violet)"]
                    # ["Genger Night Light", "Pokemon Advent Calendar"]
                )
        else:
            if random.random() < 0.90:
                current_basket.extend(["Pikachu Hoodie", "Pokedex Notebook"])

        # Fill remaining basket slots randomly
        while len(current_basket) < basket_size:
            candidate = random.choice(ITEMS)
            if candidate not in current_basket:
                current_basket.append(candidate)

        # One row per item in the basket
        for item in current_basket[:basket_size]:
            rows.append({"transaction_id": transaction_id, "item_name": item})

    return rows


def main() -> None:
    print("PokéML Recommender — Data Generator")
    print("=" * 50)

    all_rows: List[Dict] = []

    print("Generating Dataset A — Early Launch Phase (transactions 1–1000)...")
    rows_a = generate_transactions(1, 1000, "A")
    all_rows.extend(rows_a)
    print(f"  Generated {len(rows_a)} rows across 1000 transactions.")

    print("Generating Dataset B — Holiday Season Shift (transactions 1001–2000)...")
    rows_b = generate_transactions(1001, 2000, "B")
    all_rows.extend(rows_b)
    print(f"  Generated {len(rows_b)} rows across 1000 transactions.")

    # Save to data/transactions.json
    data_dir = Path(__file__).resolve().parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    output_file = data_dir / "transactions.json"
    output_file.write_text(json.dumps(all_rows, indent=2), encoding="utf-8")

    print(f"\nTotal rows generated: {len(all_rows)}")
    print(f"Total transactions : 2000")
    print(f"Saved to           : {output_file}")
    print("\nDone. Run python main_engine.py to analyze the data.")


if __name__ == "__main__":
    main()
