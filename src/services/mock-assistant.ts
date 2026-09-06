import { ILLUSTRATIVE_DISCLAIMER } from "../data/components";
import { getMaterial } from "../data/materials";
import { safetyFactor } from "../lib/engineering";
import type { AIInsight, AssistantResponse, Component, Hotspot, ModelKind } from "../types/engineering";
import { waitForMockResponse } from "./abort";

export interface EngineeringAssistantProvider {
  respond(component: Component, prompt: string, selectedHotspotId?: string, signal?: AbortSignal): Promise<AssistantResponse>;
}

export const ASSISTANT_ACTIONS = [
  { id: "explain", label: "Explain component", prompt: "Explain this component and its key features." },
  { id: "critical", label: "Find critical areas", prompt: "Show the critical areas and explain the stress concentrations." },
  { id: "alternatives", label: "Suggest materials", prompt: "Suggest alternative materials and explain the trade-offs." },
  { id: "manufacturing", label: "Manufacturing process", prompt: "Explain the manufacturing process and inspection plan." },
  { id: "failure", label: "Failure modes", prompt: "What are the likely failure modes and how can they be prevented?" },
  { id: "optimize", label: "Optimize design", prompt: "How would you optimize this design without compromising its function?" },
] as const;

export type AssistantActionId = typeof ASSISTANT_ACTIONS[number]["id"];
type Intent = AssistantActionId | "diameter" | "unknown";

function detectIntent(prompt: string): Intent {
  const text = prompt.toLowerCase().trim();
  if (/diameter|\bdiam\b|\bø\s*\d/.test(text) && /reduc|decreas|smaller|shrink|thinner|\bfrom\b|\bto\s*\d/.test(text)) return "diameter";
  if (/\bmanufactur|\bprocess|\bmachin|\binspect|\bgrind|\bforg|heat.?treat|carburiz|nitrid|\bfabricat|\bhow.*made/.test(text)) return "manufacturing";
  if (/alternativ|substitut|compar.*material|material.*compar|which material|material selection|\breplace.*steel|\bcheaper material/.test(text)) return "alternatives";
  if (/\bfail|\bbreak|\bfractur|\bcrack|\bprevent|\bfatigue life/.test(text)) return "failure";
  if (/optimi[sz]|\bimprov|\bredesign|\breduce.*(?:cost|mass|weight)|\blighter/.test(text)) return "optimize";
  if (/\bcritical|\bstress|\bweak|\bsafety factor|\bhigh.?risk|\bdanger/.test(text)) return "critical";
  if (/\bexplain|\boverview|\bsummar|\bdescribe|\bwhat (?:is|does|are) (?:this|the (?:component|part|feature))|\bhow.*work|\bthermal|\btemperature|\bheating|\bwear/.test(text)) return "explain";
  return "unknown";
}

const optimizationAdvice: Record<ModelKind, string> = {
  shaft: "Blend the shoulder fillet within the mating bearing chamfer, retain journal stiffness and spline engagement, and remove mass only from low-stress regions after torsional and bending checks. Better finish and lubrication may improve fatigue more economically than a stronger alloy.",
  spindle: "Prioritize taper seating, bearing spacing, and balanced rotating mass before increasing core strength. Use symmetric cooling and controlled warm-up to reduce thermal drift; preserve the nitrided layer when improving surface finish.",
  coil: "Keep the copper turn pitch and steel workpiece gap uniform, provide terminal strain relief, and validate water flow before increasing power. Tune frequency and dwell using measured workpiece temperature rather than heating the copper harder.",
  planetary: "Improve carrier pin position and planet load sharing before adding tooth mass. Qualify modest flank relief and adequate oil delivery; verify root bending and contact fatigue separately with the mating ring gear included.",
  rotor: "Balance the complete rotor in two planes, preserve lamination insulation, and reduce losses through qualified cage and cooling changes. Check shaft critical speeds and hot interference before thinning the rotor or raising operating speed.",
  housing: "Blend rib junctions and remove material only where stiffness and casting solidification allow. Machine the seat in a service-representative clamp state and correct soft foot before tightening the bore tolerance.",
  coupling: "Reduce shaft misalignment and set the insert's axial gap before changing elastomer hardness. Radius the hub slot, verify aluminum bearing pressure under the steel fasteners, and keep clamp friction capacity above the actual torque demand.",
  gear: "Optimize tooth-root blending, modest tip relief, and flank finish against the actual load spectrum. Retain effective carburized case depth and improve oil delivery before reducing face width or choosing a cheaper core steel.",
  bearing: "Optimize operating clearance, lubricant viscosity, cleanliness, and mounting alignment rather than simply selecting a higher yield-strength steel. Use a rated bearing life calculation and thermal balance before changing ball size or ring sections.",
};

