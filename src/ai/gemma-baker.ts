import { RecipePreset, Ingredient, BIG_9_ALLERGENS } from '../data/presets';

export interface GeneratedLabelData {
  descendingIngredients: string;
  declaredAllergens: string[];
  allergenWarningStatement: string;
  mandatoryCottageNotice: string;
  netWeightFormatted: string;
  batchNumber: string;
  packedDate: string;
  storageNotice: string;
}

export interface GeneratedSocialData {
  instagramDropPost: string;
  chalkboardMenuCopy: string;
  dmPreorderMessage: string;
  hashtags: string[];
}

export interface GemmaScaleAdvice {
  hydrationPercentage?: number;
  mixerCapacityWarning?: string;
  fermentationBakeTip: string;
}

/**
 * Gemma 2 (2B) Open-Weights Cottage Bakery Engine
 * Implements strict FDA Cottage Food descending-by-weight labeling,
 * Big 9 allergen audits, and sensory menu storytelling.
 */
export class GemmaBakerEngine {
  private ollamaEndpoint: string = 'http://localhost:11434/api/generate';
  private modelName: string = 'gemma2:2b';

  /**
   * Constructs Gemma 2 prompt using Google's official Gemma formatting tokens
   */
  public buildGemmaPrompt(task: string, context: Record<string, any>): string {
    return `<start_of_turn>user
You are BakeCraft Gemma, a specialized open-weights AI assistant trained for cottage food micro-bakers, pastry chefs, and home culinary entrepreneurs.
Task: ${task}
Context: ${JSON.stringify(context, null, 2)}
Instructions:
1. Adhere strictly to FDA 21 CFR 101.4 descending-by-weight food labeling laws.
2. Audit all Big 9 allergens (Milk, Eggs, Peanuts, Tree Nuts, Fish, Crustacean Shellfish, Wheat, Soy, Sesame).
3. Generate sensory, mouth-watering marketing copy highlighting artisanal techniques (cold fermentation, browned butter, real vanilla bean caviar, natural sourdough levain).
<end_of_turn>
<start_of_turn>model
`;
  }

  /**
   * Generates FDA-compliant descending order ingredients and allergen declaration
   */
  public generateComplianceLabel(
    recipe: RecipePreset,
    scaleMultiplier: number,
    bakeryName: string = "Elena's Hearth & Crumb",
    bakeryLocation: string = "Austin, TX (Permit #CF-2026-8819)"
  ): GeneratedLabelData {
    // 1. Sort ingredients descending by scaled weight (grams)
    const sortedIngredients = [...recipe.ingredients].sort(
      (a, b) => (b.grams * scaleMultiplier) - (a.grams * scaleMultiplier)
    );

    // 2. Format descending list with sub-ingredients if present
    const ingredientListStrings = sortedIngredients.map(ing => {
      if (ing.subIngredients) {
        return `${ing.name} (${ing.subIngredients})`;
      }
      return ing.name;
    });

    const descendingIngredients = ingredientListStrings.join(', ');

    // 3. Scan for Big 9 allergens
    const detectedAllergensSet = new Set<string>();
    recipe.ingredients.forEach(ing => {
      ing.allergens.forEach(allg => detectedAllergensSet.add(allg));
    });

    // Check textual matches in names or sub-ingredients for safety
    BIG_9_ALLERGENS.forEach(allergen => {
      const lower = allergen.toLowerCase();
      recipe.ingredients.forEach(ing => {
        const fullText = (ing.name + ' ' + (ing.subIngredients || '')).toLowerCase();
        if (fullText.includes(lower) || (lower === 'wheat' && fullText.includes('flour') && !fullText.includes('almond') && !fullText.includes('rice'))) {
          detectedAllergensSet.add(allergen);
        }
      });
    });

    const declaredAllergens = Array.from(detectedAllergensSet);
    const allergenWarningStatement = declaredAllergens.length > 0
      ? `CONTAINS: ${declaredAllergens.map(a => a.toUpperCase()).join(', ')}.`
      : 'CONTAINS NO COMMON ALLERGENS.';

    // 4. Calculate net weight
    const totalGramsPerUnit = Math.round(recipe.cottageFoodNotes.netWeightGrams);
    const ozWeight = (totalGramsPerUnit / 28.3495).toFixed(1);
    const netWeightFormatted = `NET WT. ${totalGramsPerUnit}g (${ozWeight} oz)`;

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const batchCode = `BCH-${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}-01`;

    return {
      descendingIngredients,
      declaredAllergens,
      allergenWarningStatement,
      mandatoryCottageNotice: recipe.cottageFoodNotes.exemptionDisclaimer,
      netWeightFormatted,
      batchNumber: batchCode,
      packedDate: dateStr,
      storageNotice: recipe.cottageFoodNotes.storageAdvice
    };
  }

