
import React from 'react';
import { PipeData, MATERIALS, ComponentType, FlowUnit, LengthUnit } from '../types';
import { units } from '../physicsEngine';

interface PipeTableProps {
  pipes: PipeData[];
  setPipes: (pipes: PipeData[]) => void;
  flowUnit: FlowUnit;
  lengthUnit: LengthUnit;
}

const PipeTable: React.FC<PipeTableProps> = ({ pipes, setPipes, flowUnit, lengthUnit }) => {
  const handleChange = (index: number, field: keyof PipeData, value: any) => {
    const updated = [...pipes];
    updated[index] = { ...updated[index], [field]: value };
    setPipes(updated);
  };

  const removePipe = (index: number) => {
    setPipes(pipes.filter((_, i) => i !== index));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <th className="px-4 py-3">ID / Type</th>
            <th className="px-4 py-3">Nodes</th>
            <th className="px-4 py-3">Start (X,Y,Z)</th>
            <th className="px-4 py-3">End (X,Y,Z)</th>
            <th className="px-4 py-3">Diam ({lengthUnit})</th>
            <th className="px-4 py-3">Material / K</th>
            <th className="px-4 py-3">Value / Flow</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pipes.map((pipe, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-2">
                <input 
                  className="w-20 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 font-mono font-bold block"
                  value={pipe.id} 
                  onChange={(e) => handleChange(idx, 'id', e.target.value)} 
                />
                <select 
                  className="text-[10px] text-blue-600 font-bold bg-transparent border-none mt-1"
                  value={pipe.type}
                  onChange={(e) => handleChange(idx, 'type', e.target.value)}
                >
                  <option value={ComponentType.PIPE}>Pipe</option>
                  <option value={ComponentType.PUMP}>Pump</option>
                  <option value={ComponentType.VALVE}>Valve</option>
                </select>
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-col gap-1">
                  <input className="w-16 bg-white border border-slate-200 rounded text-[10px] p-1" placeholder="Start Node" value={pipe.startNode} onChange={(e) => handleChange(idx, 'startNode', e.target.value)} />
                  <input className="w-16 bg-white border border-slate-200 rounded text-[10px] p-1" placeholder="End Node" value={pipe.endNode} onChange={(e) => handleChange(idx, 'endNode', e.target.value)} />
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <input type="number" className="w-10 bg-white border border-slate-200 rounded text-[10px] p-1" value={pipe.startX} onChange={(e) => handleChange(idx, 'startX', parseFloat(e.target.value))} />
                  <input type="number" className="w-10 bg-white border border-slate-200 rounded text-[10px] p-1" value={pipe.startY} onChange={(e) => handleChange(idx, 'startY', parseFloat(e.target.value))} />
                  <input type="number" className="w-10 bg-white border border-slate-200 rounded text-[10px] p-1" value={pipe.startZ} onChange={(e) => handleChange(idx, 'startZ', parseFloat(e.target.value))} />
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <input type="number" className="w-10 bg-white border border-slate-200 rounded text-[10px] p-1" value={pipe.endX} onChange={(e) => handleChange(idx, 'endX', parseFloat(e.target.value))} />
                  <input type="number" className="w-10 bg-white border border-slate-200 rounded text-[10px] p-1" value={pipe.endY} onChange={(e) => handleChange(idx, 'endY', parseFloat(e.target.value))} />
                  <input type="number" className="w-10 bg-white border border-slate-200 rounded text-[10px] p-1" value={pipe.endZ} onChange={(e) => handleChange(idx, 'endZ', parseFloat(e.target.value))} />
                </div>
              </td>
              <td className="px-4 py-2">
                <input 
                  type="number" 
                  className="w-16 bg-white border border-slate-200 rounded p-1 text-xs" 
                  value={units.length.fromMm(pipe.diameter_mm, lengthUnit).toFixed(1)} 
                  onChange={(e) => handleChange(idx, 'diameter_mm', units.length.toMm(parseFloat(e.target.value), lengthUnit))} 
                />
              </td>
              <td className="px-4 py-2">
                {pipe.type === ComponentType.PIPE ? (
                  <>
                    <select 
                      className="bg-white border border-slate-200 rounded p-1 text-[10px] w-full mb-1"
                      value={pipe.material}
                      onChange={(e) => handleChange(idx, 'material', e.target.value)}
                    >
                      {Object.keys(MATERIALS).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input type="number" step="0.1" className="w-full bg-white border border-slate-200 rounded p-1 text-[10px]" placeholder="K factor" value={pipe.minorLossK} onChange={(e) => handleChange(idx, 'minorLossK', parseFloat(e.target.value))} />
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Discrete Component</span>
                )}
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-col gap-1">
                  {pipe.type !== ComponentType.PIPE && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400">{pipe.type === ComponentType.PUMP ? 'Head(m)' : 'K'}</span>
                      <input type="number" className="w-full bg-white border border-blue-200 rounded p-1 text-xs font-bold text-blue-700" value={pipe.compValue} onChange={(e) => handleChange(idx, 'compValue', parseFloat(e.target.value))} />
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400">{flowUnit}</span>
                    <input 
                      type="number" 
                      className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-semibold" 
                      value={units.flow.fromLps(pipe.flow_lps, flowUnit).toFixed(2)} 
                      onChange={(e) => handleChange(idx, 'flow_lps', units.flow.toLps(parseFloat(e.target.value), flowUnit))} 
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 text-right">
                <button onClick={() => removePipe(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PipeTable;
