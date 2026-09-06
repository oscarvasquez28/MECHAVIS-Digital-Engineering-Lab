import type { Component, EngineeringProperty, Hotspot } from "../types/engineering";
import { analysisData } from "./analysis";
import { manufacturingData } from "./manufacturing";
import { getMaterial } from "./materials";

export const ILLUSTRATIVE_DISCLAIMER = "Illustrative educational data and simplified geometry only; not certified material properties, official specifications, validated FEA, or production design guidance. Dimensions, loads, costs, and inspection targets are examples. Verify against approved drawings, material certificates, and qualified engineering analysis before real-world use.";
export const MODEL_MM_PER_UNIT = 50;

function defineComponent(input: Omit<Component, "material" | "manufacturingProcess" | "analysis" | "mechanicalProperties"> & {
  materialId: string;
  mechanicalProperties?: EngineeringProperty[];
}): Component {
  const { materialId, mechanicalProperties = [], ...component } = input;
  const material = getMaterial(materialId);
  const manufacturingProcess = manufacturingData[component.id];
  const analysis = analysisData[component.id];
  if (!material || !manufacturingProcess || !analysis) throw new Error(`Incomplete illustrative component: ${component.id}`);
  return {
    ...component,
    material,
    manufacturingProcess,
    analysis,
    mechanicalProperties: [
      { label: "Tensile strength", value: String(material.tensileStrength), unit: "MPa" },
      { label: "Yield strength", value: String(material.yieldStrength), unit: "MPa" },
      { label: "Density", value: String(material.density), unit: "kg/m³" },
      { label: "Hardness", value: material.hardness },
      ...mechanicalProperties,
    ],
  };
}

const shaftDimensions: EngineeringProperty[] = [
  { label: "Overall length", value: "285", unit: "mm" },
  { label: "Main shaft diameter", value: "50", unit: "mm" },
  { label: "Bearing journal", value: "35", unit: "mm" },
  { label: "Shoulder fillet radius", value: "2.5", unit: "mm" },
  { label: "Spline engagement", value: "38", unit: "mm" },
  { label: "Retaining thread", value: "M24 × 1.5" },
];

const shaftHotspots: Hotspot[] = [
  { id: "shoulder-fillet", name: "Shoulder fillet", partId: "shoulder", position: [0.36, 0.6, 0.27], description: "Diameter transition from the main torque section to the bearing journal. Combined bending and torsion concentrate at the 2.5 mm root radius.", surfaceFinish: "Ra ≤0.8 µm; no circumferential tool marks", tolerance: "Fillet R2.5 ±0.2 mm; shoulder face runout ≤0.015 mm", criticality: "High" },
  { id: "bearing-journal", name: "Precision bearing journal", partId: "journal", position: [0.28, 1.5, 0.21], description: "Ground journal locates the radial bearing and establishes the rotating datum. Roundness and fit control heat and fretting.", surfaceFinish: "Ra ≤0.4 µm", tolerance: "Ø35 0/−0.016 mm; roundness ≤0.005 mm", criticality: "High" },
  { id: "spline-root", name: "Spline root & flank", partId: "spline", position: [0.32, -1.8, 0.24], description: "Torque enters through involute spline flanks. Root tool marks and uneven load sharing can initiate high-cycle fatigue.", surfaceFinish: "Flank Ra ≤1.6 µm; blended root", tolerance: "Tooth thickness ±0.025 mm; engagement 38 mm", criticality: "High" },
  { id: "thread-runout", name: "Retaining thread runout", partId: "thread", position: [0.3, 2.4, 0], description: "The retaining nut sets axial retention. An abrupt thread termination reduces local fatigue margin and can interfere with the bearing stack.", surfaceFinish: "Ra ≤1.6 µm; burr-free thread exit", tolerance: "M24 × 1.5, illustrative 6g target", criticality: "Medium" },
  { id: "gear-mesh", name: "Drive gear interface", partId: "gear", position: [0.36, -0.8, 0.27], description: "The fitted drive gear transfers torque into the shaft assembly. Mesh misalignment adds alternating radial load at nearby shoulders.", surfaceFinish: "Mating seat Ra ≤0.8 µm", tolerance: "Gear-seat radial runout ≤0.020 mm", criticality: "High" },
  { id: "shaft-body", name: "Main torque section", partId: "shaft", position: [0.4, 0, 0.3], description: "Nominal Ø50 mm shaft body carries combined torque and bending. Elastic twist depends strongly on diameter, not only material strength.", surfaceFinish: "Ra ≤1.6 µm", tolerance: "Ø50 ±0.025 mm", criticality: "Medium" },
  { id: "bearing-seat", name: "Bearing interface", partId: "bearing", position: [0.44, 1.15, 0.28], description: "The illustrative mounted bearing must retain operating clearance after interference, preload, and thermal growth are accounted for.", surfaceFinish: "Seat Ra ≤0.4 µm", tolerance: "Assembled axial float 0.03–0.06 mm design target", criticality: "High" },
  { id: "spacer-face", name: "Axial spacer face", partId: "spacer", position: [0.36, 1.95, 0.12], description: "A precision spacer controls the bearing stack and spreads retaining-nut clamp load across a square face.", surfaceFinish: "Face Ra ≤0.8 µm", tolerance: "Face parallelism ≤0.010 mm", criticality: "Medium" },
  { id: "retainer-groove", name: "Retainer seating face", partId: "retainer", position: [0.3, 2.65, 0.12], description: "The end retainer prevents axial release. Full seating and positive retention are necessary after preload adjustment.", surfaceFinish: "Ra ≤1.6 µm; edge break 0.2 mm", tolerance: "Seating-face runout ≤0.020 mm", criticality: "Medium" },
];

