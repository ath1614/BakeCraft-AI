export interface Ingredient {
  id: string;
  name: string;
  grams: number;
  cost: number; // cost for this recipe amount in standard 1x batch
  allergens: string[]; // e.g. ["Wheat", "Milk", "Eggs", "Tree Nuts"]
  subIngredients?: string; // for FDA descending label (e.g. "Cream, Salt" for salted butter)
}

export interface PackagingItem {
  id: string;
  name: string;
  unitCost: number;
  quantity: number;
}

export interface RecipePreset {
  id: string;
  title: string;
  category: 'Sourdough & Bread' | 'Enriched Buns' | 'Celebration Cakes' | 'French Patisserie';
  description: string;
  baseYieldUnits: number;
  unitLabel: string; // e.g., "Loaves", "Jumbo Buns", "Celebration Cake", "Gift Box of 12"
  activeLaborMinutes: number;
  bakerHourlyWage: number;
  ovenEnergyCost: number;
  defaultTargetMargin: number; // e.g. 70 (%)
  ingredients: Ingredient[];
  packaging: PackagingItem[];
  cottageFoodNotes: {
    stateRegulation: string;
    exemptionDisclaimer: string;
    storageAdvice: string;
    netWeightGrams: number;
  };
  socialHookPrompt: string;
}