const diameterCautions: Record<ModelKind, string> = {
  shaft: "Recheck journal fits, shoulder notches, spline torque capacity, and bending deflection.",
  spindle: "The spindle has a drawbar bore and taper; hollow-section inertia, tool seating, bearing fits, and critical speed must be recomputed.",
  coil: "Changing copper tube diameter affects conductor resistance and coolant flow; changing coil diameter affects the steel workpiece gap, electromagnetic coupling, and electrical clearance.",
  planetary: "Sun and planet diameters are constrained by module, tooth count, center distance, and the mating ring gear; recalculate mesh geometry and contact capacity.",
  rotor: "Rotor diameter affects air gap, electromagnetic torque, hoop stress, balance, and cooling; a local shaft change needs its own rotating-bending and critical-speed model.",
  housing: "The bearing bore diameter is a mating interface, while outer diameter sets wall stiffness and casting behavior; changing either requires a fit and deformation analysis.",
  coupling: "The shaft bore, hub wall, jaws, and polymer insert are distinct dimensions; check fit, clamp capacity, aluminum hub fatigue, and insert strain separately.",
  gear: "Pitch diameter follows tooth count and module; changing it changes ratio or center distance and requires a new bending/contact calculation and mating gear.",
  bearing: "Bore, outer-ring diameter, and ball diameter are separate fit and contact parameters; changing them requires a rated bearing selection and clearance/contact-life analysis.",
};

function staticFactorText(component: Component): string {
  const factor = safetyFactor(component);
  return factor === Infinity ? "unbounded at zero modeled stress" : factor.toFixed(2);
}