export const components: Component[] = [
  defineComponent({
    id: "input-shaft", name: "Input Shaft", partNumber: "IS-1042", category: "Shafts", modelKind: "shaft",
    subtitle: "Precision-machined · Quenched & tempered",
    description: "A stepped AISI 4140 input shaft for a compact industrial transmission. A ground bearing journal, torque-transfer spline, and controlled shoulder fillets balance alignment, fatigue resistance, and manufacturing cost.",
    materialId: "aisi-4140", dimensions: shaftDimensions, overallLength: 285, diameter: 50, weight: 3.42,
    mechanicalProperties: [{ label: "Elastic modulus", value: "205", unit: "GPa" }, { label: "Illustrative transmitted torque", value: "420", unit: "N·m" }, { label: "Thermal expansion", value: "12.2", unit: "µm/(m·K)" }],
    applications: ["Industrial gearboxes", "Conveyor drives", "Machine-tool transmissions"], criticality: "High", hotspots: shaftHotspots,
    failureModes: [
      { name: "Shoulder fatigue cracking", cause: "Alternating bending and torque amplify tensile stress at a small or damaged transition fillet.", prevention: "Preserve the specified root radius, remove tool marks, and validate fatigue under the actual load spectrum.", hotspotId: "shoulder-fillet" },
      { name: "Spline-root fatigue & fretting", cause: "Uneven tooth loading, poor engagement, or dry micro-slip damage the spline root and flank.", prevention: "Inspect the root profile, confirm full spline engagement, and maintain a clean lubricated fit.", hotspotId: "spline-root" },
      { name: "Journal scoring & bearing creep", cause: "Contaminated oil or incorrect bearing fit permits local sliding and abrasive damage.", prevention: "Control journal roundness and surface finish, verify bearing fit, and filter the lubricant.", hotspotId: "bearing-journal" },
      { name: "Thread-runout cracking", cause: "A sharp thread termination and excessive retaining preload superimpose tensile stress on a notch.", prevention: "Use a blended runout, gauge the thread, and control retaining-nut preload.", hotspotId: "thread-runout" },
    ],
    insights: [
      { category: "Geometry", title: "The transition sets the fatigue margin", description: "Increasing the shoulder blend can reduce notch severity, but check bearing chamfer clearance before changing the 2.5 mm radius.", hotspotId: "shoulder-fillet" },
      { category: "Material", title: "More strength is not more stiffness", description: "AISI 4340 raises core yield strength at the same geometry; its similar elastic modulus does not materially reduce shaft twist.", hotspotId: "shaft-body" },
      { category: "Manufacturing", title: "Finish after heat treatment", description: "Reserve grinding stock for journal distortion and inspect for thermal burn after finishing.", hotspotId: "bearing-journal" },
      { category: "Inspection", title: "Inspect the spline root, not only the fit", description: "A functional gauge checks engagement but does not reveal a fatigue-initiating cutter mark; supplement with root-profile and crack inspection.", hotspotId: "spline-root" },
      { category: "Thermal", title: "Preload moves with temperature", description: "The warm bearing stack expands relative to its housing; verify axial float at operating temperature.", hotspotId: "bearing-seat" },
    ],
    inspection: [{ label: "Journal roundness", value: "≤0.005", unit: "mm" }, { label: "Datum runout", value: "≤0.010", unit: "mm" }, { label: "Crack screening", value: "Magnetic-particle inspection after heat treatment and grinding" }, { label: "Spline validation", value: "Functional ring gauge plus optical root-profile check" }],
    tolerance: "Journal Ø35 0/−0.016 mm · datum runout ≤0.010 mm",
  }),
  defineComponent({
    id: "precision-spindle", name: "Precision Spindle", partNumber: "SP-2201", category: "Spindles", modelKind: "spindle",
    subtitle: "High-speed rotation · Nitrided precision surfaces",
    description: "A nitrided 31CrMoV9 spindle with a precision tool taper and paired bearing journals. Error motion, thermal growth, and surface integrity matter more than static strength alone for repeatable cutting accuracy.",
    materialId: "nitriding-steel", overallLength: 240, diameter: 48, weight: 2.65,
    dimensions: [{ label: "Overall length", value: "240", unit: "mm" }, { label: "Body diameter", value: "48", unit: "mm" }, { label: "Bearing journal", value: "40", unit: "mm" }, { label: "Tool taper", value: "Illustrative 7:24 geometry" }, { label: "Drawbar bore", value: "12", unit: "mm" }],
    mechanicalProperties: [{ label: "Elastic modulus", value: "210", unit: "GPa" }, { label: "Illustrative operating speed", value: "12,000", unit: "rpm" }, { label: "Nitrided diffusion depth", value: "0.25–0.35", unit: "mm" }],
    applications: ["CNC milling", "Precision grinding", "High-speed machining"], criticality: "High",
    hotspots: [
      { id: "spindle-taper", name: "Tool taper transition", partId: "taper", position: [0.27, -1.8, 0.18], description: "Tool seating cone transfers cutting loads into the spindle. Debris or poor contact produces runout and local fretting.", surfaceFinish: "Ra ≤0.2 µm", tolerance: "Illustrative taper contact ≥85%; radial runout ≤0.003 mm", criticality: "High" },
      { id: "spindle-journal", name: "Front bearing journal", partId: "journal", position: [0.32, 0.9, 0.24], description: "Ground journal sets the front bearing datum and responds to temperature-sensitive preload.", surfaceFinish: "Ra ≤0.2 µm", tolerance: "Roundness ≤0.002 mm; runout ≤0.003 mm", criticality: "High" },
      { id: "spindle-body", name: "Spindle body", partId: "body", position: [0.384, 0, 0.288], description: "Main rotating section controls bending stiffness and dynamic response between supports.", surfaceFinish: "Ra ≤0.8 µm", tolerance: "Body coaxiality ≤0.010 mm", criticality: "Medium" },
      { id: "spindle-thread", name: "Preload adjustment thread", partId: "thread", position: [0.28, 2, 0.16], description: "Fine thread retains the rear bearing stack; excessive clamp load increases heat and error motion.", surfaceFinish: "Ra ≤1.6 µm", tolerance: "Illustrative M30 × 1.5 thread; face runout ≤0.008 mm", criticality: "Medium" },
    ],
    failureModes: [
      { name: "Taper fretting & runout growth", cause: "Tool-seat contamination or incomplete contact causes micro-slip under alternating cutting force.", prevention: "Clean the taper, verify master-tool contact, and monitor radial error motion.", hotspotId: "spindle-taper" },
      { name: "Bearing overheating", cause: "Excessive preload and differential thermal growth overload the front bearing interface.", prevention: "Set preload with the approved bearing method and validate a controlled warm-up cycle.", hotspotId: "spindle-journal" },
      { name: "Nitrided-layer damage", cause: "Aggressive final grinding removes the diffusion layer or creates tensile burn damage.", prevention: "Control finish stock and grinding energy; confirm case depth and screen for burn.", hotspotId: "spindle-journal" },
      { name: "Resonant vibration", cause: "Operating speed approaches a rotor-bearing mode or toolholder unbalance excites the body.", prevention: "Balance the complete tool-spindle system and verify its speed-dependent dynamic response.", hotspotId: "spindle-body" },
    ],
    insights: [
      { category: "Geometry", title: "Taper contact controls cutting accuracy", description: "Uniform seating distributes load; a nominally strong spindle still cuts poorly if the taper has debris or high spots.", hotspotId: "spindle-taper" },
      { category: "Manufacturing", title: "Preserve the nitrided case", description: "Limit post-nitriding grinding allowance and qualify compound-layer removal on a witness coupon.", hotspotId: "spindle-journal" },
      { category: "Thermal", title: "Warm-up is part of the accuracy budget", description: "Map front-bearing temperature to axial growth before applying any compensation.", hotspotId: "spindle-journal" },
      { category: "Inspection", title: "Measure error motion dynamically", description: "Static runout alone misses speed-dependent bearing and rotor behavior.", hotspotId: "spindle-body" },
    ],
    inspection: [{ label: "Journal roundness", value: "≤0.002", unit: "mm" }, { label: "Taper contact", value: "Master taper blue-check; ≥85% illustrative target" }, { label: "Dynamic verification", value: "Two-plane balance and non-contact error-motion trace" }, { label: "Case validation", value: "Witness coupon microhardness and surface burn screening" }],
    tolerance: "Journal runout ≤0.003 mm · taper Ra ≤0.2 µm",
  }),
  defineComponent({
    id: "induction-coil", name: "Induction Coil", partNumber: "IC-3017", category: "Thermal Systems", modelKind: "coil",
    subtitle: "Water-cooled copper · Localized induction heating",
    description: "A four-turn C10100 copper coil surrounds a separate AISI 1045 steel workpiece. Alternating magnetic flux heats the workpiece; hollow copper tubing carries cooling water to control conductor and terminal temperatures.",
    materialId: "c10100-copper", overallLength: 90, diameter: 74, weight: 0.58,
    dimensions: [{ label: "Assembly axial envelope", value: "90", unit: "mm" }, { label: "Coil outside diameter", value: "74", unit: "mm" }, { label: "Tube outside diameter / wall", value: "8 / 1", unit: "mm" }, { label: "Coil bore", value: "58", unit: "mm" }, { label: "Workpiece diameter", value: "46", unit: "mm" }, { label: "Turn pitch", value: "14", unit: "mm" }],
    mechanicalProperties: [{ label: "Copper conductivity at 20 °C", value: "≈58", unit: "MS/m" }, { label: "Thermal conductivity", value: "≈390", unit: "W/(m·K)" }, { label: "Illustrative excitation frequency", value: "30", unit: "kHz" }, { label: "Copper operating temperature assumption", value: "<80", unit: "°C" }],
    applications: ["Induction surface hardening", "Localized brazing", "Thermal process development"], criticality: "High",
    hotspots: [
      { id: "coil-turn", name: "Inner copper turn", partId: "coil", position: [0.61, 0.25, 0.4], description: "Inner turn faces the strongest electromagnetic coupling and radiative heat from the steel workpiece. Coolant passage integrity limits conductor temperature.", surfaceFinish: "Clean oxide-free copper; no sharp dents", tolerance: "Turn pitch 14 ±0.5 mm; tube ovality ≤10% illustrative target", criticality: "High" },
      { id: "coil-workpiece", name: "Steel workpiece heating band", partId: "workpiece", position: [0.368, 0, 0.276], description: "Separate ferromagnetic steel workpiece receives induced-current heating. The displayed 820 °C peak belongs here, not to the copper conductor.", surfaceFinish: "Clean steel surface; Ra ≤3.2 µm before treatment", tolerance: "Nominal radial coil gap 6 ±0.5 mm", criticality: "High" },
      { id: "coil-terminal", name: "Brazed terminal junction", partId: "terminal", position: [0.8, 0.7, 0.16], description: "Brazed copper terminal carries high current and coolant. Joint resistance and restrained thermal expansion can cause a local hot spot or leak.", surfaceFinish: "Continuous clean braze fillet; no flux residue", tolerance: "Pre-braze joint gap 0.05–0.15 mm", criticality: "High" },
    ],
    failureModes: [
      { name: "Terminal braze fatigue & leakage", cause: "Thermal cycling and constrained tube movement strain a resistive or incompletely wetted braze joint.", prevention: "Qualify the braze procedure, provide strain relief, and pressure-test the coolant path.", hotspotId: "coil-terminal" },
      { name: "Conductor overheating", cause: "Scale, trapped air, or loss of water flow removes the intended cooling capacity.", prevention: "Monitor flow and outlet temperature with a hardwired power interlock; maintain clean coolant.", hotspotId: "coil-turn" },
      { name: "Uneven workpiece case depth", cause: "Variable radial gap, turn pitch, dwell, or steel permeability creates nonuniform heating.", prevention: "Fixture the workpiece concentrically, map the thermal field, and verify case depth on coupons.", hotspotId: "coil-workpiece" },
    ],
    insights: [
      { category: "Thermal", title: "Two bodies, two temperature regimes", description: "The steel heating band can approach 820 °C while the water-cooled copper is assumed below 80 °C; do not use the workpiece peak to derate copper strength.", hotspotId: "coil-workpiece" },
      { category: "Geometry", title: "Gap consistency sets heating uniformity", description: "A smaller coil-to-workpiece gap increases coupling but reduces clearance and can overheat edges.", hotspotId: "coil-turn" },
      { category: "Manufacturing", title: "A sound braze is an electrical requirement", description: "A leak-tight joint can still have excess electrical resistance; inspect joint heating during a low-power trial.", hotspotId: "coil-terminal" },
      { category: "Inspection", title: "Prove the coolant interlock", description: "A flow-switch challenge must remove power before an energized dry coil can overheat.", hotspotId: "coil-turn" },
    ],
    inspection: [{ label: "Cooling circuit", value: "Pressure hold, flow verification, and loss-of-flow interlock test" }, { label: "Concentricity", value: "Gap gauge at all four turns" }, { label: "Thermal verification", value: "Calibrated workpiece pyrometer and separate copper temperature sensor" }, { label: "Joint integrity", value: "Braze visual inspection plus electrical heating trial" }],
    tolerance: "Turn pitch ±0.5 mm · workpiece gap 6 ±0.5 mm",
  }),
  defineComponent({
    id: "planetary-gear", name: "Planetary Gear Set", partNumber: "PG-7812", category: "Gears", modelKind: "planetary",
    subtitle: "Compact torque multiplication · Carburized gear set",
    description: "An illustrative AISI 8620 sun-and-planet set on a steel carrier. A mating ring gear is required in service but omitted from the simplified model; planet indexing and carrier accuracy govern torque sharing.",
    materialId: "aisi-8620", overallLength: 64, diameter: 160, weight: 4.8,
    dimensions: [{ label: "Axial envelope", value: "64", unit: "mm" }, { label: "Carrier envelope", value: "160", unit: "mm" }, { label: "Gear module", value: "2", unit: "mm" }, { label: "Sun / planet tooth count", value: "24 / 24" }, { label: "Mating ring tooth count", value: "72; omitted from visualization" }, { label: "Face width", value: "24", unit: "mm" }],
    mechanicalProperties: [{ label: "Illustrative fixed-ring reduction", value: "4:1" }, { label: "Illustrative input torque", value: "180", unit: "N·m" }, { label: "Effective case depth", value: "0.7–0.9", unit: "mm" }],
    applications: ["Servo gearheads", "Compact industrial reducers", "Robotic joints"], criticality: "High",
    hotspots: [
      { id: "planetary-sun-root", name: "Sun tooth root", partId: "sun", position: [0.42, 0.24, 0.28], description: "Sun tooth roots carry cyclic bending from several planet contacts. Root finish and load sharing determine the local margin.", surfaceFinish: "Root Ra ≤1.6 µm; flank Ra ≤0.4 µm", tolerance: "Illustrative tooth-profile deviation ≤0.010 mm", criticality: "High" },
      { id: "planetary-planet-flank", name: "Loaded planet flank", partId: "planet", position: [1.12, 0.2, 0.34], description: "Planet teeth alternately mesh with sun and omitted ring gear. Misalignment concentrates load along one edge of the carburized case.", surfaceFinish: "Flank Ra ≤0.4 µm", tolerance: "Illustrative backlash 0.08–0.14 mm", criticality: "High" },
      { id: "planetary-carrier-pin", name: "Carrier pin seat", partId: "carrier", position: [-0.48, -0.42, 0.83], description: "Carrier pin location controls relative planet position. Pin bore misplacement defeats nominally equal torque sharing.", surfaceFinish: "Pin bore Ra ≤0.8 µm", tolerance: "Planet-pin position ±0.015 mm", criticality: "High" },
    ],
    failureModes: [
      { name: "Sun tooth-root fatigue", cause: "Unequal planet load sharing raises alternating root stress above the nominal average.", prevention: "Control root geometry, verify carrier pin positions, and validate loaded tooth contact.", hotspotId: "planetary-sun-root" },
      { name: "Planet-flank micropitting", cause: "Thin oil film and edge loading concentrate repeated surface shear on the hard case.", prevention: "Specify suitable lubricant viscosity, superfinish flanks, and correct mesh alignment.", hotspotId: "planetary-planet-flank" },
      { name: "Carrier pin-seat fretting", cause: "Cyclic pin reaction and insufficient fit allow microscopic motion in the carrier bore.", prevention: "Verify pin fit and carrier stiffness; inspect contact patterns under representative torque.", hotspotId: "planetary-carrier-pin" },
    ],
    insights: [
      { category: "Geometry", title: "Three planets do not guarantee equal load", description: "Carrier position error, ring flexibility, and tooth indexing influence the load-share factor.", hotspotId: "planetary-carrier-pin" },
      { category: "Material", title: "The case and core solve different problems", description: "Carburized flanks resist contact damage; the tough 8620 core carries bending. Core yield is not a pitting rating.", hotspotId: "planetary-sun-root" },
      { category: "Manufacturing", title: "Correct distortion before matching", description: "Grind teeth and bores after carburizing, then assemble a matched set using actual contact-pattern results.", hotspotId: "planetary-planet-flank" },
      { category: "Inspection", title: "Measure carrier geometry as a system", description: "Inspect the complete pin circle in one datum frame, not each bore independently.", hotspotId: "planetary-carrier-pin" },
    ],
    inspection: [{ label: "Gear geometry", value: "Profile, lead, pitch, and master-gear roll test" }, { label: "Carrier position", value: "CMM pin-circle survey to ±0.015 mm target" }, { label: "Heat treatment", value: "Case-depth microhardness, core hardness, and crack screen" }, { label: "Assembly", value: "Loaded contact pattern and transmission-error test" }],
    tolerance: "Tooth profile ≤0.010 mm · carrier pin position ±0.015 mm",
  }),
  defineComponent({
    id: "rotor-assembly", name: "Rotor Assembly", partNumber: "RA-4410", category: "Rotating Assemblies", modelKind: "rotor",
    subtitle: "Dynamically balanced · Laminated induction rotor",
    description: "A motor rotor with an AISI 1045 shaft, insulated electrical-steel lamination stack, cast aluminum cage, and a separate polymer cooling fan. The primary material and stress screen apply to the shaft, not every body in the assembly.",
    materialId: "aisi-1045", overallLength: 220, diameter: 100, weight: 7.1,
    dimensions: [{ label: "Overall shaft length", value: "220", unit: "mm" }, { label: "Rotor outside diameter", value: "100", unit: "mm" }, { label: "Lamination stack length", value: "110", unit: "mm" }, { label: "Bearing journal", value: "30", unit: "mm" }, { label: "Illustrative radial air gap", value: "0.5", unit: "mm" }],
    mechanicalProperties: [{ label: "Shaft elastic modulus", value: "205", unit: "GPa" }, { label: "Illustrative operating speed", value: "3,000", unit: "rpm" }, { label: "Lamination thickness", value: "0.50", unit: "mm" }],
    applications: ["Industrial induction motors", "Pump drives", "Variable-speed fans"], criticality: "High",
    hotspots: [
      { id: "rotor-shaft-fit", name: "Rotor-to-shaft transition", partId: "shaft", position: [0.24, 1.15, 0.18], description: "Shaft shoulder and interference fit support the rotor stack. Bending from unbalance combines with local fit stress.", surfaceFinish: "Fit Ra ≤0.8 µm; journal Ra ≤0.4 µm", tolerance: "Illustrative interference 0.020–0.040 mm", criticality: "High" },
      { id: "rotor-stack", name: "Lamination stack & cage", partId: "rotor", position: [0.8, 0, 0.6], description: "Insulated steel laminations guide flux while cast aluminum bars carry induced current. Burrs or casting voids increase loss and temperature.", surfaceFinish: "Intact lamination insulation; deburred outside envelope", tolerance: "Stack length 110 ±0.10 mm; OD runout ≤0.025 mm", criticality: "High" },
      { id: "rotor-fan", name: "Cooling fan root", partId: "fan", position: [0.62, -1.55, 0.35], description: "Separate polymer fan drives cooling air. Root stress, retention, and shroud clearance must accommodate speed and thermal growth.", surfaceFinish: "Smooth molded blade roots; no flash", tolerance: "Illustrative minimum cold fan clearance 1.5 mm", criticality: "Medium" },
    ],
    failureModes: [
      { name: "Shaft fatigue from unbalance", cause: "Residual unbalance or a resonant operating speed creates rotating bending at the stack shoulder.", prevention: "Blend the shoulder, dynamically balance the assembled rotor, and verify critical-speed separation.", hotspotId: "rotor-shaft-fit" },
      { name: "Rotor bar or end-ring cracking", cause: "Casting defects and repeated thermal expansion interrupt the current path and create local hot spots.", prevention: "Inspect cage continuity and casting quality; trend vibration and motor-current signatures.", hotspotId: "rotor-stack" },
      { name: "Fan-root fracture or rub", cause: "Overspeed, heat-aged polymer, or insufficient axial/radial clearance overloads a fan blade root.", prevention: "Qualify the fan material at temperature, verify retention, and test guarded overspeed clearance.", hotspotId: "rotor-fan" },
    ],
    insights: [
      { category: "Geometry", title: "Balance the assembled rotor", description: "Individually balanced parts do not account for accumulated fit eccentricity; use two-plane correction after assembly.", hotspotId: "rotor-shaft-fit" },
      { category: "Thermal", title: "Differential growth changes the fit", description: "The hot stack and cooler shaft do not expand equally; check minimum operating interference and maximum cold assembly stress.", hotspotId: "rotor-stack" },
      { category: "Manufacturing", title: "Keep laminations electrically separate", description: "Stamping burrs bridge insulation and increase eddy-current losses even when the outside diameter measures correctly.", hotspotId: "rotor-stack" },
      { category: "Inspection", title: "Fan clearance is speed dependent", description: "Combine thermal expansion, shaft deflection, and polymer blade growth when setting the shroud gap.", hotspotId: "rotor-fan" },
    ],
    inspection: [{ label: "Dynamic balance", value: "Two-plane assembled balance record" }, { label: "Journal runout", value: "≤0.010", unit: "mm" }, { label: "Electrical integrity", value: "Cage continuity and interlaminar insulation checks" }, { label: "Speed validation", value: "Guarded overspeed test with fan clearance verification" }],
    tolerance: "Journal runout ≤0.010 mm · stack OD runout ≤0.025 mm",
  }),
  defineComponent({
    id: "bearing-housing", name: "Bearing Housing", partNumber: "BH-1930", category: "Housings", modelKind: "housing",
    subtitle: "Ribbed ductile iron · Stable bearing support",
    description: "A ribbed EN-GJS-500-7 ductile iron housing transfers radial bearing reactions into a mounting base. A precision-bored seat, stable base datum, and clean lubrication passage support alignment and thermal clearance.",
    materialId: "en-gjs-500-7", overallLength: 160, diameter: 120, weight: 4.2,
    dimensions: [{ label: "Base length", value: "160", unit: "mm" }, { label: "Body outside diameter", value: "120", unit: "mm" }, { label: "Bearing seat diameter", value: "80", unit: "mm" }, { label: "Axial seat width", value: "30", unit: "mm" }, { label: "Mounting bolt centers", value: "130", unit: "mm" }],
    mechanicalProperties: [{ label: "Elastic modulus", value: "170", unit: "GPa" }, { label: "Illustrative radial reaction", value: "8", unit: "kN" }, { label: "Thermal expansion", value: "11.5", unit: "µm/(m·K)" }],
    applications: ["Conveyor bearing supports", "Pump bearing pedestals", "Industrial drive supports"], criticality: "Medium",
    hotspots: [
      { id: "housing-rib", name: "Bearing seat rib junction", partId: "housing", position: [0.92, -0.45, 0.5], description: "Rib junction transfers the bearing reaction into the base. Abrupt thickness changes can combine a geometric notch with casting shrinkage.", surfaceFinish: "Clean cast surface; blended rib fillet", tolerance: "Illustrative rib fillet R6 ±1 mm", criticality: "High" },
      { id: "housing-seat", name: "Precision bearing seat", partId: "seat", position: [0.64, 0.28, 0.48], description: "Bored seat locates the bearing outer ring. Clamp distortion and temperature growth change the effective operating fit.", surfaceFinish: "Ra ≤1.6 µm", tolerance: "Ø80 +0.030/0 mm; cylindricity ≤0.015 mm", criticality: "High" },
      { id: "housing-bolt", name: "Mounting bolt pad", partId: "bolt", position: [1.3, -0.85, 0.38], description: "Mounting bolts close the load path through the base. Uneven support can distort the bearing bore even at correct bolt torque.", surfaceFinish: "Machined pad Ra ≤3.2 µm", tolerance: "Base flatness ≤0.040 mm; hole position Ø0.10 mm", criticality: "Medium" },
    ],
    failureModes: [
      { name: "Rib-junction fatigue or casting crack", cause: "A shrinkage defect or sharp rib transition raises local tensile stress under cyclic bearing reaction.", prevention: "Use generous rib blends, verify casting quality, and inspect high-load junctions.", hotspotId: "housing-rib" },
      { name: "Outer-ring creep & seat wear", cause: "Excess clearance, bore ovality, or thermal expansion permits the outer ring to move in its seat.", prevention: "Select the fit for the actual load direction and temperature; bore in the service clamping condition.", hotspotId: "housing-seat" },
      { name: "Base distortion & fastener loosening", cause: "Soft foot, uneven pads, or inadequate bolt preload twists the housing and changes bearing alignment.", prevention: "Check base contact, shim correctly, and apply a controlled cross-pattern tightening sequence.", hotspotId: "housing-bolt" },
    ],
    insights: [
      { category: "Geometry", title: "Stiff ribs need smooth load paths", description: "A thicker rib can make a shrinkage-prone hot junction; blend thickness and fillet changes rather than simply adding mass.", hotspotId: "housing-rib" },
      { category: "Manufacturing", title: "Bore it as it will be bolted", description: "Service-representative clamping during finish boring reduces assembly-induced seat ovality.", hotspotId: "housing-seat" },
      { category: "Thermal", title: "The seat fit is not constant", description: "Compare hot bore growth with the bearing outer ring, not with ambient nominal dimensions alone.", hotspotId: "housing-seat" },
      { category: "Inspection", title: "Check soft foot before alignment", description: "A sound bore cannot compensate for a distorted mounting base.", hotspotId: "housing-bolt" },
    ],
    inspection: [{ label: "Bearing seat", value: "Three-plane roundness and cylindricity measurement" }, { label: "Casting integrity", value: "Nodularity coupon, visual inspection, and critical-junction crack screen" }, { label: "Base flatness", value: "≤0.040", unit: "mm" }, { label: "Lubrication passage", value: "Borescope and particle cleanliness check" }],
    tolerance: "Seat Ø80 +0.030/0 mm · base flatness ≤0.040 mm",
  }),
  defineComponent({
    id: "drive-coupling", name: "Flexible Drive Coupling", partNumber: "DC-5511", category: "Couplings", modelKind: "coupling",
    subtitle: "Low-inertia aluminum hubs · Compliant torque transfer",
    description: "Two 6061-T6 aluminum clamp hubs transmit torque through a replaceable polyurethane spider insert, with separate steel fasteners. The compliant element damps torsional vibration and tolerates limited misalignment; it is not a rigid shaft extension.",
    materialId: "al-6061-t6", overallLength: 76, diameter: 65, weight: 0.48,
    dimensions: [{ label: "Overall length", value: "76", unit: "mm" }, { label: "Outside diameter", value: "65", unit: "mm" }, { label: "Shaft bore", value: "28", unit: "mm" }, { label: "Insert axial width", value: "18", unit: "mm" }, { label: "Illustrative clamp bolt", value: "M6" }],
    mechanicalProperties: [{ label: "Hub elastic modulus", value: "69", unit: "GPa" }, { label: "Illustrative transmitted torque", value: "45", unit: "N·m" }, { label: "Insert hardness", value: "92 Shore A" }, { label: "Illustrative angular misalignment", value: "≤0.5", unit: "°" }],
    applications: ["Servo motor connections", "Small pump drives", "Encoder and automation axes"], criticality: "Medium",
    hotspots: [
      { id: "coupling-hub-slot", name: "Hub clamp-slot root", partId: "hub", position: [0.52, 0.45, 0.39], description: "The clamp slot allows bore closure, but its root concentrates aluminum hub stress from bolt preload and torque.", surfaceFinish: "Ra ≤1.6 µm; deburred radiused slot root", tolerance: "Slot width 1.5 ±0.1 mm; bore Ø28 +0.021/0 mm", criticality: "High" },
      { id: "coupling-insert", name: "Polyurethane spider contact", partId: "insert", position: [0.42, 0, 0.25], description: "The separate polymer insert deforms between mating jaws and dissipates misalignment energy as heat.", surfaceFinish: "Molded surface without tears, voids, or flash", tolerance: "Illustrative jaw clearance 0.10–0.20 mm", criticality: "Medium" },
      { id: "coupling-bolt", name: "Hub clamp fastener", partId: "bolt", position: [0.58, 0.55, 0.12], description: "Steel bolt preload establishes frictional shaft grip. Aluminum bearing surfaces need load spreading and controlled tightening.", surfaceFinish: "Clean bolt seat with hardened washer", tolerance: "Illustrative M6 clamp bolt; torque from qualified joint design", criticality: "High" },
    ],
    failureModes: [
      { name: "Hub slot-root fatigue", cause: "Excess bolt preload and cyclic torque create alternating stress at a sharp clamp-slot end.", prevention: "Radius and deburr the slot root, verify joint preload, and fatigue-check the aluminum hub.", hotspotId: "coupling-hub-slot" },
      { name: "Insert heat aging & tearing", cause: "Excess misalignment, incompatible fluid exposure, or axial compression heats and damages the polyurethane.", prevention: "Align the shafts, set the axial gap, and select a qualified elastomer grade for the environment.", hotspotId: "coupling-insert" },
      { name: "Clamp slip & fretting", cause: "Insufficient bolt preload or an oily bore reduces frictional torque capacity.", prevention: "Prepare the mating surfaces, apply qualified bolt preload, and inspect witness marks after run-in.", hotspotId: "coupling-bolt" },
    ],
    insights: [
      { category: "Geometry", title: "A radiused slot protects the light hub", description: "Blend the clamp-slot termination while retaining enough compliance to achieve full bore contact.", hotspotId: "coupling-hub-slot" },
      { category: "Material", title: "One strength value cannot rate an assembly", description: "The aluminum yield ratio says nothing about polyurethane tear life or steel bolt preload capacity.", hotspotId: "coupling-insert" },
      { category: "Thermal", title: "Misalignment has a heat cost", description: "The spider dissipates cyclic strain energy; reducing misalignment can lower insert temperature without changing material.", hotspotId: "coupling-insert" },
      { category: "Inspection", title: "Inspect grip before increasing torque", description: "Bore cleanliness and preload can explain slip more directly than a nominal increase in hub strength.", hotspotId: "coupling-bolt" },
    ],
    inspection: [{ label: "Hub geometry", value: "CMM bore, jaw symmetry, and slot-root inspection" }, { label: "Insert condition", value: "Durometer and visual void/tear check" }, { label: "Clamp verification", value: "Calibrated torque record and shaft witness marks" }, { label: "Alignment", value: "Dial indicator or laser alignment with axial-gap check" }],
    tolerance: "Bore Ø28 +0.021/0 mm · jaw thickness ±0.03 mm",
  }),
  defineComponent({
    id: "transmission-gear", name: "Transmission Gear", partNumber: "TG-8801", category: "Gears", modelKind: "gear",
    subtitle: "Ground involute profile · Hardened contact surfaces",
    description: "A 40-tooth AISI 8620 spur gear with a carburized case and finish-ground bore. A tough tooth core supports bending while smooth hardened flanks resist repeated rolling and sliding contact in an oil-lubricated transmission.",
    materialId: "aisi-8620", overallLength: 38, diameter: 105, weight: 1.52,
    dimensions: [{ label: "Hub axial length", value: "38", unit: "mm" }, { label: "Outside diameter", value: "105", unit: "mm" }, { label: "Pitch diameter", value: "100", unit: "mm" }, { label: "Bore diameter", value: "32", unit: "mm" }, { label: "Face width", value: "25", unit: "mm" }, { label: "Tooth count / module", value: "40 / 2.5 mm" }],
    mechanicalProperties: [{ label: "Pressure angle", value: "20", unit: "°" }, { label: "Illustrative transmitted torque", value: "240", unit: "N·m" }, { label: "Effective case depth", value: "0.8–1.0", unit: "mm" }],
    applications: ["Industrial transmissions", "Machine-tool gear trains", "Oil-lubricated reducers"], criticality: "High",
    hotspots: [
      { id: "gear-tooth-root", name: "Loaded tooth-root fillet", partId: "gear", position: [0.76, 0.22, 0.57], description: "The tensile side of the tooth root carries cyclic bending. Cutter marks and grind burn can reduce the fatigue margin even with adequate core yield strength.", surfaceFinish: "Root Ra ≤1.6 µm; smooth generated fillet", tolerance: "Illustrative root-profile deviation ≤0.015 mm", criticality: "High" },
      { id: "gear-flank", name: "Active involute flank", partId: "gear", position: [0.84, 0.08, 0.63], description: "The carburized flank carries rolling/sliding contact. Film thickness and lead alignment govern micropitting and scuffing risk.", surfaceFinish: "Flank Ra ≤0.4 µm", tolerance: "Illustrative involute profile deviation ≤0.008 mm", criticality: "High" },
      { id: "gear-hub", name: "Hub bore datum", partId: "hub", position: [0.36, 0.38, 0.24], description: "The ground bore locates the gear relative to its shaft. Eccentricity modulates backlash and tooth loading once per revolution.", surfaceFinish: "Bore Ra ≤0.8 µm", tolerance: "Ø32 +0.025/0 mm; radial runout ≤0.010 mm", criticality: "Medium" },
    ],
    failureModes: [
      { name: "Tooth-root bending fatigue", cause: "Alternating tooth load, notch geometry, and surface damage initiate a tensile root crack.", prevention: "Preserve the generated root blend, screen for grinding burn, and validate bending fatigue under the load spectrum.", hotspotId: "gear-tooth-root" },
      { name: "Flank micropitting or scuffing", cause: "Insufficient oil film, rough flanks, or high local sliding temperature damages the carburized surface.", prevention: "Control flank finish and alignment, maintain clean suitable oil, and verify contact capacity separately.", hotspotId: "gear-flank" },
      { name: "Bore fretting & eccentric mesh", cause: "A loose or distorted hub fit permits micro-slip and cyclic backlash variation.", prevention: "Finish the bore to the tooth datum, verify the mounted fit, and inspect radial runout.", hotspotId: "gear-hub" },
    ],
    insights: [
      { category: "Geometry", title: "Relief must match the real load", description: "Modest tip relief can smooth loaded contact, but excessive relief shifts load and raises noise at light torque.", hotspotId: "gear-flank" },
      { category: "Material", title: "Do not compare contact pressure with core yield", description: "The displayed stress is a root-bending screen; contact fatigue needs case properties and a separate gear-rating calculation.", hotspotId: "gear-tooth-root" },
      { category: "Manufacturing", title: "Grind without consuming the case", description: "Account for carburizing distortion and finish allowance together so the loaded flank retains sufficient effective case depth.", hotspotId: "gear-flank" },
      { category: "Inspection", title: "The bore and teeth share a datum", description: "A good tooth profile cannot compensate for mounting eccentricity; inspect tooth-to-bore runout after heat treatment.", hotspotId: "gear-hub" },
    ],
    inspection: [{ label: "Tooth geometry", value: "Gear analyzer profile, lead, pitch, and roll test" }, { label: "Case integrity", value: "Microhardness traverse, crack inspection, and burn etch" }, { label: "Flank roughness", value: "Ra ≤0.4", unit: "µm" }, { label: "Tooth-to-bore runout", value: "≤0.010", unit: "mm" }],
    tolerance: "Profile deviation ≤0.008 mm · bore runout ≤0.010 mm",
  }),
  defineComponent({
    id: "precision-bearing", name: "Precision Ball Bearing", partNumber: "BR-6208", category: "Bearings", modelKind: "bearing",
    subtitle: "Superfinished raceways · Low-friction radial support",
    description: "An illustrative open deep-groove ball bearing with AISI 52100 rings and balls plus a separate pressed-steel cage. Its 40 × 80 × 18 mm envelope is a familiar size, not a certified manufacturer's load or accuracy rating.",
    materialId: "aisi-52100", overallLength: 18, diameter: 80, weight: 0.37,
    dimensions: [{ label: "Bearing width", value: "18", unit: "mm" }, { label: "Outside diameter", value: "80", unit: "mm" }, { label: "Bore diameter", value: "40", unit: "mm" }, { label: "Illustrative ball diameter", value: "12", unit: "mm" }, { label: "Unmounted radial clearance", value: "10–25", unit: "µm" }],
    mechanicalProperties: [{ label: "Elastic modulus", value: "210", unit: "GPa" }, { label: "Illustrative radial load", value: "5", unit: "kN" }, { label: "Illustrative operating speed", value: "3,600", unit: "rpm" }],
    applications: ["Electric motor supports", "Precision rotating shafts", "Pump bearing systems"], criticality: "High",
    hotspots: [
      { id: "bearing-inner-race", name: "Inner race loaded track", partId: "inner", position: [0.42, 0.08, 0.28], description: "The loaded inner-race track sees repeated subsurface shear beneath ball contacts. Internal clearance and cleanliness strongly affect rolling-contact fatigue.", surfaceFinish: "Raceway Ra ≤0.05 µm", tolerance: "Illustrative ring runout ≤0.008 mm", criticality: "High" },
      { id: "bearing-outer-race", name: "Outer ring seating surface", partId: "outer", position: [0.64, 0, 0.48], description: "Outer ring transmits load into the housing. Oval housing support can distort the raceway and alter the contact load zone.", surfaceFinish: "Outside seat Ra ≤0.8 µm", tolerance: "Illustrative OD 80 0/−0.013 mm", criticality: "Medium" },
      { id: "bearing-ball-contact", name: "Loaded ball contact", partId: "balls", position: [0.48, 0.1, 0.36], description: "Rolling elements support radial load through small elastic contact patches. Skidding or particle dents interrupt the lubricant film.", surfaceFinish: "Superfinished ball surface; no visible dents", tolerance: "Illustrative sorted ball diameter spread ≤0.5 µm", criticality: "High" },
      { id: "bearing-cage", name: "Cage pocket bridge", partId: "cage", position: [-0.42, 0.14, 0.42], description: "A separate pressed-steel cage spaces and guides the balls. It is not intended to carry the primary radial bearing load.", surfaceFinish: "Deburred pocket edges; clean pressed surface", tolerance: "Illustrative pocket running clearance 0.15–0.25 mm", criticality: "Medium" },
    ],
    failureModes: [
      { name: "Raceway rolling-contact spalling", cause: "Repeated subsurface shear, particle dents, and inadequate film initiate local fatigue damage.", prevention: "Maintain clean correctly selected lubricant and validate life with an actual bearing rating and duty cycle.", hotspotId: "bearing-inner-race" },
      { name: "Ball skidding & surface smearing", cause: "Insufficient load, rapid acceleration, or excessive lubricant drag prevents pure rolling.", prevention: "Check minimum load and acceleration requirements, and select appropriate lubricant viscosity and fill.", hotspotId: "bearing-ball-contact" },
      { name: "Cage pocket wear or fracture", cause: "Misalignment, skidding, or poor lubrication repeatedly impacts the cage bridges.", prevention: "Control mounting alignment, operating clearance, and lubricant delivery; investigate abnormal vibration early.", hotspotId: "bearing-cage" },
      { name: "Outer-ring creep", cause: "Incorrect housing fit or uneven support permits ring motion under a rotating load zone.", prevention: "Choose the fit for load direction and temperature, then inspect housing roundness.", hotspotId: "bearing-outer-race" },
    ],
    insights: [
      { category: "Material", title: "A yield ratio is not bearing life", description: "Rolling-contact fatigue requires rated capacity, load spectrum, lubrication, and contamination factors; the static display is only a learning aid.", hotspotId: "bearing-inner-race" },
      { category: "Manufacturing", title: "Superfinish preserves the oil film", description: "Low roughness and waviness reduce asperity interaction but cannot compensate for dirty grease.", hotspotId: "bearing-ball-contact" },
      { category: "Thermal", title: "Mounting consumes clearance", description: "Interference fits and a hotter inner ring reduce the initial 10–25 µm illustrative clearance; check the operating value.", hotspotId: "bearing-inner-race" },
      { category: "Inspection", title: "Listen beyond dimensional checks", description: "A vibration test detects localized raceway or cage defects that static bore measurements miss.", hotspotId: "bearing-cage" },
    ],
    inspection: [{ label: "Ring geometry", value: "Roundness, waviness, and runout measurement" }, { label: "Surface integrity", value: "Raceway profilometry and grinding-burn screening" }, { label: "Assembly clearance", value: "10–25 µm unmounted illustrative target" }, { label: "Functional test", value: "Torque-to-rotate and vibration/noise screening" }],
    tolerance: "Illustrative ring runout ≤0.008 mm · raceway Ra ≤0.05 µm",
  }),
  defineComponent({
    id: "alloy-shaft", name: "High-Strength Alloy Shaft", partNumber: "IS-1043", category: "Shafts", modelKind: "shaft",
    subtitle: "AISI 4340 alternative · Same geometry, higher yield margin",
    description: "A controlled material comparison to IS-1042: identical shaft dimensions and illustrative loading, with quenched-and-tempered AISI 4340 replacing AISI 4140. Higher core strength increases static yield margin at a higher relative material and process cost; stiffness remains nearly unchanged.",
    materialId: "aisi-4340", dimensions: shaftDimensions.map((dimension) => ({ ...dimension })), overallLength: 285, diameter: 50, weight: 3.42,
    mechanicalProperties: [{ label: "Elastic modulus", value: "205", unit: "GPa" }, { label: "Illustrative transmitted torque", value: "420", unit: "N·m" }, { label: "Thermal expansion", value: "12.3", unit: "µm/(m·K)" }],
    applications: ["Heavy-duty industrial gearboxes", "High-cycle conveyor drives", "Shock-loaded transmissions"], criticality: "High",
    hotspots: shaftHotspots.map((hotspot) => ({ ...hotspot, position: [...hotspot.position] as [number, number, number] })),
    failureModes: [
      { name: "Notch-driven shoulder fatigue", cause: "Higher bulk yield strength does not remove the alternating stress concentration at the unchanged shoulder fillet.", prevention: "Preserve or improve the root blend and validate fatigue with the actual 4340 heat-treated surface condition.", hotspotId: "shoulder-fillet" },
      { name: "Spline-root fatigue & fretting", cause: "Uneven spline contact and contamination still create local surface damage in the stronger core material.", prevention: "Verify engagement and root integrity, control lubrication, and do not infer life from yield strength alone.", hotspotId: "spline-root" },
      { name: "Quench or grinding cracks", cause: "The higher-strength condition is sensitive to poor quench control, residual tensile stress, or grinding burn.", prevention: "Qualify the heat-treatment cycle, confirm toughness, and inspect magnetically after final grinding.", hotspotId: "bearing-journal" },
      { name: "Thread-runout fatigue", cause: "A sharp termination remains a geometric notch under retaining preload and bending.", prevention: "Blend the runout and verify preload independently of the material strength increase.", hotspotId: "thread-runout" },
    ],
    insights: [
      { category: "Material", title: "An isolated material comparison", description: "The same 248 MPa illustrative stress is used for both shafts. Yield margin increases from about 2.64 to 3.75, without implying certified fatigue life.", hotspotId: "shoulder-fillet" },
      { category: "Geometry", title: "Keep stiffness in the decision", description: "Similar elastic modulus means the 4340 shaft twists and deflects almost like the 4140 part at the same dimensions.", hotspotId: "shaft-body" },
      { category: "Manufacturing", title: "Strength brings process responsibility", description: "Document quench/temper condition, verify impact toughness, and screen finish-ground surfaces for cracks and burn.", hotspotId: "bearing-journal" },
      { category: "Inspection", title: "Prove interchangeability", description: "Use a common CMM program and interface gauges to compare the shafts before attributing performance differences to material.", hotspotId: "spline-root" },
    ],
    inspection: [{ label: "Journal roundness", value: "≤0.005", unit: "mm" }, { label: "Datum runout", value: "≤0.010", unit: "mm" }, { label: "Heat-treatment verification", value: "Hardness traverse, impact witness coupon, and magnetic-particle inspection" }, { label: "Interchangeability", value: "Common CMM program and spline/thread gauges with IS-1042" }],
    tolerance: "Journal Ø35 0/−0.016 mm · datum runout ≤0.010 mm",
  }),
];

export function getComponent(id: string): Component | undefined {
  return components.find((component) => component.id === id);
}