export const BAKERY_PRESETS: RecipePreset[] = [
  {
    id: 'artisan-sourdough-batard',
    title: 'Artisan Sourdough Batard (75% Hydration)',
    category: 'Sourdough & Bread',
    description: '36-hour cold fermented wild sourdough with blistered open-ear crust and custard crumb.',
    baseYieldUnits: 2,
    unitLabel: 'Artisan Batards',
    activeLaborMinutes: 30,
    bakerHourlyWage: 22,
    ovenEnergyCost: 1.25,
    defaultTargetMargin: 72,
    ingredients: [
      { id: 'ing-1', name: 'Unbleached Organic Bread Flour (12.7% protein)', grams: 500, cost: 1.45, allergens: ['Wheat'], subIngredients: 'Enriched Wheat Flour, Malted Barley Flour' },
      { id: 'ing-2', name: 'Stone-Ground Whole Wheat Flour', grams: 100, cost: 0.40, allergens: ['Wheat'], subIngredients: '100% Whole Hard Red Wheat' },
      { id: 'ing-3', name: 'Filtered Spring Water', grams: 450, cost: 0.05, allergens: [] },
      { id: 'ing-4', name: 'Mature Wild Sourdough Starter (100% hydration)', grams: 120, cost: 0.35, allergens: ['Wheat'], subIngredients: 'Fermented Wheat Flour, Wild Yeast Cultures, Water' },
      { id: 'ing-5', name: 'Fine French Grey Sea Salt (Sel Gris)', grams: 12, cost: 0.12, allergens: [] }
    ],
    packaging: [
      { id: 'pkg-1', name: 'Micro-Perforated Kraft Bread Window Sleeve', unitCost: 0.48, quantity: 2 },
      { id: 'pkg-2', name: 'Custom 2-inch Circular Kraft Bakery Label', unitCost: 0.22, quantity: 2 },
      { id: 'pkg-3', name: 'Natural Unbleached Jute Twine & Tag', unitCost: 0.08, quantity: 2 }
    ],
    cottageFoodNotes: {
      stateRegulation: 'FDA Cottage Food Standard § 21 CFR 101 / State Home Kitchen Exemption',
      exemptionDisclaimer: 'Made in a home kitchen not inspected by the Department of State Health Services.',
      storageAdvice: 'Store cut-side down on wooden board for 48h or freeze sliced.',
      netWeightGrams: 850
    },
    socialHookPrompt: 'Golden blistered crust crackling as it leaves the 480°F hearth stone. 36 hours of cold slow fermentation for that unmistakable wild tangy depth and caramelized ear.'
  },
  {
    id: 'brown-butter-brioche-buns',
    title: 'Brown Butter Cardamom Brioche Buns',
    category: 'Enriched Buns',
    description: 'Ultra-plush Scandinavian-style buns enriched with nutty hazelnut-browned cultured butter and crushed green cardamom.',
    baseYieldUnits: 6,
    unitLabel: 'Jumbo Brioche Buns',
    activeLaborMinutes: 45,
    bakerHourlyWage: 20,
    ovenEnergyCost: 0.95,
    defaultTargetMargin: 70,
    ingredients: [
      { id: 'ing-1', name: 'High-Gluten Artisan Bread Flour', grams: 500, cost: 1.55, allergens: ['Wheat'], subIngredients: 'Unbleached Hard Red Spring Wheat Flour' },
      { id: 'ing-2', name: 'Cultured European Butter (Browned)', grams: 250, cost: 3.85, allergens: ['Milk'], subIngredients: 'Pasteurized Cream, Lactic Acid Cultures' },
      { id: 'ing-3', name: 'Pasture-Raised Whole Eggs', grams: 200, cost: 1.95, allergens: ['Eggs'], subIngredients: 'Whole Fresh Farm Eggs' },
      { id: 'ing-4', name: 'Whole Creamery Milk', grams: 150, cost: 0.45, allergens: ['Milk'], subIngredients: 'Grade A Pasteurized Whole Milk, Vitamin D3' },
      { id: 'ing-5', name: 'Golden Evaporated Cane Sugar', grams: 80, cost: 0.28, allergens: [] },
      { id: 'ing-6', name: 'Whole Green Cardamom Pods (Hand-Mortared)', grams: 8, cost: 0.85, allergens: [] },
      { id: 'ing-7', name: 'Instant Osmotolerant Yeast', grams: 10, cost: 0.35, allergens: [] },
      { id: 'ing-8', name: 'Swedish Pearl Sugar & Glaze', grams: 40, cost: 0.65, allergens: ['Eggs'], subIngredients: 'Coarse Refined Sugar Crystals, Egg Yolk Wash' },
      { id: 'ing-9', name: 'Fine Sea Salt', grams: 10, cost: 0.05, allergens: [] }
    ],
    packaging: [
      { id: 'pkg-1', name: 'Kraft Window 6-Pack Bakery Clamshell', unitCost: 1.35, quantity: 1 },
      { id: 'pkg-2', name: 'Checkered Greaseproof Waxed Bakery Liner', unitCost: 0.22, quantity: 1 },
      { id: 'pkg-3', name: 'Gold-Foil Branded Tamper Label', unitCost: 0.18, quantity: 1 }
    ],
    cottageFoodNotes: {
      stateRegulation: 'FDA Cottage Food Standard § 21 CFR 101 / State Home Kitchen Exemption',
      exemptionDisclaimer: 'Made in a home kitchen not inspected by the Department of State Health Services.',
      storageAdvice: 'Best consumed within 24 hours. Reheat at 325°F for 4 minutes for fresh-from-the-oven aroma.',
      netWeightGrams: 820
    },
    socialHookPrompt: 'Nutty browned butter folded slowly into silky brioche dough, speckled generously with freshly cracked cardamom and crusted in Swedish pearl sugar.'
  },
  {
    id: 'vanilla-bean-celebration-cake',
    title: 'Triple Madagascar Vanilla Bean Celebration Cake (6" 3-Layer)',
    category: 'Celebration Cakes',
    description: 'Velvety tender chiffon crumb saturated with real vanilla bean caviar, enveloped in silky Swiss meringue buttercream.',
    baseYieldUnits: 1,
    unitLabel: 'Designer Celebration Cake (12-14 Servings)',
    activeLaborMinutes: 90,
    bakerHourlyWage: 24,
    ovenEnergyCost: 1.60,
    defaultTargetMargin: 75,
    ingredients: [
      { id: 'ing-1', name: 'Silky Soft Cake Flour (Chlorinated)', grams: 320, cost: 1.25, allergens: ['Wheat'], subIngredients: 'Bleached Wheat Flour, Niacin, Reduced Iron' },
      { id: 'ing-2', name: 'European Unsalted Butter 82% Fat', grams: 340, cost: 4.90, allergens: ['Milk'], subIngredients: 'Pasteurized Cream, Natural Flavorings' },
      { id: 'ing-3', name: 'Madagascar Bourbon Vanilla Bean Caviar Paste', grams: 25, cost: 5.60, allergens: [], subIngredients: 'Vanilla Extractives, Ground Vanilla Beans, Sugar, Gum Tragacanth' },
      { id: 'ing-4', name: 'Farm-Fresh Egg Whites', grams: 180, cost: 2.10, allergens: ['Eggs'], subIngredients: 'Pasteurized Liquid Egg Whites' },
      { id: 'ing-5', name: 'Ultra-Fine Baker’s Caster Sugar', grams: 350, cost: 0.98, allergens: [] },
      { id: 'ing-6', name: 'Whole Creamery Milk', grams: 240, cost: 0.65, allergens: ['Milk'], subIngredients: 'Grade A Whole Milk' },
      { id: 'ing-7', name: 'Aluminum-Free Double-Acting Baking Powder', grams: 14, cost: 0.22, allergens: [] },
      { id: 'ing-8', name: 'Swiss Meringue Buttercream (Butter + Whites + Sugar)', grams: 850, cost: 10.40, allergens: ['Milk', 'Eggs'], subIngredients: 'Butter (Cream), Egg Whites, Sugar, Madagascar Vanilla' },
      { id: 'ing-9', name: 'Fine Sea Salt', grams: 5, cost: 0.04, allergens: [] }
    ],
    packaging: [
      { id: 'pkg-1', name: 'Heavy-Duty 8" Tall Corrugated Window Cake Box', unitCost: 3.50, quantity: 1 },
      { id: 'pkg-2', name: '8" Greaseproof Heavy Masonry Silver Cake Drum', unitCost: 2.20, quantity: 1 },
      { id: 'pkg-3', name: 'Woven Satin Grosgrain Ribbon (2 Yards)', unitCost: 0.85, quantity: 1 },
      { id: 'pkg-4', name: 'Bakery Care & Cutting Guide Insert Card', unitCost: 0.35, quantity: 1 }
    ],
    cottageFoodNotes: {
      stateRegulation: 'FDA Cottage Food Standard § 21 CFR 101 / State Home Kitchen Exemption',
      exemptionDisclaimer: 'Made in a home kitchen not inspected by the Department of State Health Services.',
      storageAdvice: 'Keep refrigerated until 2 hours prior to display. Slice at room temperature with hot knife.',
      netWeightGrams: 1650
    },
    socialHookPrompt: 'Three cloud-like layers of vanilla sponge speckled with genuine Madagascar vanilla beans, cloaked in whipped Swiss meringue buttercream that melts instantly on the tongue.'
  },
  {
    id: 'raspberry-rose-macarons-12',
    title: 'French Raspberry Rose Macarons (12-Piece Gift Box)',
    category: 'French Patisserie',
    description: 'Delicate crisp shells with chewy ruffles filled with white chocolate ganache and tart organic raspberry reduction.',
    baseYieldUnits: 1,
    unitLabel: 'Luxe 12-Macaron Gift Box',
    activeLaborMinutes: 70,
    bakerHourlyWage: 22,
    ovenEnergyCost: 0.85,
    defaultTargetMargin: 74,
    ingredients: [
      { id: 'ing-1', name: 'Extra-Fine Blanched California Almond Flour', grams: 150, cost: 3.25, allergens: ['Tree Nuts (Almond)'], subIngredients: '100% Skinless Blanched Almonds' },
      { id: 'ing-2', name: 'Pure Cane Confectioners Sugar (Cornstarch-free)', grams: 150, cost: 0.65, allergens: [] },
      { id: 'ing-3', name: 'Aged Farm Egg Whites', grams: 110, cost: 1.35, allergens: ['Eggs'], subIngredients: 'Aged Liquid Egg Whites' },
      { id: 'ing-4', name: 'Extra-Fine Granulated Sugar', grams: 150, cost: 0.45, allergens: [] },
      { id: 'ing-5', name: 'Freeze-Dried Organic Raspberry Powder', grams: 20, cost: 2.25, allergens: [] },
      { id: 'ing-6', name: 'Valrhona 34% Opalys White Chocolate', grams: 200, cost: 4.85, allergens: ['Milk', 'Soy'], subIngredients: 'Cocoa Butter, Whole Milk Powder, Sugar, Soy Lecithin' },
      { id: 'ing-7', name: 'Heavy Whipping Cream 36% Fat', grams: 100, cost: 0.95, allergens: ['Milk'], subIngredients: 'Grade A Cream' },
      { id: 'ing-8', name: 'Distilled Organic Culinary Damask Rosewater', grams: 8, cost: 0.85, allergens: [] }
    ],
    packaging: [
      { id: 'pkg-1', name: 'Custom 12-Well Thermoform Macaron Slide Tray', unitCost: 1.65, quantity: 1 },
      { id: 'pkg-2', name: 'Matte Soft-Touch Slide Sleeve Box with Clear Window', unitCost: 2.45, quantity: 1 },
      { id: 'pkg-3', name: 'Embossed Gold Metallic Foil Sealing Sticker', unitCost: 0.32, quantity: 1 }
    ],
    cottageFoodNotes: {
      stateRegulation: 'FDA Cottage Food Standard § 21 CFR 101 / State Home Kitchen Exemption',
      exemptionDisclaimer: 'Made in a home kitchen not inspected by the Department of State Health Services.',
      storageAdvice: 'Refrigerate in airtight container up to 5 days. Allow 20 minutes to reach room temp before serving for perfect chewy texture.',
      netWeightGrams: 340
    },
    socialHookPrompt: 'Pastel pink macaron shells with delicate feet, sandwiched around velvety white chocolate infused with Bulgarian rosewater and tart summer raspberry reduction.'
  }
];

export const BIG_9_ALLERGENS = [
  'Milk',
  'Eggs',
  'Fish',
  'Crustacean Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soy',
  'Sesame'
];
