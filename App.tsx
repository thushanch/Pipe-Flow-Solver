
import React, { useState, useMemo } from 'react';
import { 
  PipeData, 
  FluidProperties, 
  HydraulicMethod, 
  PipeResult, 
  ComponentType,
  FlowUnit,
  PressureUnit,
  LengthUnit
} from './types';
import { solveHydraulics, calculateWaterViscosity } from './physicsEngine';
import Layout from './components/Layout';
import PipeTable from './components/PipeTable';
import FluidSettings from './components/FluidSettings';
import NetworkVisualization from './components/NetworkVisualization';
import AnalysisDashboard from './components/AnalysisDashboard';
import AiInsights from './components/AiInsights';

const DEFAULT_PIPES: PipeData[] = [
  { id: 'S-01', type: ComponentType.PIPE, startNode: 'N1', endNode: 'N2', startX: 0, startY: 0, startZ: 10, endX: 50, endY: 0, endZ: 8, diameter_mm: 150, material: 'Ductile Iron', minorLossK: 0.5, flow_lps: 25, compValue: 0 },
  { id: 'S-02', type: ComponentType.PUMP, startNode: 'N2', endNode: 'N3', startX: 50, startY: 0, startZ: 8, endX: 55, endY: 0, endZ: 8, diameter_mm: 150, material: 'Steel', minorLossK: 0, flow_lps: 25, compValue: 15 },
  { id: 'S-03', type: ComponentType.PIPE, startNode: 'N3', endNode: 'N4', startX: 55, startY: 0, startZ: 8, endX: 100, endY: 20, endZ: 15, diameter_mm: 150, material: 'PVC', minorLossK: 1.2, flow_lps: 25, compValue: 0 },
];

const App: React.FC = () => {
  const [pipes, setPipes] = useState<PipeData[]>(DEFAULT_PIPES);
  const [fluid, setFluid] = useState<FluidProperties>({
    temperature_c: 20,
    ...calculateWaterViscosity(20)
  });
  const [method, setMethod] = useState<HydraulicMethod>(HydraulicMethod.DARCY_WEISBACH);
  const [sourcePressure, setSourcePressure] = useState<number>(50); 

  // Unit State
  const [flowUnit, setFlowUnit] = useState<FlowUnit>('L/s');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('m');
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>('mm');

  const results = useMemo(() => {
    return solveHydraulics(pipes, fluid, method, sourcePressure);
  }, [pipes, fluid, method, sourcePressure]);

  const updateFluidTemp = (temp: number) => {
    const props = calculateWaterViscosity(temp);
    setFluid({ temperature_c: temp, ...props });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              Global Solver
            </h2>
            <div className="space-y-3">
              {Object.values(HydraulicMethod).map(m => (
                <label key={m} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <input 
                    type="radio" 
                    name="method" 
                    value={m} 
                    checked={method === m} 
                    onChange={() => setMethod(m)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">{m}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Unit Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Flow Rate</label>
                <select value={flowUnit} onChange={(e) => setFlowUnit(e.target.value as FlowUnit)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-semibold">
                  <option value="L/s">Liters/sec (L/s)</option>
                  <option value="m3/h">m³/hour</option>
                  <option value="gpm">Gallons/min (GPM)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pressure/Head</label>
                <select value={pressureUnit} onChange={(e) => setPressureUnit(e.target.value as PressureUnit)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-semibold">
                  <option value="m">Meters (m)</option>
                  <option value="kPa">Kilopascals (kPa)</option>
                  <option value="psi">PSI</option>
                  <option value="bar">Bar</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Diameter</label>
                <select value={lengthUnit} onChange={(e) => setLengthUnit(e.target.value as LengthUnit)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-semibold">
                  <option value="mm">Millimeters (mm)</option>
                  <option value="m">Meters (m)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>
            </div>
          </section>

          <FluidSettings 
            fluid={fluid} 
            onTempChange={updateFluidTemp} 
            sourcePressure={sourcePressure} 
            setSourcePressure={setSourcePressure} 
            pressureUnit={pressureUnit}
          />
          
          <AiInsights results={results} fluid={fluid} method={method} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 flex justify-between items-center">
              <h2 className="text-white font-semibold">Network Component Editor</h2>
              <button 
                onClick={() => setPipes([...pipes, { ...DEFAULT_PIPES[0], id: `S-${pipes.length + 1}`, startX: pipes[pipes.length-1].endX, startY: pipes[pipes.length-1].endY, startZ: pipes[pipes.length-1].endZ, startNode: pipes[pipes.length-1].endNode, endNode: `N${pipes.length + 2}` }])}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
              >
                + Add Component
              </button>
            </div>
            <PipeTable 
              pipes={pipes} 
              setPipes={setPipes} 
              flowUnit={flowUnit} 
              lengthUnit={lengthUnit} 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <NetworkVisualization results={results} />
            <AnalysisDashboard 
              results={results} 
              flowUnit={flowUnit} 
              pressureUnit={pressureUnit} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
