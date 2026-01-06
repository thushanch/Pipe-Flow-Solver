
import { 
  PipeData, 
  FluidProperties, 
  PipeResult, 
  HydraulicMethod, 
  MATERIALS, 
  ComponentType,
  FlowUnit,
  PressureUnit,
  LengthUnit
} from './types';

/**
 * Unit Conversion Utilities
 */
export const units = {
  flow: {
    'L/s': 1,
    'm3/h': 3.6,
    'gpm': 15.8503,
    toLps: (val: number, unit: FlowUnit) => {
      if (unit === 'm3/h') return val / 3.6;
      if (unit === 'gpm') return val / 15.8503;
      return val;
    },
    fromLps: (val: number, unit: FlowUnit) => {
      if (unit === 'm3/h') return val * 3.6;
      if (unit === 'gpm') return val * 15.8503;
      return val;
    }
  },
  pressure: {
    'm': 1,
    'kPa': 9.80665,
    'psi': 1.42233,
    'bar': 0.0980665,
    toMeters: (val: number, unit: PressureUnit) => {
      if (unit === 'kPa') return val / 9.80665;
      if (unit === 'psi') return val / 1.42233;
      if (unit === 'bar') return val / 0.0980665;
      return val;
    },
    fromMeters: (val: number, unit: PressureUnit) => {
      if (unit === 'kPa') return val * 9.80665;
      if (unit === 'psi') return val * 1.42233;
      if (unit === 'bar') return val * 0.0980665;
      return val;
    }
  },
  length: {
    'mm': 1,
    'm': 0.001,
    'in': 0.0393701,
    toMm: (val: number, unit: LengthUnit) => {
      if (unit === 'm') return val * 1000;
      if (unit === 'in') return val * 25.4;
      return val;
    },
    fromMm: (val: number, unit: LengthUnit) => {
      if (unit === 'm') return val / 1000;
      if (unit === 'in') return val / 25.4;
      return val;
    }
  }
};

/**
 * Calculates kinematic viscosity based on temperature if standard water values are used
 */
export const calculateWaterViscosity = (tempC: number): { density: number; dynamicViscosity: number; kinematicViscosity: number } => {
  const density = 1000 * (1 - (tempC + 288.9414) / (508929.2 * (tempC + 68.12963)) * Math.pow(tempC - 3.9863, 2));
  const mu = 2.414e-5 * Math.pow(10, 247.8 / (tempC + 273.15 - 140));
  return {
    density,
    dynamicViscosity: mu,
    kinematicViscosity: mu / density
  };
};

/**
 * Solves the Colebrook-White equation for friction factor f using Newton-Raphson iteration.
 */
export const solveColebrookWhite = (re: number, relativeRoughness: number): number => {
  if (re < 2300) return re <= 0 ? 0 : 64 / re; 

  let f = Math.pow(-1.8 * Math.log10(Math.pow(relativeRoughness / 3.7, 1.11) + 6.9 / re), -2);
  let x = 1 / Math.sqrt(f);
  const tol = 1e-7;
  const maxIter = 100;
  const k = relativeRoughness / 3.7;

  for (let i = 0; i < maxIter; i++) {
    const logTerm = k + (2.51 * x) / re;
    if (logTerm <= 0) break;
    const g = x + 2 * Math.log10(logTerm);
    const g_prime = 1 + (2 * 2.51) / (re * logTerm * Math.log(10));
    const xNew = x - g / g_prime;
    if (Math.abs(xNew - x) < tol) return 1 / (xNew * xNew);
    x = xNew;
  }
  return 1 / (x * x); 
};

export const solveHydraulics = (
  pipes: PipeData[], 
  fluid: FluidProperties, 
  method: HydraulicMethod,
  sourceHGL: number
): PipeResult[] => {
  let currentHGL = sourceHGL;
  const g = 9.81;

  return pipes.map(pipe => {
    const L = Math.sqrt(
      Math.pow(pipe.endX - pipe.startX, 2) +
      Math.pow(pipe.endY - pipe.startY, 2) +
      Math.pow(pipe.endZ - pipe.startZ, 2)
    );
    const dZ = pipe.endZ - pipe.startZ;
    const slope = L > 0 ? dZ / L : 0;
    const D = Math.max(0.001, pipe.diameter_mm / 1000);
    const A = (Math.PI * D * D) / 4;
    const Q = Math.max(0, pipe.flow_lps / 1000); 
    const V = Q / A;
    const mat = MATERIALS[pipe.material] || MATERIALS['Steel'];

    let h_major = 0;
    let f = 0;
    let re = 0;

    if (pipe.type === ComponentType.PUMP) {
      // Pump adds head. We treat head gain as negative loss.
      h_major = -pipe.compValue;
    } else if (pipe.type === ComponentType.VALVE) {
      // Valve head loss: h = K * v^2 / 2g
      h_major = pipe.compValue * (V * V) / (2 * g);
    } else {
      // Standard Pipe Calculation
      if (method === HydraulicMethod.DARCY_WEISBACH) {
        re = (V * D) / fluid.kinematicViscosity;
        const relRough = (mat.roughness_e_mm / 1000) / D;
        f = solveColebrookWhite(re, relRough);
        h_major = f * (L / D) * (V * V) / (2 * g);
      } else if (method === HydraulicMethod.HAZEN_WILLIAMS) {
        h_major = (10.67 * L * Math.pow(Q, 1.852)) / (Math.pow(mat.hazen_c, 1.852) * Math.pow(D, 4.87));
      } else if (method === HydraulicMethod.MANNING) {
        const R = D / 4;
        h_major = (Math.pow(mat.manning_n, 2) * V * V * L) / Math.pow(R, 4/3);
      }
    }

    const h_minor = (pipe.type === ComponentType.PIPE) ? (pipe.minorLossK * (V * V) / (2 * g)) : 0;
    const totalHeadLoss = h_major + h_minor;

    const startHGL = currentHGL;
    const endHGL = startHGL - totalHeadLoss;
    
    currentHGL = endHGL;

    return {
      ...pipe,
      length_m: L,
      deltaZ_m: dZ,
      slope,
      velocity_ms: V,
      reynolds: re,
      frictionFactor: f,
      majorLoss_m: h_major,
      minorLoss_m: h_minor,
      totalHeadLoss_m: totalHeadLoss,
      hglStart_m: startHGL,
      hglEnd_m: endHGL
    };
  });
};
