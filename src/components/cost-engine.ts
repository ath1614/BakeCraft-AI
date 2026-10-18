import { RecipePreset } from '../data/presets';

export interface CostBreakdownResult {
  multiplier: number;
  totalYieldUnits: number;
  unitLabel: string;
  
  // Cost breakdown
  ingredientCostTotal: number;
  packagingCostTotal: number;
  laborCostTotal: number;
  overheadCostTotal: number;
  totalPrimeCost: number;
  
  // Per unit costs
  unitIngredientCost: number;
  unitPackagingCost: number;
  unitLaborCost: number;
  unitOverheadCost: number;
  unitTotalCost: number;

  // Margin & Pricing
  targetMarginPercent: number; // e.g. 70
  suggestedRetailUnitPrice: number;
  totalBatchRevenue: number;
  totalBatchGrossProfit: number;
  unitGrossProfit: number;
  actualGrossMarginPercent: number;

  // Efficiency metrics
  effectiveHourlyTakeHome: number;
  foodCostPercentage: number;
  laborCostPercentage: number;
  packagingCostPercentage: number;
  profitPercentage: number;
  marginHealthStatus: 'Healthy' | 'Sub-Par' | 'Critical Loss' | 'Premium Luxe';
  marginBadgeColor: string;
}

export class CostMarginEngine {
  public calculate(
    recipe: RecipePreset,
    multiplier: number,
    targetMargin: number,
    overrideHourlyWage?: number
  ): CostBreakdownResult {
    const totalYieldUnits = Math.max(1, Math.round(recipe.baseYieldUnits * multiplier));

    // 1. Ingredients Cost
    const ingredientCostTotal = recipe.ingredients.reduce(
      (sum, ing) => sum + (ing.cost * multiplier), 0
    );

    // 2. Packaging Cost
    const packagingCostTotal = recipe.packaging.reduce(
      (sum, pkg) => sum + (pkg.unitCost * pkg.quantity * multiplier), 0
    );

    // 3. Labor Cost (sublinear scaling: batch efficiency factor of 0.45)
    const effectiveWage = overrideHourlyWage ?? recipe.bakerHourlyWage;
    const baseMinutes = recipe.activeLaborMinutes;
    const scaledMinutes = baseMinutes * (1 + (multiplier - 1) * 0.45);
    const laborCostTotal = (scaledMinutes / 60) * effectiveWage;

    // 4. Oven & Utility Overhead
    const overheadCostTotal = recipe.ovenEnergyCost * (1 + (multiplier - 1) * 0.35);

    // 5. Total Prime Cost
    const totalPrimeCost = ingredientCostTotal + packagingCostTotal + laborCostTotal + overheadCostTotal;

    // Unit Breakdown
    const unitIngredientCost = ingredientCostTotal / totalYieldUnits;
    const unitPackagingCost = packagingCostTotal / totalYieldUnits;
    const unitLaborCost = laborCostTotal / totalYieldUnits;
    const unitOverheadCost = overheadCostTotal / totalYieldUnits;
    const unitTotalCost = totalPrimeCost / totalYieldUnits;

    // Pricing from Target Margin (Food Service Standard Equation: Price = Cost / (1 - Margin))
    const clampedMargin = Math.min(88, Math.max(20, targetMargin));
    const marginDecimal = clampedMargin / 100;
    const suggestedRetailUnitPrice = unitTotalCost / (1 - marginDecimal);

    const totalBatchRevenue = suggestedRetailUnitPrice * totalYieldUnits;
    const totalBatchGrossProfit = totalBatchRevenue - totalPrimeCost;
    const unitGrossProfit = suggestedRetailUnitPrice - unitTotalCost;
    const actualGrossMarginPercent = Math.round((unitGrossProfit / suggestedRetailUnitPrice) * 100);

    // Baker Effective Earnings: (Net Profit + Labor Cost) / Total Labor Hours
    const totalLaborHours = scaledMinutes / 60;
    const effectiveHourlyTakeHome = totalLaborHours > 0
      ? (totalBatchGrossProfit + laborCostTotal) / totalLaborHours
      : 0;

    // Percent breakdown of total revenue
    const foodCostPercentage = Math.round((ingredientCostTotal / totalBatchRevenue) * 100);
    const packagingCostPercentage = Math.round((packagingCostTotal / totalBatchRevenue) * 100);
    const laborCostPercentage = Math.round((laborCostTotal / totalBatchRevenue) * 100);
    const profitPercentage = Math.max(0, 100 - foodCostPercentage - packagingCostPercentage - laborCostPercentage);

    // Health status
    let marginHealthStatus: 'Healthy' | 'Sub-Par' | 'Critical Loss' | 'Premium Luxe' = 'Healthy';
    let marginBadgeColor = '#2D6A4F'; // Forest Green

    if (actualGrossMarginPercent < 50) {
      marginHealthStatus = 'Critical Loss';
      marginBadgeColor = '#DC2626'; // Red
    } else if (actualGrossMarginPercent < 65) {
      marginHealthStatus = 'Sub-Par';
      marginBadgeColor = '#D97706'; // Amber
    } else if (actualGrossMarginPercent >= 75) {
      marginHealthStatus = 'Premium Luxe';
      marginBadgeColor = '#7C3AED'; // Royal Violet
    }

    return {
      multiplier,
      totalYieldUnits,
      unitLabel: recipe.unitLabel,
      ingredientCostTotal,
      packagingCostTotal,
      laborCostTotal,
      overheadCostTotal,
      totalPrimeCost,
      unitIngredientCost,
      unitPackagingCost,
      unitLaborCost,
      unitOverheadCost,
      unitTotalCost,
      targetMarginPercent: clampedMargin,
      suggestedRetailUnitPrice,
      totalBatchRevenue,
      totalBatchGrossProfit,
      unitGrossProfit,
      actualGrossMarginPercent,
      effectiveHourlyTakeHome,
      foodCostPercentage,
      laborCostPercentage,
      packagingCostPercentage,
      profitPercentage,
      marginHealthStatus,
      marginBadgeColor
    };
  }
}

export const costEngine = new CostMarginEngine();
