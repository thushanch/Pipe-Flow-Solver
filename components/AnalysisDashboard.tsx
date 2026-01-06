
import React from 'react';
import { PipeResult, FlowUnit, PressureUnit } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { units } from '../physicsEngine';

interface AnalysisDashboardProps {
  results: PipeResult[];
  flowUnit: FlowUnit;
  pressureUnit: PressureUnit;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ results, flowUnit, pressureUnit }) => {
  const chartData = results.map(r => ({
    name: r.id,
    headLoss: parseFloat(units.pressure.fromMeters(r.totalHeadLoss_m, pressureUnit).toFixed(2)),
    velocity: parseFloat(r.velocity_ms.toFixed(2))
  }));

  const totalHeadLoss = results.reduce((acc, r) => acc + r.totalHeadLoss_m, 0);
  const avgVelocity = results.reduce((acc, r) => acc + r.velocity_ms, 0) / Math.max(1, results.length);
  const exitHGL = results[results.length - 1]?.hglEnd_m || 0;

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        Hydraulic Performance
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase">System Head Loss</p>
          <p className="text-xl font-bold text-slate-900">
            {units.pressure.fromMeters(totalHeadLoss, pressureUnit).toFixed(2)} 
            <span className="text-xs text-slate-400 ml-1">{pressureUnit}</span>
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Avg Velocity</p>
          <p className="text-xl font-bold text-slate-900">{avgVelocity.toFixed(2)} <span className="text-xs text-slate-400">m/s</span></p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Exit Pressure</p>
          <p className="text-xl font-bold text-blue-600">
            {units.pressure.fromMeters(exitHGL, pressureUnit).toFixed(2)} 
            <span className="text-xs text-slate-400 text-blue-400 ml-1">{pressureUnit}</span>
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <p className="text-xs font-bold text-slate-400 mb-2 uppercase text-center">Velocity Distribution (m/s)</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="velocity" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.velocity > 3 ? '#ef4444' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase">Engineering Alerts</h3>
        <div className="space-y-2">
          {results.some(r => r.velocity_ms > 3) && (
             <div className="flex gap-3 bg-red-50 border border-red-100 p-2 rounded-lg text-xs text-red-700 font-medium items-start">
               <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               High velocity detected in segments. Consider increasing pipe diameters to prevent internal erosion.
             </div>
          )}
          {results.some(r => r.reynolds < 2300 && r.reynolds > 0) && (
             <div className="flex gap-3 bg-amber-50 border border-amber-100 p-2 rounded-lg text-xs text-amber-700 font-medium items-start">
               <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               Laminar flow regime identified (Re &lt; 2300). Accuracy may vary.
             </div>
          )}
          {results.some(r => r.hglEnd_m < 0) && (
             <div className="flex gap-3 bg-red-50 border border-red-100 p-2 rounded-lg text-xs text-red-700 font-medium items-start">
               <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               System failure: Vacuum/Negative pressure detected. Increase source head or add pumps.
             </div>
          )}
          {!results.some(r => r.velocity_ms > 3 || r.hglEnd_m < 0) && results.length > 0 && (
            <div className="text-center py-4">
              <span className="text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full border border-green-100">Network Stable</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalysisDashboard;
