import { useState } from 'react';
const PRODUCTS = [
  { name: "Pikachu Plushie",              category: "Plushie",    rarity: "COMMON"    },
  { name: "Eevee Plushie",                category: "Plushie",    rarity: "COMMON"    },
  { name: "Snorlax Bean Bag",             category: "Plushie",    rarity: "UNCOMMON"  },
  { name: "Booster Pack (Scarlet & Violet)", category: "TCG",     rarity: "COMMON"    },
  { name: "Elite Trainer Box",            category: "TCG",        rarity: "RARE"      },
  { name: "Graded Charizard Card",        category: "TCG",        rarity: "ULTRA RARE"},
  { name: "Pikachu Hoodie",              category: "Apparel",     rarity: "COMMON"    },
  { name: "Team Rocket Tee",             category: "Apparel",     rarity: "COMMON"    },
  { name: "Pokémon Trainer Cap",         category: "Apparel",     rarity: "UNCOMMON"  },
  { name: "Pokédex Notebook",            category: "Stationery",  rarity: "COMMON"    },
  { name: "Poké Ball Pen Set",           category: "Stationery",  rarity: "COMMON"    },
  { name: "Gym Badge Enamel Pin Set",    category: "Stationery",  rarity: "UNCOMMON"  },
  { name: "Gengar Night Light",          category: "Lifestyle",   rarity: "RARE"      },
  { name: "Bulbasaur Succulent Planter", category: "Lifestyle",   rarity: "UNCOMMON"  },
  { name: "Pokémon Advent Calendar",     category: "Lifestyle",   rarity: "RARE"      },
];
const CATEGORIES = ['ALL', 'Plushie', 'TCG', 'Apparel', 'Stationery', 'Lifestyle'];
const RARITY_COLORS: Record<string, string> = {
  'COMMON':    'text-gray-500',
  'UNCOMMON':  'text-green-600',
  'RARE':      'text-red-500',
  'ULTRA RARE':'text-yellow-500',
};
const CATEGORY_CODES: Record<string, string> = {
  Plushie: 'PLU', TCG: 'TCG', Apparel: 'APL', Stationery: 'STN', Lifestyle: 'LIF',
};
export function ProductCatalog() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const filtered = activeCategory === 'ALL'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);
  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-red-600" />
          <div>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Product Catalog</h2>
            <p className="text-[10px] text-gray-600 tracking-widest uppercase">15 Items · Pokémon Merchandise</p>
          </div>
        </div>
        <div className="flex-1 h-px bg-red-900" />
        <div className="text-[10px] text-gray-700 tracking-widest">{filtered.length} / {PRODUCTS.length} ITEMS</div>
      </div>
      {}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[10px] px-3 py-1.5 tracking-[0.2em] uppercase border transition-colors ${
              activeCategory === cat
                ? 'border-red-500 bg-red-950 text-red-400'
                : 'border-gray-800 text-gray-600 hover:border-gray-600 hover:text-gray-400'
            }`}
          >
            {cat === 'ALL' ? 'ALL' : `${CATEGORY_CODES[cat]} · ${cat}`}
          </button>
        ))}
      </div>
      {}
      <div className="border border-gray-800">
        {}
        <div className="border-b border-gray-800 bg-gray-950 grid grid-cols-12 px-4 py-2 text-[9px] text-gray-700 tracking-[0.2em] uppercase">
          <div className="col-span-1">ID</div>
          <div className="col-span-5">Item Name</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-3">Rarity</div>
        </div>
        <div className="divide-y divide-gray-900">
          {filtered.map((product, i) => {
            const globalIdx = PRODUCTS.findIndex(p => p.name === product.name);
            return (
              <div
                key={product.name}
                className="grid grid-cols-12 px-4 py-2.5 hover:bg-gray-950 transition-colors group"
              >
                <div className="col-span-1 text-[10px] text-gray-700 font-bold tracking-wider group-hover:text-gray-500">
                  {String(globalIdx + 1).padStart(3, '0')}
                </div>
                <div className="col-span-5 text-xs text-gray-300 tracking-wide group-hover:text-white transition-colors">
                  {product.name}
                </div>
                <div className="col-span-3">
                  <span className="text-[10px] text-gray-600 tracking-widest uppercase border border-gray-800 px-1.5 py-0.5">
                    {CATEGORY_CODES[product.category]}
                  </span>
                </div>
                <div className={`col-span-3 text-[10px] font-bold tracking-wider ${RARITY_COLORS[product.rarity] ?? 'text-gray-500'}`}>
                  {product.rarity}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
