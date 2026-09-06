import type { Component, Vec3 } from "../../types/engineering";

export interface ComponentFilters {
  query?: string;
  category?: string;
  material?: string;
  process?: string;
  application?: string;
  criticality?: string;
}

export type ComparisonPriority = "balance" | "strength" | "cost";

function normalize(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isUnfiltered(value: string): boolean {
  return !value || value === "all";
}

export function filterComponents(components: readonly Component[], filters: ComponentFilters = {}): Component[] {
  const normalizedQuery = normalize(filters.query);
  const query = normalizedQuery.split(/\s+/).filter(Boolean);
  const isIdentityQuery = Boolean(normalizedQuery) && components.some((component) =>
    normalize(component.id) === normalizedQuery || normalize(component.partNumber) === normalizedQuery,
  );
  const category = normalize(filters.category);
  const material = normalize(filters.material);
  const process = normalize(filters.process);
  const application = normalize(filters.application);
  const criticality = normalize(filters.criticality);

  return components.filter((component) => {
    if (isIdentityQuery && normalize(component.id) !== normalizedQuery && normalize(component.partNumber) !== normalizedQuery) return false;
    if (!isUnfiltered(category) && normalize(component.category) !== category) return false;
    if (!isUnfiltered(criticality) && normalize(component.criticality) !== criticality) return false;
    if (!isUnfiltered(material) && ![
      component.material.id, component.material.name, component.material.family,
    ].some((value) => normalize(value).includes(material))) return false;
    if (!isUnfiltered(process) && !component.manufacturingProcess.some((step) =>
      normalize(`${step.id} ${step.name} ${step.purpose}`).includes(process),
    )) return false;
    if (!isUnfiltered(application) && !component.applications.some((value) => normalize(value).includes(application))) return false;
    if (!query.length) return true;

    const searchable = normalize([
      component.id, component.name, component.partNumber, component.category, component.subtitle,
      component.description, component.material.id, component.material.name, component.material.family,
      ...component.applications,
      ...component.manufacturingProcess.flatMap((step) => [step.id, step.name, step.purpose]),
    ].join(" "));
    return query.every((term) => searchable.includes(term));
  });
}

export function measureDistance(a: Vec3, b: Vec3, mmPerUnit: number): number {
  if (!Number.isFinite(mmPerUnit) || mmPerUnit <= 0) {
    throw new RangeError("Millimetres per model unit must be a positive finite number.");
  }
  if (a.length !== 3 || b.length !== 3 || !a.every(Number.isFinite) || !b.every(Number.isFinite)) {
    throw new RangeError("Measurement points must contain three finite model-local coordinates.");
  }
  const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * mmPerUnit;
  if (!Number.isFinite(distance)) throw new RangeError("The measurement exceeds the supported numeric range.");
  return distance;
}

export function safetyFactor(component: Component): number {
  const strength = component.material.yieldStrength;
  const stress = component.analysis.maxStress;
  if (!Number.isFinite(strength) || strength <= 0 || !Number.isFinite(stress) || stress < 0) {
    throw new RangeError("Safety factor requires positive finite yield strength and nonnegative finite equivalent stress in MPa.");
  }
  return stress === 0 ? Infinity : strength / stress;
}

function factorText(value: number): string {
  return value === Infinity ? "unbounded at zero modeled stress" : value.toFixed(2);
}

export function compareComponents(a: Component, b: Component, priority: ComparisonPriority = "balance"): string {
  if (a.id === b.id) {
    return `${a.name} (${a.partNumber}) is the same component in both slots. Select a different component to compare material, static safety factor, and relative cost. This is an illustrative screening comparison only.`;
  }
  const aFactor = safetyFactor(a);
  const bFactor = safetyFactor(b);
  if (![a.material.costIndex, b.material.costIndex].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError("Comparison requires positive finite material cost indices.");
  }
  const summary = `${a.name} (${a.partNumber}, ${a.material.name}): yield ${a.material.yieldStrength} MPa, static safety factor ${factorText(aFactor)}, cost index ${a.material.costIndex.toFixed(2)}. ${b.name} (${b.partNumber}, ${b.material.name}): yield ${b.material.yieldStrength} MPa, static safety factor ${factorText(bFactor)}, cost index ${b.material.costIndex.toFixed(2)}.`;
  let recommendation: string;
  if (priority === "strength") {
    const winner = a.material.yieldStrength >= b.material.yieldStrength ? a : b;
    recommendation = a.material.yieldStrength === b.material.yieldStrength
      ? "Strength priority: both have the same listed material yield strength; geometry, fatigue, and the load case decide the useful margin."
      : `Strength priority favors ${winner.partNumber} for its higher listed material yield strength. The displayed safety factors apply only to each part's illustrative equivalent-stress case, not to certified fatigue life.`;
  } else if (priority === "cost") {
    const winner = a.material.costIndex <= b.material.costIndex ? a : b;
    recommendation = a.material.costIndex === b.material.costIndex
      ? "Cost priority: the relative raw-material cost index is equal; stock mass, process time, tooling, and inspection may still differ."
      : `Cost priority favors ${winner.partNumber} for its lower relative raw-material cost index. This is not a supplier quote or finished-part cost; heat treatment, grinding, inspection, stock mass, and scrap are excluded.`;
  } else {
    const aScore = a.material.yieldStrength / a.material.costIndex;
    const bScore = b.material.yieldStrength / b.material.costIndex;
    const winner = aScore >= bScore ? a : b;
    recommendation = aScore === bScore
      ? "Balanced priority: both tie on the stated yield-strength-per-material-cost-index screening metric. Use stiffness, fatigue qualification, and manufacturing constraints to choose."
      : `Balanced priority favors ${winner.partNumber} on a transparent yield-strength-per-material-cost-index metric (${a.partNumber}: ${aScore.toFixed(0)}; ${b.partNumber}: ${bScore.toFixed(0)}). This balances raw material strength and cost only; confirm stiffness, fatigue, and manufacturability separately.`;
  }
  const sameGeometry = a.modelKind === b.modelKind && a.overallLength === b.overallLength && a.diameter === b.diameter
    && JSON.stringify(a.dimensions) === JSON.stringify(b.dimensions);
  const context = sameGeometry
    ? "The listed geometry is identical; a strength increase alone does not imply higher elastic stiffness. Verify fits and the actual heat-treated condition before substitution."
    : "These parts have different geometry or different load cases and are not directly interchangeable; their safety factors are not a like-for-like performance ranking.";
  return `${summary}\n\n${recommendation}\n\n${context} All values are illustrative, not an approved design recommendation.`;
}
