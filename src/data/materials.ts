import type { Material } from "../types/engineering";

export const materials: Material[] = [
  {
    id: "aisi-4140", name: "AISI 4140 alloy steel", family: "Alloy steel",
    description: "Chromium-molybdenum steel for torque-carrying shafts; balances core toughness, fatigue strength, and machinability.",
    condition: "Illustrative quenched-and-tempered condition, 28–32 HRC; properties depend on section size and heat treatment.",
    density: 7850, tensileStrength: 850, yieldStrength: 655, hardness: "28–32 HRC",
    costIndex: 1, wearResistance: 6, fatigueResistance: 7, alternatives: ["aisi-4340", "aisi-1045"],
  },
  {
    id: "aisi-4340", name: "AISI 4340 alloy steel", family: "Alloy steel",
    description: "Nickel-chromium-molybdenum steel with through-section hardenability and higher illustrative core strength than the 4140 baseline.",
    condition: "Illustrative oil-quenched and tempered condition, 34–38 HRC; verify toughness and temper temperature for the actual section.",
    density: 7850, tensileStrength: 1080, yieldStrength: 930, hardness: "34–38 HRC",
    costIndex: 1.48, wearResistance: 7, fatigueResistance: 8, alternatives: ["aisi-4140", "aisi-1045"],
  },
  {
    id: "nitriding-steel", name: "31CrMoV9 nitriding steel", family: "Alloy steel",
    description: "Nitriding steel for precision spindles; a tough tempered core supports a hard diffusion layer with limited final distortion.",
    condition: "Illustrative quenched-and-tempered core with finish-machined, plasma-nitrided journals; core strengths shown.",
    density: 7800, tensileStrength: 1000, yieldStrength: 800, hardness: "Core 30–34 HRC; surface 850–1000 HV",
    costIndex: 1.62, wearResistance: 9, fatigueResistance: 8, alternatives: ["aisi-4140", "aisi-4340"],
  },
  {
    id: "c10100-copper", name: "C10100 oxygen-free copper", family: "Copper alloy",
    description: "Highly conductive copper tube forms the water-cooled induction coil; the separate ferromagnetic steel workpiece receives most of the useful heating.",
    condition: "Illustrative annealed tube after forming and brazing; local work hardening and joints are not represented by a single strength value.",
    density: 8940, tensileStrength: 220, yieldStrength: 70, hardness: "45–65 HV",
    costIndex: 3.8, wearResistance: 2, fatigueResistance: 3, alternatives: ["c12200-copper"],
  },
  {
    id: "c12200-copper", name: "C12200 phosphorus-deoxidized copper", family: "Copper alloy",
    description: "Formable and brazeable copper tubing alternative; lower electrical conductivity than oxygen-free copper raises resistive loss for the same current.",
    condition: "Illustrative annealed tube; qualify conductivity, cooling capacity, and braze integrity for an induction application.",
    density: 8940, tensileStrength: 220, yieldStrength: 65, hardness: "45–65 HV",
    costIndex: 3.25, wearResistance: 2, fatigueResistance: 3, alternatives: ["c10100-copper"],
  },
  {
    id: "aisi-8620", name: "AISI 8620 carburizing steel", family: "Case-hardening steel",
    description: "Low-carbon nickel-chromium-molybdenum gear steel; a carburized case resists rolling/sliding contact while its tough core supports tooth bending.",
    condition: "Illustrative carburized, quenched and tempered gear; strengths are representative core values, not contact-pressure limits.",
    density: 7850, tensileStrength: 900, yieldStrength: 650, hardness: "Case 58–62 HRC; core 30–36 HRC",
    costIndex: 1.3, wearResistance: 9, fatigueResistance: 8, alternatives: ["16mncr5", "aisi-4340"],
  },
  {
    id: "16mncr5", name: "16MnCr5 case-hardening steel", family: "Case-hardening steel",
    description: "Manganese-chromium steel for small and medium carburized gears; an alternative when core hardenability and section size are verified.",
    condition: "Illustrative carburized and tempered condition; core strengths are screening inputs only.",
    density: 7850, tensileStrength: 850, yieldStrength: 590, hardness: "Case 58–62 HRC; core 28–34 HRC",
    costIndex: 1.12, wearResistance: 9, fatigueResistance: 7, alternatives: ["aisi-8620"],
  },
  {
    id: "aisi-1045", name: "AISI 1045 carbon steel", family: "Carbon steel",
    description: "Economical medium-carbon steel for rotor shafts and moderate-duty hubs; induction hardening can improve local surface durability.",
    condition: "Illustrative normalized bar with locally hardened journals; core strengths shown.",
    density: 7850, tensileStrength: 625, yieldStrength: 450, hardness: "Core 180–220 HB; local surface 50–55 HRC",
    costIndex: 0.76, wearResistance: 5, fatigueResistance: 5, alternatives: ["aisi-4140", "aisi-4340"],
  },
  {
    id: "en-gjs-500-7", name: "EN-GJS-500-7 ductile iron", family: "Cast iron",
    description: "Nodular graphite cast iron combines castability, vibration damping, and useful tensile ductility for a ribbed bearing housing.",
    condition: "Illustrative ferritic-pearlitic casting after stress relief; nominal grade name does not certify these example values.",
    density: 7100, tensileStrength: 500, yieldStrength: 320, hardness: "170–230 HB",
    costIndex: 0.68, wearResistance: 6, fatigueResistance: 5, alternatives: ["aisi-1045", "al-6061-t6"],
  },
  {
    id: "al-6061-t6", name: "6061-T6 aluminum alloy", family: "Aluminum alloy",
    description: "Light, machinable aluminum for coupling hubs; hardened washers and controlled fits protect softer contact surfaces.",
    condition: "Illustrative T6 wrought billet at room temperature; joining or sustained heat can reduce the temper strength.",
    density: 2700, tensileStrength: 310, yieldStrength: 275, hardness: "95 HB",
    costIndex: 1.15, wearResistance: 3, fatigueResistance: 4, alternatives: ["aisi-1045", "aisi-4140"],
  },
  {
    id: "aisi-52100", name: "AISI 52100 bearing steel", family: "Bearing steel",
    description: "Clean high-carbon chromium steel for bearing rings and balls; rolling-contact life is driven by inclusions, lubrication, and subsurface shear.",
    condition: "Illustrative through-hardened and tempered condition; yield is a representative proof-strength proxy, not a bearing load rating.",
    density: 7810, tensileStrength: 2000, yieldStrength: 1600, hardness: "60–64 HRC",
    costIndex: 1.75, wearResistance: 10, fatigueResistance: 9, alternatives: ["aisi-8620"],
  },
];

export function getMaterial(id: string): Material | undefined {
  return materials.find((material) => material.id === id);
}

export const MATERIAL_PROPERTY_UNITS = {
  density: "kg/m³",
  tensileStrength: "MPa",
  yieldStrength: "MPa",
  costIndex: "relative raw-material index; AISI 4140 = 1.00",
  wearResistance: "illustrative ordinal score, 1–10",
  fatigueResistance: "illustrative ordinal score, 1–10",
} as const;
