import type { Analysis } from "../types/engineering";

export const analysisData: Record<string, Analysis> = {
  "input-shaft": {
    maxStress: 248, criticalArea: "Shoulder fillet", maxTemperature: 86, heatingRate: 3.2, wearRisk: "Medium",
    stressExplanation: "Illustrative elastic equivalent stress under combined bending and torque peaks at the journal-to-body shoulder. The local notch increases alternating stress; 248 MPa is not a measured service load or fatigue limit.",
    wearExplanation: "Micromotion at the spline flanks and bearing seat can produce fretting if fits loosen or lubrication is contaminated. The polished journal is less tolerant of abrasive debris than its bulk hardness suggests.",
    thermalExplanation: "The 86 °C illustrative steady-state peak is near the bearing interface under warm oil operation. Axial growth changes bearing preload; 3.2 °C/s is a separate hypothetical initial warm-up rate, not sustained heating.",
  },
  "precision-spindle": {
    maxStress: 186, criticalArea: "Tool taper transition", maxTemperature: 62, heatingRate: 1.4, wearRisk: "Medium",
    stressExplanation: "Illustrative equivalent stress peaks where the tool taper enters the spindle body under radial cutting force and drawbar preload. Runout and bearing spacing affect deflection more directly than a higher core yield strength.",
    wearExplanation: "Tool-change debris can fret the taper, while excessive preload degrades the bearing journals. The nitrided diffusion layer supports wear resistance only while it remains intact after finish grinding.",
    thermalExplanation: "A 62 °C illustrative front-bearing zone produces axial growth relative to the machine frame. Controlled warm-up and symmetric cooling are more effective than assuming a perfectly rigid, isothermal spindle.",
  },
  "induction-coil": {
    maxStress: 32, criticalArea: "Brazed terminal junction", maxTemperature: 820, heatingRate: 120, wearRisk: "Low",
    stressExplanation: "The 32 MPa illustrative equivalent stress belongs to the copper terminal/coil under electromagnetic force and thermal expansion. It is not the stress in the steel workpiece and does not include detailed braze fatigue.",
    wearExplanation: "There is no intended sliding contact. Coolant erosion, scale buildup, and thermal-cycle cracking at the brazed terminals dominate instead of mechanical flank wear.",
    thermalExplanation: "820 °C and 120 °C/s refer to the separate AISI 1045 steel workpiece in a short illustrative heating pulse, not to the copper coil. Water cooling is assumed to hold the copper below approximately 80 °C; loss of flow requires an immediate power interlock.",
  },
  "planetary-gear": {
    maxStress: 310, criticalArea: "Sun tooth root", maxTemperature: 95, heatingRate: 2.8, wearRisk: "High",
    stressExplanation: "310 MPa is illustrative tooth-root equivalent bending stress with imperfect planet load sharing. It is not Hertzian contact pressure; pitting capacity requires a separate case-depth and contact-fatigue assessment.",
    wearExplanation: "Planet misalignment and unequal load sharing concentrate sliding near tooth tips. Thin oil film promotes micropitting despite a hard carburized case; carrier pin position and lubricant cleanliness are key controls.",
    thermalExplanation: "An illustrative 95 °C oil/mesh region reflects gear-mesh and planet-bearing losses in a compact enclosure. Oil circulation and housing heat rejection must be sized for the real speed and duty cycle.",
  },
  "rotor-assembly": {
    maxStress: 205, criticalArea: "Rotor-to-shaft transition", maxTemperature: 115, heatingRate: 4.6, wearRisk: "Medium",
    stressExplanation: "Illustrative shaft equivalent stress combines bending from residual unbalance with fit pressure at the rotor-stack shoulder. Lamination hoop stress, bar forces, and critical-speed behavior are separate checks.",
    wearExplanation: "Poor journal fits or cage imbalance can increase bearing wear. Rotor-stack fretting indicates a loss of interference; fan-to-shroud rub is a clearance issue rather than acceptable run-in.",
    thermalExplanation: "115 °C represents the illustrative rotor-stack hot region from electrical and aerodynamic losses, not a uniform shaft temperature. Differential expansion can reduce stack interference and change fan clearance.",
  },
  "bearing-housing": {
    maxStress: 96, criticalArea: "Bearing seat rib junction", maxTemperature: 72, heatingRate: 0.8, wearRisk: "Low",
    stressExplanation: "Illustrative equivalent stress peaks at the rib-to-bearing-seat junction under radial bearing reaction and mounting-bolt preload. Casting defects and local tensile stresses require checks beyond this nominal ductile-material screen.",
    wearExplanation: "The seat should not slide in normal operation. Outer-ring creep or abrasive contamination can enlarge the bore when the fit, base support, or temperature allowance is incorrect.",
    thermalExplanation: "A 72 °C illustrative seat temperature results from bearing heat conducted into the casting. The seat expands relative to a cooler base, potentially changing outer-ring clearance and bore ovality.",
  },
  "drive-coupling": {
    maxStress: 118, criticalArea: "Hub clamp-slot root", maxTemperature: 68, heatingRate: 2.1, wearRisk: "Medium",
    stressExplanation: "The 118 MPa illustrative equivalent stress applies to the aluminum hub at its clamp slot under torque and bolt preload. It does not represent the polyurethane insert or the steel bolts, which need different failure criteria.",
    wearExplanation: "Misalignment cycles the polyurethane insert in compression and shear. An overly tight axial gap accelerates insert heating, while insufficient clamp preload causes shaft-to-hub fretting.",
    thermalExplanation: "68 °C is an illustrative insert hot spot from cyclic hysteresis, not an aluminum melting or strength limit. Verify the actual elastomer's temperature and chemical ratings before selecting a duty cycle.",
  },
  "transmission-gear": {
    maxStress: 285, criticalArea: "Loaded tooth-root fillet", maxTemperature: 104, heatingRate: 3.6, wearRisk: "High",
    stressExplanation: "285 MPa is an illustrative tooth-root equivalent bending stress in the gear core under transmitted torque. Surface contact pressure is not shown and must not be compared directly with the listed core yield strength.",
    wearExplanation: "Sliding at the addendum and oil-film breakdown can initiate scuffing; repeated near-pitch-line contact promotes micropitting. Case depth, roughness, alignment, and lubricant viscosity all affect life.",
    thermalExplanation: "The 104 °C illustrative mesh temperature includes frictional heat in warm oil. Local flash temperature can be higher than the bulk value and needs a separate scuffing assessment.",
  },
  "precision-bearing": {
    maxStress: 620, criticalArea: "Inner race loaded track", maxTemperature: 78, heatingRate: 1.9, wearRisk: "High",
    stressExplanation: "620 MPa is illustrative subsurface equivalent stress below the inner-race contact, not peak Hertzian pressure or an official bearing rating. The displayed yield ratio is not an L10 rolling-contact fatigue life prediction.",
    wearExplanation: "Particle indentation and inadequate lubricant film seed raceway spalling. Excessive mounting interference reduces internal clearance and can add heat, skidding, and cage distress.",
    thermalExplanation: "78 °C is an illustrative inner-ring temperature under a steady radial load. Inner/outer ring gradients reduce operating clearance; grease viscosity and fill quantity affect frictional heating.",
  },
  "alloy-shaft": {
    maxStress: 248, criticalArea: "Shoulder fillet", maxTemperature: 86, heatingRate: 3.2, wearRisk: "Medium",
    stressExplanation: "The same geometry and illustrative bending/torque load as IS-1042 produce the same 248 MPa elastic equivalent stress. AISI 4340 raises the yield margin, but near-identical elastic modulus means it does not meaningfully reduce deflection.",
    wearExplanation: "A harder tempered core modestly improves resistance to fretting damage, but journal finish, spline lubrication, fit, and contamination remain primary controls. Higher bulk strength does not eliminate surface-origin fatigue.",
    thermalExplanation: "The 86 °C peak and 3.2 °C/s initial warm-up assumption match the 4140 comparison shaft. Similar thermal expansion means a material substitution alone does not correct bearing-preload drift.",
  },
};

export const ANALYSIS_UNITS = {
  maxStress: "MPa, illustrative equivalent stress",
  maxTemperature: "°C; see each component's thermal explanation for the affected body",
  heatingRate: "°C/s, illustrative initial transient",
} as const;
