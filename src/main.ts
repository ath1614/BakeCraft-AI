import confetti from 'canvas-confetti';
import { BAKERY_PRESETS, RecipePreset, Ingredient, PackagingItem } from './data/presets';
import { gemmaBaker, GeneratedLabelData, GeneratedSocialData } from './ai/gemma-baker';
import { costEngine, CostBreakdownResult } from './components/cost-engine';

class BakeCraftApp {
  private currentRecipe: RecipePreset;
  private currentMultiplier: number = 1.0;
  private targetMargin: number = 72;
  private activeSocialTab: 'instagram' | 'chalkboard' | 'dm' = 'instagram';
  private bakeryName: string = "Elena's Hearth & Crumb";
  private lastFiredConfettiMargin: number = 0;

  constructor() {
    this.currentRecipe = JSON.parse(JSON.stringify(BAKERY_PRESETS[0]));
    this.targetMargin = this.currentRecipe.defaultTargetMargin;
    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.render();
  }

  private bindEvents(): void {
    // Preset Switching
    const presetChips = document.querySelectorAll<HTMLButtonElement>('.preset-chip');
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const presetId = chip.dataset.preset;
        const found = BAKERY_PRESETS.find(p => p.id === presetId);
        if (found) {
          this.currentRecipe = JSON.parse(JSON.stringify(found));
          this.targetMargin = this.currentRecipe.defaultTargetMargin;
          (document.getElementById('margin-range-slider') as HTMLInputElement).value = this.targetMargin.toString();
          this.render();
          this.showToast(`Loaded ${found.title}`);
        }
      });
    });

    // Multiplier buttons
    const scaleBtns = document.querySelectorAll<HTMLButtonElement>('.scale-btn');
    scaleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        scaleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMultiplier = parseFloat(btn.dataset.mult || '1.0');
        this.render();
        this.showToast(`Batch Scaled to ${this.currentMultiplier}x`);
      });
    });

    // Margin Range Slider
    const marginSlider = document.getElementById('margin-range-slider') as HTMLInputElement;
    if (marginSlider) {
      marginSlider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        this.targetMargin = val;
        document.getElementById('slider-margin-display')!.textContent = `${val}%`;
        this.render(false); // don't full re-render DOM inputs while dragging

        // Celebrate reaching 70%+ margin
        if (val >= 70 && this.lastFiredConfettiMargin < 70) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#D97706', '#2D6A4F', '#10B981', '#FEF3C7']
          });
        }
        this.lastFiredConfettiMargin = val;
      });
    }

    // Nav Pills Tab Scrolling
    const navPills = document.querySelectorAll<HTMLButtonElement>('.nav-pill-btn');
    navPills.forEach(pill => {
      pill.addEventListener('click', () => {
        navPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const tab = pill.dataset.tab;
        if (tab === 'dashboard') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tab === 'scaler') {
          document.getElementById('recipe-scaler-card')?.scrollIntoView({ behavior: 'smooth' });
        } else if (tab === 'margins') {
          document.querySelector('.kpi-grid')?.scrollIntoView({ behavior: 'smooth' });
        } else if (tab === 'label') {
          document.getElementById('fda-label-card')?.scrollIntoView({ behavior: 'smooth' });
        } else if (tab === 'drops') {
          document.getElementById('social-drops-card')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Social Tab switching
    const socialBtns = document.querySelectorAll<HTMLButtonElement>('.social-tab-btn');
    socialBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        socialBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSocialTab = (btn.dataset.social as any) || 'instagram';
        this.renderSocialCopy();
      });
    });

    // Copy Social Announcement
    document.getElementById('btn-copy-social')?.addEventListener('click', () => {
      const text = document.getElementById('social-copy-content')?.innerText || '';
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Copied announcement to clipboard! 📋');
      });
    });

    // Print Label
    document.getElementById('btn-print-label')?.addEventListener('click', () => {
      window.print();
    });

    // Copy Label
    document.getElementById('btn-copy-label')?.addEventListener('click', () => {
      const label = gemmaBaker.generateComplianceLabel(this.currentRecipe, this.currentMultiplier, this.bakeryName);
      const text = `${this.bakeryName.toUpperCase()}\n${this.currentRecipe.title.toUpperCase()}\n${label.netWeightFormatted}\nINGREDIENTS: ${label.descendingIngredients}\n${label.allergenWarningStatement}\n${label.mandatoryCottageNotice}\n${label.batchNumber} | ${label.packedDate}`;
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('FDA Label text copied! 🏷️');
      });
    });

    // Add Ingredient Item
    document.getElementById('btn-add-ingredient')?.addEventListener('click', () => {
      const name = prompt('Ingredient name (e.g. Organic Walnuts):', 'Organic Pecans');
      if (!name) return;
      const gramsStr = prompt('Weight in grams for 1x batch:', '80');
      const grams = parseFloat(gramsStr || '0') || 50;
      const costStr = prompt('Ingredient cost for 1x batch ($):', '1.75');
      const cost = parseFloat(costStr || '0') || 1.50;
      const allergenStr = prompt('Allergens if any (e.g. Tree Nuts, Milk, Wheat, Soy):', 'Tree Nuts');
      const allergens = allergenStr ? allergenStr.split(',').map(s => s.trim()).filter(Boolean) : [];

      const newIng: Ingredient = {
        id: `custom-ing-${Date.now()}`,
        name,
        grams,
        cost,
        allergens
      };

      this.currentRecipe.ingredients.push(newIng);
      this.render();
      this.showToast(`Added ${name} to recipe!`);
    });
  }

  public render(fullRebuild: boolean = true): void {
    const costData = costEngine.calculate(this.currentRecipe, this.currentMultiplier, this.targetMargin);
    const labelData = gemmaBaker.generateComplianceLabel(this.currentRecipe, this.currentMultiplier, this.bakeryName);
    const advice = gemmaBaker.getScalingAdvice(this.currentRecipe, this.currentMultiplier);

    // 1. Update KPI Cards
    this.renderKPIs(costData);

    // 2. Update Breakdown Meter & Legend
    this.renderBreakdownMeters(costData);

    // 3. Update Recipe Title & Description
    document.getElementById('current-recipe-title')!.textContent = this.currentRecipe.title;
    document.getElementById('current-recipe-desc')!.textContent = this.currentRecipe.description;

    // 4. Update Ingredients Table (if full rebuild)
    if (fullRebuild) {
      this.renderIngredientsTable();
      this.renderPackagingAndLabor(costData);
    }

    // 5. Update Gemma Advisor Box
    this.renderGemmaAdvisor(advice);

    // 6. Update FDA Cottage Label
    this.renderFDALabel(labelData);

    // 7. Update Social Drop Copy
    this.renderSocialCopy();
  }

  private renderKPIs(data: CostBreakdownResult): void {
    // Margin Card
    const marginValEl = document.getElementById('kpi-margin-value')!;
    marginValEl.textContent = `${data.actualGrossMarginPercent}%`;
    const badgeEl = document.getElementById('margin-badge')!;
    badgeEl.textContent = `${data.actualGrossMarginPercent}% ${data.marginHealthStatus}`;
    badgeEl.style.backgroundColor = data.marginHealthStatus === 'Healthy' ? '#10B981' : data.marginBadgeColor;

    // Retail Price Card
    const retailEl = document.getElementById('kpi-retail-price')!;
    retailEl.textContent = `$${data.suggestedRetailUnitPrice.toFixed(2)}`;
    const unitLabelEl = document.getElementById('kpi-unit-label')!;
    unitLabelEl.textContent = `/ ${data.unitLabel.split(' ')[0]}`;
    document.getElementById('kpi-batch-revenue')!.textContent = 
      `Batch Revenue: $${data.totalBatchRevenue.toFixed(2)} (${data.totalYieldUnits} Units)`;

    // Prime Cost Card
    document.getElementById('kpi-unit-cost')!.textContent = `$${data.unitTotalCost.toFixed(2)}`;
    document.getElementById('kpi-batch-cost')!.textContent = 
      `Total Batch Outlay: $${data.totalPrimeCost.toFixed(2)}`;

    // Baker Net Wage Card
    document.getElementById('kpi-hourly-wage')!.textContent = `$${data.effectiveHourlyTakeHome.toFixed(2)}`;
    document.getElementById('kpi-profit-takehome')!.textContent = 
      `Net Profit: $${data.totalBatchGrossProfit.toFixed(2)} + $${data.laborCostTotal.toFixed(2)} Labor`;
  }

  private renderBreakdownMeters(data: CostBreakdownResult): void {
    const totalRev = Math.max(1, data.totalBatchRevenue);
    const ingPct = Math.min(100, (data.ingredientCostTotal / totalRev) * 100);
    const pkgPct = Math.min(100, (data.packagingCostTotal / totalRev) * 100);
    const lbrPct = Math.min(100, ((data.laborCostTotal + data.overheadCostTotal) / totalRev) * 100);
    const pftPct = Math.max(0, 100 - (ingPct + pkgPct + lbrPct));

    document.getElementById('slice-ing')!.style.width = `${ingPct.toFixed(1)}%`;
    document.getElementById('slice-pkg')!.style.width = `${pkgPct.toFixed(1)}%`;
    document.getElementById('slice-lbr')!.style.width = `${lbrPct.toFixed(1)}%`;
    document.getElementById('slice-pft')!.style.width = `${pftPct.toFixed(1)}%`;

    document.getElementById('legend-ing-val')!.textContent = `$${data.ingredientCostTotal.toFixed(2)} (${ingPct.toFixed(0)}%)`;
    document.getElementById('legend-pkg-val')!.textContent = `$${data.packagingCostTotal.toFixed(2)} (${pkgPct.toFixed(0)}%)`;
    document.getElementById('legend-lbr-val')!.textContent = `$${(data.laborCostTotal + data.overheadCostTotal).toFixed(2)} (${lbrPct.toFixed(0)}%)`;
    document.getElementById('legend-pft-val')!.textContent = `$${data.totalBatchGrossProfit.toFixed(2)} (${pftPct.toFixed(0)}%)`;
  }

  private renderIngredientsTable(): void {
    const tbody = document.getElementById('ingredients-tbody')!;
    tbody.innerHTML = '';

    this.currentRecipe.ingredients.forEach((ing, index) => {
      const scaledGrams = Math.round(ing.grams * this.currentMultiplier);
      const scaledCost = (ing.cost * this.currentMultiplier).toFixed(2);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="ingredient-name-cell">${ing.name}</div>
          ${ing.subIngredients ? `<div class="ingredient-subtext">${ing.subIngredients}</div>` : ''}
          ${ing.allergens.length > 0 ? ing.allergens.map(a => `<span class="allergen-tag">⚠️ ${a}</span>`).join('') : ''}
        </td>
        <td style="text-align: right;">
          <input type="number" class="gram-input-pill" data-index="${index}" value="${scaledGrams}" min="1" step="1" />g
        </td>
        <td style="text-align: right;">
          $<input type="number" class="cost-input-pill" data-index="${index}" value="${scaledCost}" min="0.01" step="0.05" />
        </td>
        <td>
          <span style="font-size: 11px; color: ${ing.allergens.length ? '#EF4444' : '#10B981'}; font-weight: 700;">
            ${ing.allergens.length ? ing.allergens.join(', ') : 'None'}
          </span>
        </td>
      `;

      // Live editing of grams and cost
      const gramInput = tr.querySelector('.gram-input-pill') as HTMLInputElement;
      gramInput.addEventListener('change', (e) => {
        const newScaledGrams = parseFloat((e.target as HTMLInputElement).value) || 0;
        this.currentRecipe.ingredients[index].grams = newScaledGrams / this.currentMultiplier;
        this.render(false);
      });

      const costInput = tr.querySelector('.cost-input-pill') as HTMLInputElement;
      costInput.addEventListener('change', (e) => {
        const newScaledCost = parseFloat((e.target as HTMLInputElement).value) || 0;
        this.currentRecipe.ingredients[index].cost = newScaledCost / this.currentMultiplier;
        this.render(false);
      });

      tbody.appendChild(tr);
    });
  }

  private renderPackagingAndLabor(data: CostBreakdownResult): void {
    const pkgList = document.getElementById('packaging-items-list')!;
    pkgList.innerHTML = '';

    this.currentRecipe.packaging.forEach(pkg => {
      const totalQty = Math.round(pkg.quantity * this.currentMultiplier);
      const totalCost = (pkg.unitCost * totalQty).toFixed(2);
      const row = document.createElement('div');
      row.className = 'micro-row';
      row.innerHTML = `
        <span class="label">${pkg.name} (${totalQty}x):</span>
        <span class="value">$${totalCost}</span>
      `;
      pkgList.appendChild(row);
    });

    const scaledMinutes = Math.round(this.currentRecipe.activeLaborMinutes * (1 + (this.currentMultiplier - 1) * 0.45));
    document.getElementById('labor-minutes-val')!.textContent = `${scaledMinutes} mins (${this.currentMultiplier}x batch)`;
    document.getElementById('labor-wage-val')!.textContent = `$${this.currentRecipe.bakerHourlyWage.toFixed(2)} / hr`;
    document.getElementById('oven-overhead-val')!.textContent = `$${data.overheadCostTotal.toFixed(2)}`;
  }

  private renderGemmaAdvisor(advice: any): void {
    const textEl = document.getElementById('gemma-advisor-text')!;
    let hydrationNote = advice.hydrationPercentage 
      ? `Hydration calculated at ${advice.hydrationPercentage}%. ` 
      : '';
    textEl.textContent = `${hydrationNote}${advice.fermentationBakeTip}`;

    const warningBox = document.getElementById('gemma-warning-box')!;
    if (advice.mixerCapacityWarning) {
      warningBox.innerHTML = `<div class="warning-callout">${advice.mixerCapacityWarning}</div>`;
    } else {
      warningBox.innerHTML = '';
    }
  }

  private renderFDALabel(data: GeneratedLabelData): void {
    document.getElementById('label-bakery-name')!.textContent = this.bakeryName.toUpperCase();
    document.getElementById('label-recipe-title')!.textContent = this.currentRecipe.title.toUpperCase();
    document.getElementById('label-net-weight')!.textContent = data.netWeightFormatted;
    document.getElementById('label-descending-ingredients')!.textContent = data.descendingIngredients;
    document.getElementById('label-allergen-statement')!.textContent = data.allergenWarningStatement;
    document.getElementById('label-cottage-warning')!.textContent = data.mandatoryCottageNotice;
    document.getElementById('label-batch-code')!.textContent = `BATCH: ${data.batchNumber}`;
    document.getElementById('label-pack-date')!.textContent = `PACKED: ${data.packedDate.toUpperCase()}`;
  }

  private renderSocialCopy(): void {
    const costData = costEngine.calculate(this.currentRecipe, this.currentMultiplier, this.targetMargin);
    const socialData = gemmaBaker.generateSocialDropCopy(
      this.currentRecipe,
      this.currentMultiplier,
      costData.suggestedRetailUnitPrice,
      costData.totalYieldUnits,
      this.bakeryName
    );

    const box = document.getElementById('social-copy-content')!;
    if (this.activeSocialTab === 'instagram') {
      box.textContent = `${socialData.instagramDropPost}\n\n${socialData.hashtags.join(' ')}`;
    } else if (this.activeSocialTab === 'chalkboard') {
      box.textContent = socialData.chalkboardMenuCopy;
    } else {
      box.textContent = socialData.dmPreorderMessage;
    }
  }

  private showToast(msg: string): void {
    const toast = document.getElementById('toast')!;
    document.getElementById('toast-msg')!.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  new BakeCraftApp();
});
