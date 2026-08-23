import React from 'react';

const Logo = ({ className = '', isDark = false }) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      {/* Pure text logo in purple color: hanout60 */}
      <div className="flex items-center tracking-tight">
        <span
          className={`text-2xl sm:text-3xl font-black font-cairo lowercase transition-colors ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          hanout
        </span>
        <span
          className="mr-1 text-2xl sm:text-3xl font-black font-cairo text-white bg-purple-600 px-2 py-0.5 rounded-xl shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform"
        >
          60
        </span>
      </div>

      {/* Arabic store sub-badge */}
      <div className="hidden sm:flex flex-col pr-1 border-r border-slate-200/50">
        <span className={`text-[11px] font-extrabold leading-none ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
          حانوت 60
        </span>
        <span className="text-[9px] text-slate-400 font-medium">تيارت</span>
      </div>
    </div>
  );
};

export default Logo;
