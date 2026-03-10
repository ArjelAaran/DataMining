# PokéML Recommender

An e-commerce recommendation backend dashboard for Pokémon merchandise, built with FP-Growth association rule mining.

**No database required.** All data is generated locally and stored as a JSON file.

---

## What It Does

Powers three recommendation surfaces for a Pokémon merchandise storefront:

- **Homepage Ranking** — Surfaces the highest-scoring item bundles at the top of the storefront
- **"Frequently Bought Together"** — Cart cross-sell popup triggered when a user adds a specific item
- **Promo Generator** — Auto-generates discount campaign codes based on the strongest item associations

The ML engine uses **FP-Growth** to discover frequent itemsets and derives association rules scored by:

```
Score = 0.4 x Support + 0.4 x Confidence + 0.2 x Lift
```

---

## Setup and Running

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Generate transaction data
```bash
python generate_data.py
```
Creates data/transactions.json with 2000 synthetic transactions.

### 3. Run the ML engine
```bash
python main_engine.py
```
Reads data/transactions.json, runs FP-Growth across 3 iteration windows, and writes results to public/analysis-results.json.

### 4. Start the frontend
```bash
npm install
npm run dev
```
Open http://localhost:5173 in your browser.

---

## To Get Fresh Results

Just re-run steps 2 and 3 any time:
```bash
python generate_data.py
python main_engine.py
```

---

## Product Catalog — 15 Pokemon Merchandise Items

| Category   | Items |
|------------|-------|
| Plushie    | Pikachu Plushie, Eevee Plushie, Snorlax Bean Bag |
| TCG        | Booster Pack (Scarlet & Violet), Elite Trainer Box, Graded Charizard Card |
| Apparel    | Pikachu Hoodie, Team Rocket Tee, Pokemon Trainer Cap |
| Stationery | Pokedex Notebook, Poke Ball Pen Set, Gym Badge Enamel Pin Set |
| Lifestyle  | Gengar Night Light, Bulbasaur Succulent Planter, Pokemon Advent Calendar |

---

## Architecture

```
generate_data.py          Generates synthetic transactions → data/transactions.json
main_engine.py            FP-Growth mining → public/analysis-results.json
src/app/
  App.tsx                 Root layout and data loading
  components/
    DataIngestionHub      Data source status and row counts
    IterationSwitcher     Switch between analysis windows
    MLEngineView          Association rules + bar gauge charts
    BusinessActionCenter  Homepage ranking, cart cross-sell, promo generator
    ProductCatalog        Filterable 15-item merch grid
  lib/associationRules    Rule sorting utilities
  types/analysis.ts       TypeScript interfaces
```
