import json
import random
from pathlib import Path
from typing import List, Dict
TOTAL_TRANSACTIONS = 2000
DATASET_A_END = 1000
DATASET_A_SEED_RATE = 0.60
DATASET_B_SEED_RATE = 0.90
DATASET_A_SEED_PAIR = ["Pikachu Plushie", "Booster Pack (Scarlet & Violet)"]
DATASET_B_SEED_PAIR = ["Pikachu Hoodie", "Pokedex Notebook"]
#DATASET_B_SEED_PAIR = ["Gengar Night Light", "Pokemon Advent Calendar"]
BASKET_SIZE_MIN = 2
BASKET_SIZE_MAX = 5
ITEMS = [
    "Pikachu Plushie",
    "Eevee Plushie",
    "Snorlax Bean Bag",
    "Booster Pack (Scarlet & Violet)",
    "Elite Trainer Box",
    "Graded Charizard Card",
    "Pikachu Hoodie",
    "Team Rocket Tee",
    "Pokemon Trainer Cap",
    "Pokedex Notebook",
    "Poke Ball Pen Set",
    "Gym Badge Enamel Pin Set",
    "Gengar Night Light",
    "Bulbasaur Succulent Planter",
    "Pokemon Advent Calendar",
]
def generate_transactions(
    start_id: int,
    end_id: int,
    seed_pair: List[str],
    seed_rate: float,
) -> List[Dict]:
    """Generate transactions for a single dataset segment.
    Each transaction randomly seeds `seed_pair` with probability `seed_rate`,
    then fills remaining slots with random catalogue items.
    """
    rows: List[Dict] = []
    for transaction_id in range(start_id, end_id + 1):
        basket_size = random.randint(BASKET_SIZE_MIN, BASKET_SIZE_MAX)
        current_basket: List[str] = []
        if random.random() < seed_rate:
            current_basket.extend(seed_pair)
        while len(current_basket) < basket_size:
            candidate = random.choice(ITEMS)
            if candidate not in current_basket:
                current_basket.append(candidate)
        for item in current_basket[:basket_size]:
            rows.append({"transaction_id": transaction_id, "item_name": item})
    return rows
def main() -> None:
    print("PokéML Recommender — Data Generator")
    print("=" * 50)
    print(f"  Dataset A seed pair : {DATASET_A_SEED_PAIR}  (rate: {DATASET_A_SEED_RATE:.0%})")
    print(f"  Dataset B seed pair : {DATASET_B_SEED_PAIR}  (rate: {DATASET_B_SEED_RATE:.0%})")
    print(f"  Basket size         : {BASKET_SIZE_MIN}-{BASKET_SIZE_MAX} items")
    print(f"  Total transactions  : {TOTAL_TRANSACTIONS}")
    print()
    dataset_b_start = DATASET_A_END + 1
    dataset_b_end   = TOTAL_TRANSACTIONS
    all_rows: List[Dict] = []
    print(f"Generating Dataset A - Early Launch Phase (transactions 1-{DATASET_A_END})...")
    rows_a = generate_transactions(1, DATASET_A_END, DATASET_A_SEED_PAIR, DATASET_A_SEED_RATE)
    all_rows.extend(rows_a)
    print(f"  Generated {len(rows_a)} rows across {DATASET_A_END} transactions.")
    print(f"Generating Dataset B - Holiday Season Shift (transactions {dataset_b_start}-{dataset_b_end})...")
    rows_b = generate_transactions(dataset_b_start, dataset_b_end, DATASET_B_SEED_PAIR, DATASET_B_SEED_RATE)
    all_rows.extend(rows_b)
    print(f"  Generated {len(rows_b)} rows across {dataset_b_end - dataset_b_start + 1} transactions.")
    data_dir = Path(__file__).resolve().parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    output_file = data_dir / "transactions.json"
    output_file.write_text(json.dumps(all_rows, indent=2), encoding="utf-8")
    print(f"\nTotal rows generated : {len(all_rows)}")
    print(f"Total transactions   : {TOTAL_TRANSACTIONS}")
    print(f"Saved to             : {output_file}")
    print("\nDone. Run python main_engine.py to analyse the data.")
if __name__ == "__main__":
    main()
