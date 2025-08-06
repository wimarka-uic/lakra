import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-beauty-bush-300/35 via-beauty-bush-200/25 to-transparent animate-pulse"></div>
      
      {/* Circuit nodes - distributed across entire page */}
      <div className="absolute top-1/12 left-1/12 w-2 h-2 bg-beauty-bush-400/95 rounded-full animate-pulse"></div>
      <div className="absolute top-1/12 right-1/12 w-2 h-2 bg-blue-400/95 rounded-full animate-ping"></div>
      <div className="absolute top-1/6 left-1/6 w-2 h-2 bg-green-400/95 rounded-full animate-pulse"></div>
      <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-purple-400/95 rounded-full animate-ping"></div>
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/95 rounded-full animate-pulse"></div>
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-pink-400/95 rounded-full animate-ping"></div>
      <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-yellow-400/95 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-indigo-400/95 rounded-full animate-ping"></div>
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-teal-400/95 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-rose-400/95 rounded-full animate-ping"></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-cyan-400/95 rounded-full animate-pulse"></div>
      <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-emerald-400/95 rounded-full animate-ping"></div>
      <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-amber-400/95 rounded-full animate-pulse"></div>
      <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-violet-400/95 rounded-full animate-ping"></div>
      <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-lime-400/95 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-sky-400/95 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-fuchsia-400/95 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-slate-400/95 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-stone-400/95 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/6 left-1/6 w-2 h-2 bg-zinc-400/95 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/6 right-1/6 w-2 h-2 bg-neutral-400/95 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/12 left-1/12 w-2 h-2 bg-red-400/95 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/12 right-1/12 w-2 h-2 bg-orange-400/95 rounded-full animate-pulse"></div>
      
      {/* Circuit connections - horizontal lines covering entire page */}
      <div className="absolute top-1/12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-beauty-bush-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-1/6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-2/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent animate-pulse"></div>
      <div className="absolute bottom-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent animate-ping"></div>
      <div className="absolute bottom-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent animate-pulse"></div>
      <div className="absolute bottom-1/6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-rose-400/40 to-transparent animate-ping"></div>
      <div className="absolute bottom-1/12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-pulse"></div>
      
      {/* Additional horizontal lines for more density */}
      <div className="absolute top-1/8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-3/8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-5/8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-7/8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-lime-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-1/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-sky-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-3/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-5/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-7/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-stone-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-9/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-zinc-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-11/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neutral-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-13/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-15/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400/40 to-transparent animate-ping"></div>
      
      {/* Circuit connections - vertical lines covering entire page */}
      <div className="absolute top-0 left-1/12 w-0.5 h-full bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-1/6 w-0.5 h-full bg-gradient-to-b from-transparent via-amber-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-violet-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-lime-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-sky-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-2/3 w-0.5 h-full bg-gradient-to-b from-transparent via-fuchsia-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-3/4 w-0.5 h-full bg-gradient-to-b from-transparent via-slate-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-5/6 w-0.5 h-full bg-gradient-to-b from-transparent via-stone-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-11/12 w-0.5 h-full bg-gradient-to-b from-transparent via-zinc-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 right-1/12 w-0.5 h-full bg-gradient-to-b from-transparent via-neutral-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-1/6 w-0.5 h-full bg-gradient-to-b from-transparent via-red-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-orange-400/40 to-transparent animate-pulse"></div>
      
      {/* Additional vertical lines for more density */}
      <div className="absolute top-0 left-1/8 w-0.5 h-full bg-gradient-to-b from-transparent via-beauty-bush-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-3/8 w-0.5 h-full bg-gradient-to-b from-transparent via-blue-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-5/8 w-0.5 h-full bg-gradient-to-b from-transparent via-green-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-7/8 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-1/16 w-0.5 h-full bg-gradient-to-b from-transparent via-orange-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-3/16 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-5/16 w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-7/16 w-0.5 h-full bg-gradient-to-b from-transparent via-indigo-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-9/16 w-0.5 h-full bg-gradient-to-b from-transparent via-teal-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-11/16 w-0.5 h-full bg-gradient-to-b from-transparent via-rose-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 left-13/16 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-15/16 w-0.5 h-full bg-gradient-to-b from-transparent via-red-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 right-1/8 w-0.5 h-full bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-3/8 w-0.5 h-full bg-gradient-to-b from-transparent via-amber-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 right-5/8 w-0.5 h-full bg-gradient-to-b from-transparent via-violet-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-7/8 w-0.5 h-full bg-gradient-to-b from-transparent via-lime-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 right-1/16 w-0.5 h-full bg-gradient-to-b from-transparent via-sky-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-3/16 w-0.5 h-full bg-gradient-to-b from-transparent via-fuchsia-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 right-5/16 w-0.5 h-full bg-gradient-to-b from-transparent via-slate-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-7/16 w-0.5 h-full bg-gradient-to-b from-transparent via-stone-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 right-9/16 w-0.5 h-full bg-gradient-to-b from-transparent via-zinc-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-11/16 w-0.5 h-full bg-gradient-to-b from-transparent via-neutral-400/40 to-transparent animate-ping"></div>
      <div className="absolute top-0 right-13/16 w-0.5 h-full bg-gradient-to-b from-transparent via-red-400/40 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-15/16 w-0.5 h-full bg-gradient-to-b from-transparent via-orange-400/40 to-transparent animate-ping"></div>
      
      {/* Diagonal circuit connections - crisscrossing the page */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-beauty-bush-400/40 to-transparent transform rotate-45 origin-left animate-pulse"></div>
      <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent transform -rotate-45 origin-right animate-ping"></div>
      <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/40 to-transparent transform rotate-30 origin-left animate-pulse"></div>
      <div className="absolute top-1/4 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent transform -rotate-30 origin-right animate-ping"></div>
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400/40 to-transparent transform rotate-15 origin-left animate-pulse"></div>
      <div className="absolute top-1/2 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent transform -rotate-15 origin-right animate-ping"></div>
      <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent transform rotate-60 origin-left animate-pulse"></div>
      <div className="absolute top-3/4 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent transform -rotate-60 origin-right animate-ping"></div>
      
      {/* Additional diagonal lines for more density */}
      <div className="absolute top-1/8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent transform rotate-20 origin-left animate-pulse"></div>
      <div className="absolute top-1/8 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent transform -rotate-20 origin-right animate-ping"></div>
      <div className="absolute top-3/8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent transform rotate-40 origin-left animate-pulse"></div>
      <div className="absolute top-3/8 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-lime-400/40 to-transparent transform -rotate-40 origin-right animate-ping"></div>
      <div className="absolute top-5/8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-sky-400/40 to-transparent transform rotate-10 origin-left animate-pulse"></div>
      <div className="absolute top-5/8 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent transform -rotate-10 origin-right animate-ping"></div>
      <div className="absolute top-7/8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-400/40 to-transparent transform rotate-50 origin-left animate-pulse"></div>
      <div className="absolute top-7/8 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-stone-400/40 to-transparent transform -rotate-50 origin-right animate-ping"></div>
      <div className="absolute top-1/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-zinc-400/40 to-transparent transform rotate-25 origin-left animate-pulse"></div>
      <div className="absolute top-1/16 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neutral-400/40 to-transparent transform -rotate-25 origin-right animate-ping"></div>
      <div className="absolute top-3/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-400/40 to-transparent transform rotate-35 origin-left animate-pulse"></div>
      <div className="absolute top-3/16 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400/40 to-transparent transform -rotate-35 origin-right animate-ping"></div>
      <div className="absolute top-5/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent transform rotate-5 origin-left animate-pulse"></div>
      <div className="absolute top-5/16 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent transform -rotate-5 origin-right animate-ping"></div>
      <div className="absolute top-7/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-rose-400/40 to-transparent transform rotate-55 origin-left animate-pulse"></div>
      <div className="absolute top-7/16 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent transform -rotate-55 origin-right animate-ping"></div>
      <div className="absolute top-9/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent transform rotate-12 origin-left animate-pulse"></div>
      <div className="absolute top-9/16 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/40 to-transparent transform -rotate-12 origin-right animate-ping"></div>
      <div className="absolute top-11/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent transform rotate-28 origin-left animate-pulse"></div>
      <div className="absolute top-11/16 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent transform -rotate-28 origin-right animate-ping"></div>
      <div className="absolute top-13/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-beauty-bush-400/40 to-transparent transform rotate-42 origin-left animate-pulse"></div>
      <div className="absolute top-13/16 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent transform -rotate-42 origin-right animate-ping"></div>
      <div className="absolute top-15/16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent transform rotate-8 origin-left animate-pulse"></div>
      <div className="absolute top-15/16 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent transform -rotate-8 origin-right animate-ping"></div>
      
      {/* Circuit power flows - multiple nodes with staggered timing */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-beauty-bush-400/95 rounded-full animate-ping"></div>
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-beauty-bush-400/45 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-beauty-bush-400/25 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/95 rounded-full animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-blue-400/45 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-blue-400/25 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
      
      <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-green-400/95 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/4 left-3/4 w-2 h-2 bg-green-400/45 rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
      <div className="absolute bottom-1/4 left-3/4 w-3 h-3 bg-green-400/25 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
    </>
  );
};

export default AnimatedBackground; 