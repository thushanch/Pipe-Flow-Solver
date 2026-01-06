
import React from 'react';
import { FluidProperties, PressureUnit } from '../types';
import { units } from '../physicsEngine';

interface FluidSettingsProps {
  fluid: FluidProperties;
  onTempChange: (temp: number) => void;
  sourcePressure: number;
  setSourcePressure: (val: number) => void;
  pressureUnit: PressureUnit;
}

const FluidSettings: React.FC<FluidSettingsProps> = ({ 
  fluid, 
  onTempChange, 
  sourcePressure, 
  setSourcePressure,
  pressureUnit
}) => {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        Environment
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Temperature (°C)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="0" max="100" 
              className="flex-1 accent-blue-600"
              value={fluid.temperature_c}
              onChange={(e) => onTempChange(parseFloat(e.target.value))}
            />
            <span className="text-sm font-bold w-12 text-right">{fluid.temperature_c}°C</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Source Head ({pressureUnit})</label>
          <input 
            type="number" 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-blue-600"
            value={units.pressure.fromMeters(sourcePressure, pressureUnit).toFixed(2)}
            onChange={(e) => setSourcePressure(units.pressure.toMeters(parseFloat(e.target.value), pressureUnit))}
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between py-1">
            <span className="text-xs text-slate-500">Density</span>
            <span className="text-xs font-mono">{fluid.density.toFixed(1)} kg/m³</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-xs text-slate-500">Kin. Viscosity</span>
            <span className="text-xs font-mono">{fluid.kinematicViscosity.toExponential(3)} m²/s</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FluidSettings;
