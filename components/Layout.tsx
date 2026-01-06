
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
              H
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">HydroFlow 3D</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide mt-1 uppercase">Hydraulic Engineering Console</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
                <a href="#" className="text-blue-600">Analyzer</a>
                <a href="#" className="hover:text-slate-900">Reports</a>
                <a href="#" className="hover:text-slate-900">Library</a>
             </nav>
             <div className="h-8 w-px bg-slate-200 mx-2"></div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight">Solver Active</span>
             </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        HydroFlow 3D Solver &copy; {new Date().getFullYear()} - Professional Engineering Suite
      </footer>
    </div>
  );
};

export default Layout;
