import { Check } from 'lucide-react';

const SolveLogo = ({ className = "w-8 h-8", showText = true, textSize = "text-2xl" }) => (
  <div className="flex flex-col items-center justify-center">
    <div className="flex items-center gap-1">
      <div className="relative">
         <Check className={`text-[#86efac] ${className} stroke-[3]`} />
      </div>
      {showText && (
        <h1 className={`${textSize} font-black tracking-tighter text-[#86efac] font-sans italic`}>
          Solve
        </h1>
      )}
    </div>
    {showText && <span className="text-[10px] text-slate-400 tracking-widest uppercase mt-[-2px]">Gestão de Chamados</span>}
  </div>
);

export default SolveLogo;