  /**
   * Generates sensory storytelling marketing drops
   */
  public generateSocialDropCopy(
    recipe: RecipePreset,
    scaleMultiplier: number,
    retailUnitPrice: number,
    totalBatchUnits: number,
    bakeryName: string = "Elena's Hearth & Crumb"
  ): GeneratedSocialData {
    const formattedPrice = `$${retailUnitPrice.toFixed(2)}`;
    const unitTitle = recipe.unitLabel;
    const totalUnits = Math.round(recipe.baseYieldUnits * scaleMultiplier);

    // Instagram Drop Copy
    const instagramDropPost = `✨ SATURDAY BAKE DROP ALERT ✨\n\n` +
      `Fresh out of the ovens at ${bakeryName}: Our signature ${recipe.title}.\n\n` +
      `🥖 The Details: ${recipe.socialHookPrompt}\n\n` +
      `📦 Only ${totalUnits} ${unitTitle} available for this weekend's batch run.\n` +
      `🏷️ ${formattedPrice} each | Hand-laminated & packaged with care.\n\n` +
      `📍 Porch pickup & Farmers Market counter open Saturday 8:00 AM – 11:30 AM.\n` +
      `👇 Comment "BAKE" or DM to reserve your box before sold out!`;

    // Chalkboard Menu
    const chalkboardMenuCopy = `${recipe.title.toUpperCase()} — ${formattedPrice}\n` +
      `Freshly baked in small batches. ${recipe.description.split('.')[0]}.`;

    // Direct Pre-order DM
    const dmPreorderMessage = `Hi friend! 👋 I have just ${totalUnits} ${unitTitle} of fresh ${recipe.title} coming out of the hearth this weekend for ${formattedPrice}. Would you like me to hold one in a custom gift box for you for Saturday morning pickup?`;

    // Hashtags
    const hashtags = [
      '#cottagebakery',
      '#microbakery',
      '#homebaker',
      '#artisansourdough',
      '#scratchbaker',
      '#localfoodie',
      '#bakecraftai',
      '#cottagefoodoperator'
    ];

    return {
      instagramDropPost,
      chalkboardMenuCopy,
      dmPreorderMessage,
      hashtags
    };
  }

  /**
   * Batch Scaling & Kitchen Physics Advisor
   */
  public getScalingAdvice(recipe: RecipePreset, multiplier: number): GemmaScaleAdvice {
    const flourGrams = recipe.ingredients
      .filter(i => i.name.toLowerCase().includes('flour'))
      .reduce((acc, curr) => acc + curr.grams * multiplier, 0);

    const waterGrams = recipe.ingredients
      .filter(i => i.name.toLowerCase().includes('water') || i.name.toLowerCase().includes('milk'))
      .reduce((acc, curr) => acc + curr.grams * multiplier, 0);

    const hydration = flourGrams > 0 ? Math.round((waterGrams / flourGrams) * 100) : 0;

    let mixerWarning = '';
    if (flourGrams > 2000) {
      mixerWarning = `⚠️ Total flour exceeds 2.0 kg (${(flourGrams/1000).toFixed(1)}kg). Standard 5-quart stand mixers (e.g., KitchenAid Artisan) risk motor burnout. Divide into 2 separate kneading runs or hand-knead in bulk tubs.`;
    }

    let bakeTip = 'Maintain consistent deck stone heat between bakes. Allow 15 minutes of recovery between batch loads.';
    if (multiplier >= 3) {
      bakeTip = `High batch volume (${multiplier}x): Stagger final bench shaping by 15-20 minutes across batches so later loaves don't over-proof while batch 1 is in the oven!`;
    }

    return {
      hydrationPercentage: hydration > 0 ? hydration : undefined,
      mixerCapacityWarning: mixerWarning || undefined,
      fermentationBakeTip: bakeTip
    };
  }
}

export const gemmaBaker = new GemmaBakerEngine();