function buildResponse(component: Component, prompt: string, selectedHotspotId?: string): AssistantResponse {
  const intent = detectIntent(prompt);
  const selected = component.hotspots.find((hotspot) => hotspot.id === selectedHotspotId);
  const critical = component.hotspots.find((hotspot) => hotspot.name === component.analysis.criticalArea)
    ?? component.hotspots.find((hotspot) => hotspot.criticality === "High")
    ?? component.hotspots[0];
  const focus = selected ?? critical;
  const title = `${component.name} (${component.partNumber})`;
  const assumptions = [
    ILLUSTRATIVE_DISCLAIMER,
    "This is a deterministic local mock assistant, not a live language model, simulation solver, or certification service.",
    "Strength and equivalent stress are in MPa. The static safety factor is material yield strength divided by the listed equivalent stress; it does not predict fatigue, buckling, contact life, or assembly capacity.",
    "Focus actions use model-local hotspot coordinates. The schematic model is not dimensional CAD.",
  ];
  if (selectedHotspotId && !selected) assumptions.push(`Selected hotspot '${selectedHotspotId}' was not found on this component; the stale reference was ignored.`);
  if (component.modelKind === "coil") {
    assumptions.push("The copper coil is water-cooled below approximately 80 °C. The 820 °C peak and 120 °C/s heating rate belong to the separate steel workpiece; the 32 MPa stress belongs to copper.");
  }
  if (["rotor", "coupling", "planetary", "bearing"].includes(component.modelKind)) {
    assumptions.push("The primary material does not describe every body in this assembly. Separate materials, contact loads, and failure criteria apply to inserts, cages, pins, laminations, and fasteners.");
  }

  function response(message: string, requested: (Hotspot | undefined)[] = [focus], categories: AIInsight["category"][] = []): AssistantResponse {
    const candidates = component.insights.filter((insight) => !categories.length || categories.includes(insight.category));
    const ranked = [...candidates].sort((a, b) => Number(b.hotspotId === selected?.id) - Number(a.hotspotId === selected?.id));
    const insights = ranked.slice(0, 3).map((insight) => ({ ...insight }));
    const validIds = new Set(component.hotspots.map((hotspot) => hotspot.id));
    const referencedHotspotIds = [...new Set([
      ...requested.map((hotspot) => hotspot?.id),
      selected?.id,
      ...insights.map((insight) => insight.hotspotId),
    ].filter((id): id is string => Boolean(id && validIds.has(id))))];
    return {
      message,
      referencedHotspotIds,
      insights: insights.filter((insight) => !insight.hotspotId || validIds.has(insight.hotspotId)),
      actions: referencedHotspotIds.map((hotspotId) => ({ type: "focus", hotspotId })),
      assumptions,
    };
  }

  const feature = focus
    ? `${focus.name}: ${focus.description} Surface finish: ${focus.surfaceFinish}. Tolerance: ${focus.tolerance}.`
    : "No inspectable hotspot is recorded for this component.";

  if (intent === "diameter") {
    if (component.modelKind !== "shaft") {
      return response(`${title} is not a uniform solid circular shaft, so I cannot apply the shaft diameter-reduction rule to this assembly. ${diameterCautions[component.modelKind]} Keep the existing interfaces until a geometry-specific analysis is available.`, [focus], ["Geometry", "Thermal", "Material"]);
    }
    const text = prompt.toLowerCase();
    const percent = text.match(/(-?\d+(?:\.\d+)?)\s*(?:%|percent)/);
    const fromTo = text.match(/from\s*(-?\d+(?:\.\d+)?)\s*(?:mm|millimet(?:er|re)s?)?\s*to\s*(-?\d+(?:\.\d+)?)\s*(?:mm|millimet(?:er|re)s?)/);
    const byMm = text.match(/by\s*(-?\d+(?:\.\d+)?)\s*(?:mm|millimet(?:er|re)s?)/);
    const toMm = text.match(/to\s*(-?\d+(?:\.\d+)?)\s*(?:mm|millimet(?:er|re)s?)/);
    const originalDiameter = fromTo ? Number(fromTo[1]) : component.diameter;
    let reduction = 0.1;
    if (fromTo) reduction = 1 - Number(fromTo[2]) / originalDiameter;
    else if (percent) reduction = /to\s*-?\d+(?:\.\d+)?\s*(?:%|percent)/.test(text) ? 1 - Number(percent[1]) / 100 : Number(percent[1]) / 100;
    else if (byMm) reduction = Number(byMm[1]) / originalDiameter;
    else if (toMm) reduction = 1 - Number(toMm[1]) / originalDiameter;
    else assumptions.push("No numeric reduction was supplied; a 10% diameter reduction is used only as an illustrative example.");
    if (!Number.isFinite(originalDiameter) || originalDiameter <= 0 || !Number.isFinite(reduction) || reduction <= 0 || reduction >= 1) {
      return response(`${title}: specify a reduction strictly between 0 and 100%, leaving a positive diameter smaller than the starting diameter. I have not calculated a strength or mass change for this invalid reduction. ${diameterCautions.shaft}`, [focus], ["Geometry"]);
    }
    const ratio = 1 - reduction;
    const stressMultiplier = 1 / ratio ** 3;
    const newStress = component.analysis.maxStress * stressMultiplier;
    const newFactor = safetyFactor(component) * ratio ** 3;
    assumptions.push("Conditional solid circular-section estimate with unchanged loads, length, material, support conditions, and stress-concentration factor. Stress scales with 1/d³, section mass with d², and bending/torsional stiffness with d⁴. This is not an updated finite-element solution.");
    assumptions.push("The reduction is applied to the load-carrying section as an idealized uniform scale. Local section mass savings are not total assembly mass savings; real steps, splines, threads, and bearings remain separate constraints.");
    if (fromTo && originalDiameter !== component.diameter) {
      assumptions.push(`The prompt specifies a ${originalDiameter} mm starting section rather than the listed ${component.diameter} mm main diameter; the recorded stress is reused only for a conditional sensitivity estimate.`);
    }
    return response(`${title}: reducing a solid circular section by ${(reduction * 100).toFixed(1)}% (${originalDiameter.toFixed(1)} → ${(originalDiameter * ratio).toFixed(1)} mm) increases bending/torsional stress by ${((stressMultiplier - 1) * 100).toFixed(1)}% at unchanged load. The illustrative peak would change from ${component.analysis.maxStress} to ${newStress.toFixed(1)} MPa, and the static yield safety factor from ${staticFactorText(component)} to ${Number.isFinite(newFactor) ? newFactor.toFixed(2) : "unbounded at zero modeled stress"}.\n\nLocal solid-section mass falls by ${((1 - ratio ** 2) * 100).toFixed(1)}%, but bending/torsional stiffness falls by ${((1 - ratio ** 4) * 100).toFixed(1)}%. ${diameterCautions.shaft} Fatigue margin, critical speed, and deflection need a fresh load-specific check before accepting the change.`, [focus, critical], ["Geometry", "Material"]);
  }

  if (intent === "manufacturing") {
    const route = component.manufacturingProcess.map((step, index) => `${index + 1}. ${step.name}: ${step.purpose} Target: ${step.tolerance}. Inspection: ${step.inspection}`).join("\n");
    const thermalContext = component.modelKind === "coil" ? `\n\nThermal distinction: ${component.analysis.thermalExplanation}` : "";
    return response(`${title} uses ${component.material.name}. ${component.material.condition}\n\n${route}\n\nFeature to verify: ${feature}${thermalContext}`, [focus, critical], ["Manufacturing", "Inspection"]);
  }

  if (intent === "alternatives") {
    const alternatives = component.material.alternatives.map(getMaterial).filter((material) => material !== undefined);
    const options = alternatives.length
      ? alternatives.map((material) => `• ${material.name}: illustrative yield ${material.yieldStrength} MPa versus ${component.material.yieldStrength} MPa for the current material; relative cost index ${material.costIndex.toFixed(2)} versus ${component.material.costIndex.toFixed(2)}. ${material.description} ${material.condition}`).join("\n")
      : "No qualified material alternatives are recorded in this illustrative catalog; obtain application-specific candidates rather than assuming a drop-in replacement.";
    return response(`${title} currently uses ${component.material.name} (${component.material.hardness}). Candidate materials for further evaluation:\n\n${options}\n\nThese are not interchangeable approved substitutes. Requalify heat treatment, machinability, surface condition, fit, fatigue, and inspection; the cost index is relative raw material, not a finished-part quote. ${component.modelKind === "coil" ? "For this copper coil, electrical conductivity, brazeability, and water-cooling capacity matter more than maximizing yield strength." : optimizationAdvice[component.modelKind]}`, [focus, critical], ["Material", "Manufacturing"]);
  }

  if (intent === "failure") {
    const localModes = selected ? component.failureModes.filter((failure) => failure.hotspotId === selected.id) : [];
    const modes = localModes.length ? localModes : component.failureModes.slice(0, 3);
    const details = modes.map((failure) => `• ${failure.name}: ${failure.cause} Prevention: ${failure.prevention}`).join("\n");
    if (selected && !localModes.length) assumptions.push(`No dedicated failure mode is recorded for ${selected.name}; the answer lists component-level risks rather than inventing a local mechanism.`);
    return response(`${title}: ${localModes.length ? `recorded risks at ${selected!.name}` : "principal illustrative failure modes"}.\n\n${details || "No failure modes are recorded; a qualified FMEA is needed for the actual duty."}\n\nMaterial context: ${component.material.name}, ${component.material.hardness}. Wear assessment: ${component.analysis.wearExplanation} No time-to-failure is predicted without a load spectrum, environment, and validated fatigue/contact data.`, modes.map((failure) => component.hotspots.find((hotspot) => hotspot.id === failure.hotspotId)), ["Inspection", "Material"]);
  }

  if (intent === "critical") {
    const levels = { High: 3, Medium: 2, Low: 1 };
    const hotspots = [...component.hotspots].sort((a, b) => levels[b.criticality] - levels[a.criticality]).slice(0, 3);
    const areas = hotspots.map((hotspot) => `• ${hotspot.name} — ${hotspot.criticality} criticality: ${hotspot.description}`).join("\n");
    return response(`${title}: the recorded peak region is ${component.analysis.criticalArea}, with ${component.analysis.maxStress} MPa illustrative equivalent stress. ${component.analysis.stressExplanation}\n\n${areas}\n\nUsing ${component.material.name} at ${component.material.yieldStrength} MPa yield strength gives a static safety factor of ${staticFactorText(component)}. This is not a fatigue or contact-life rating. ${selected ? `Selected feature: ${feature}` : `Thermal context: ${component.analysis.thermalExplanation}`}`, [critical, ...hotspots, selected], ["Geometry", "Inspection"]);
  }

  if (intent === "optimize") {
    const localInsights = component.insights.filter((insight) => insight.hotspotId === focus?.id).slice(0, 2);
    const detail = localInsights.map((insight) => `${insight.title}: ${insight.description}`).join(" ");
    return response(`${title}: optimize for the actual duty rather than just maximizing a material score. ${optimizationAdvice[component.modelKind]}\n\nCurrent baseline: ${component.material.name}, ${component.overallLength} mm listed envelope, ${component.diameter} mm principal diameter, ${component.weight} kg, and ${component.analysis.maxStress} MPa illustrative peak stress (static safety factor ${staticFactorText(component)}).\n\n${focus ? `Start at ${focus.name}. ` : ""}${detail}\n\nKeep ${component.tolerance} as the current interface constraint. Re-run geometry-specific stress, fatigue/contact, thermal, and inspection checks before accepting a mass or cost reduction.`, [focus, critical], ["Geometry", "Material", "Thermal"]);
  }

  if (intent === "explain") {
    return response(`${title}. ${component.description}\n\nMaterial: ${component.material.name}; illustrative yield ${component.material.yieldStrength} MPa and hardness ${component.material.hardness}. Listed geometry: ${component.overallLength} mm overall envelope, ${component.diameter} mm principal diameter, ${component.weight} kg.\n\n${feature}\n\n${component.analysis.thermalExplanation} ${component.analysis.wearExplanation}`, [focus], ["Geometry", "Material", "Thermal"]);
  }

  return response(`${title}: I cannot answer that reliably from this local engineering dataset. I can explain this component or a selected feature, identify critical areas, suggest material alternatives, review manufacturing and inspection, discuss recorded failure modes, or outline design optimization. For shaft diameter changes, provide a percentage or a change in millimetres.\n\nAvailable context: ${component.material.name}; ${component.analysis.criticalArea} is the recorded critical region. ${feature}`, [focus], ["Geometry"]);
}

export class MockEngineeringAssistantProvider implements EngineeringAssistantProvider {
  constructor(private readonly latencyMs = 80) {
    if (!Number.isFinite(latencyMs) || latencyMs < 0) throw new RangeError("Mock latency must be a nonnegative finite number.");
  }

  async respond(component: Component, prompt: string, selectedHotspotId?: string, signal?: AbortSignal): Promise<AssistantResponse> {
    await waitForMockResponse(this.latencyMs, signal);
    if (signal?.aborted) throw new DOMException("The engineering request was cancelled.", "AbortError");
    return buildResponse(component, prompt, selectedHotspotId);
  }
}

export const mockAssistant: EngineeringAssistantProvider = new MockEngineeringAssistantProvider();
