import React from 'react';

const SidebarItem = ({ icon: Icon, label, active, onClick, badge, badgeColor = "bg-blue-500" }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors relative ${
      active 
        ? 'text-white bg-white/10 border-l-4 border-[#86efac]' 
        : 'text-slate-400 hover:bg-white/5 border-l-4 border-transparent hover:border-slate-600'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="flex-1 text-left">{label}</span>
    
    {badge && (
      <span className={`${badgeColor} text-white text-xs px-2 py-1 rounded-full min-w-5 h-5 flex items-center justify-center`}>
        {badge}
      </span>
    )}
  </button>
);

export const SubMenuItem = ({ label, onClick, active, icon: Icon, badge, disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 pl-14 pr-6 py-2 text-xs font-medium transition-colors uppercase tracking-wide relative ${
      disabled 
        ? 'text-slate-600 cursor-not-allowed' 
        : active 
          ? 'text-[#86efac]' 
          : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
    <span className="flex-1 text-left truncate">{label}</span>
    
    {badge && (
      <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-4 h-4 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

export default SidebarItem;