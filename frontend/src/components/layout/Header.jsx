import { Bell } from 'lucide-react';

const Header = ({ view }) => {
  const getTitle = () => {
    switch(view) {
      case 'dashboard': return 'Dashboard Geral';
      case 'tickets': return 'Lista de Chamados';
      case 'new-ticket': return 'Novo Chamado';
      case 'assets': return 'Gestão de Equipamentos';
      case 'users': return 'Gestão de Usuários';
      case 'groups': return 'Grupos de Permissão';
      case 'reports': return 'Relatórios Gerenciais';
      default: return '';
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-[#131824] border-b border-white/5 p-4 flex justify-between items-center print:hidden">
      <h2 className="text-xl text-slate-200 font-light uppercase tracking-wide">
        {getTitle()}
      </h2>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;