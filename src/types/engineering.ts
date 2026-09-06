export type Vec3 = [number, number, number];
export type ModelKind = "shaft" | "spindle" | "coil" | "planetary" | "rotor" | "housing" | "coupling" | "gear" | "bearing";
export type Criticality = "Low" | "Medium" | "High";
export type AnalysisMode = "none" | "stress" | "thermal" | "wear" | "critical";
export interface EngineeringProperty { label: string; value: string; unit?: string }
export interface Material {
  id: string; name: string; family: string; description: string; condition: string;
  density: number; tensileStrength: number; yieldStrength: number; hardness: string;
  costIndex: number; wearResistance: number; fatigueResistance: number; alternatives: string[];
}
export interface ManufacturingProcess {
  id: string; name: string; purpose: string; tolerance: string; inspection: string;
}
export interface Hotspot {
  id: string; name: string; partId: string; position: Vec3; description: string;
  surfaceFinish: string; tolerance: string; criticality: Criticality;
}
export interface FailureMode { name: string; cause: string; prevention: string; hotspotId: string }
export interface AIInsight { category: "Geometry" | "Manufacturing" | "Thermal" | "Material" | "Inspection"; title: string; description: string; hotspotId?: string }
export interface Analysis {
  maxStress: number; criticalArea: string; stressExplanation: string; maxTemperature: number;
  heatingRate: number; wearRisk: Criticality; wearExplanation: string; thermalExplanation: string;
}
export interface Component {
  id: string; name: string; partNumber: string; category: string; modelKind: ModelKind;
  description: string; material: Material; dimensions: EngineeringProperty[];
  overallLength: number; diameter: number; weight: number; manufacturingProcess: ManufacturingProcess[];
  mechanicalProperties: EngineeringProperty[]; applications: string[]; criticality: Criticality;
  hotspots: Hotspot[]; failureModes: FailureMode[]; analysis: Analysis; insights: AIInsight[];
  inspection: EngineeringProperty[]; tolerance: string; subtitle: string;
}
export type EngineeringComponent = Component;
export interface AssistantResponse {
  message: string; referencedHotspotIds: string[]; insights: AIInsight[];
  actions: { type: "focus"; hotspotId: string }[]; assumptions: string[];
}
