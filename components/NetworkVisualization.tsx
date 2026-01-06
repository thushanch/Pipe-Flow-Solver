
import React, { useEffect, useState } from 'react';
import { PipeResult } from '../types';

// Plotly needs special loading because it's heavy and usually accessed via script tag or npm
// For this environment, we'll use a dynamic import approach or a reliable CDN reference if possible.
// We'll mock the visualization container if Plotly isn't ready.

declare global {
  interface Window {
    Plotly: any;
  }
}

const NetworkVisualization: React.FC<{ results: PipeResult[] }> = ({ results }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-2.24.1.min.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.Plotly) return;

    const data = results.flatMap(pipe => {
      // Color coding by velocity
      let color = '#22c55e'; // Green < 2m/s
      if (pipe.velocity_ms > 3.0) color = '#ef4444'; // Red > 3m/s (Erosion risk)
      else if (pipe.velocity_ms > 2.0) color = '#f59e0b'; // Amber

      return {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: [pipe.startX, pipe.endX],
        y: [pipe.startY, pipe.endY],
        z: [pipe.startZ, pipe.endZ],
        line: { width: 6, color: color },
        marker: { size: 4, color: '#1e293b' },
        name: `${pipe.id} (V=${pipe.velocity_ms.toFixed(1)}m/s)`,
        hoverinfo: 'text',
        text: `<b>${pipe.id}</b><br>Velocity: ${pipe.velocity_ms.toFixed(2)} m/s<br>Head Loss: ${pipe.totalHeadLoss_m.toFixed(2)} m`
      };
    });

    const layout = {
      title: false,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      scene: {
        xaxis: { title: 'X (m)', backgroundcolor: '#f8fafc', showbackground: true, gridcolor: '#e2e8f0' },
        yaxis: { title: 'Y (m)', backgroundcolor: '#f8fafc', showbackground: true, gridcolor: '#e2e8f0' },
        zaxis: { title: 'Z (Elev)', backgroundcolor: '#f1f5f9', showbackground: true, gridcolor: '#cbd5e1' },
        camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
      },
      showlegend: false
    };

    window.Plotly.newPlot('plotly-container', data, layout, { responsive: true, displayModeBar: false });
  }, [results, isLoaded]);

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
           3D Spatial View
        </h2>
        <div className="flex gap-2">
           <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-green-500"></div> Safe</span>
           <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-red-500"></div> Erosion Risk</span>
        </div>
      </div>
      <div id="plotly-container" className="w-full h-[400px] border border-slate-100 rounded-lg overflow-hidden">
        {!isLoaded && <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Initializing Visualization Engine...</div>}
      </div>
    </section>
  );
};

export default NetworkVisualization;
