
export enum HydraulicMethod {
  DARCY_WEISBACH = 'Darcy-Weisbach & Colebrook-White',
  HAZEN_WILLIAMS = 'Hazen-Williams',
  MANNING = 'Manning'
}

export enum ComponentType {
  PIPE = 'Pipe',
  PUMP = 'Pump',
  VALVE = 'Valve'
}

export type FlowUnit = 'L/s' | 'm3/h' | 'gpm';
export type PressureUnit = 'm' | 'kPa' | 'psi' | 'bar';
export type LengthUnit = 'mm' | 'm' | 'in';

export interface PipeData {
  id: string;
  type: ComponentType;
  startNode: string;
  endNode: string;
  startX: number;
  startY: number;
  startZ: number;
  endX: number;
  endY: number;
  endZ: number;
  diameter_mm: number;
  material: string;
  minorLossK: number;
  flow_lps: number;
  compValue: number; // Pump Head (m) or Valve K-factor
}

export interface FluidProperties {
  temperature_c: number;
  density: number; // kg/m3
  dynamicViscosity: number; // Pa·s
  kinematicViscosity: number; // m2/s
}

export interface PipeResult extends PipeData {
  length_m: number;
  deltaZ_m: number;
  slope: number;
  velocity_ms: number;
  reynolds: number;
  frictionFactor: number;
  majorLoss_m: number;
  minorLoss_m: number;
  totalHeadLoss_m: number;
  hglStart_m: number;
  hglEnd_m: number;
}

export interface MaterialProps {
  roughness_e_mm: number; // For Darcy
  hazen_c: number; // For Hazen
  manning_n: number; // For Manning
}

export const MATERIALS: Record<string, MaterialProps> = {
  'PVC': { roughness_e_mm: 0.0015, hazen_c: 150, manning_n: 0.009 },
  'Ductile Iron': { roughness_e_mm: 0.25, hazen_c: 130, manning_n: 0.013 },
  'Steel': { roughness_e_mm: 0.045, hazen_c: 140, manning_n: 0.012 },
  'HDPE': { roughness_e_mm: 0.007, hazen_c: 150, manning_n: 0.009 },
  'Concrete': { roughness_e_mm: 1.0, hazen_c: 120, manning_n: 0.015 },
};
