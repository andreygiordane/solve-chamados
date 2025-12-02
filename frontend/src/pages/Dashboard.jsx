import React from 'react';
import { Bell, BellOff, RefreshCw, Search, ChevronRight, User, Clock } from 'lucide-react';
import DashboardCard from '../components/common/DashboardCard.jsx';

const DashboardTicketItem = ({ ticket, onClick }) => {
  const getStyle = (status) => {
    switch(status) {
      case 'aberto': return 'bg-emerald-500';
      case 'em_andamento': return 'bg-blue-600';
      case 'pendente': return 'bg-orange-500';
      default: return 'bg-slate-600';
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const seconds = Math.floor((new Date() - new Date(timestamp * 1000)) / 1000);
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)} h`;
    return `há ${Math.floor(seconds / 86400)} dias`;
  };

  return (
    <div 
      className={`${getStyle(ticket.status)} w-full rounded-md p-4 text-white shadow-md flex justify-between items-center gap-4 transition-all hover:brightness-105 cursor-pointer`} 
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm bg-black/20 px-2 py-0.5 rounded">#{ticket.id}</span>
          <span className="font-bold text-md truncate">{ticket.title}</span>
        </div>
        <div className="flex flex-col gap-1 text-xs opacity-90 pl-1">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>Criador: {ticket.requester}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded uppercase tracking-wider">
          {ticket.status === 'em_andamento' ? 'EM ATENDIMENTO' : ticket.status.toUpperCase()}
        </span>
        <div className="flex items-center gap-1 text-xs opacity-80">
          <Clock className="w-3 h-3" />
          <span>{getTimeAgo(ticket.created_seconds)}</span>
        </div>
      </div>
    </div>
  );
};

// Adicionei currentUser nas props
const DashboardView = ({ tickets, setView, config, setConfig, showToast, handleOpenTicket, currentUser }) => {
  
  // FILTRO DE PERMISSÃO
  // Se for admin ou técnico, vê tudo. Se não, só vê os seus.
  const userTickets = tickets.filter(t => {
    const isStaff = ['admin', 'tecnico', 'tecnico_n3'].includes(currentUser?.role);
    if (isStaff) return true;
    return t.requester === currentUser?.name;
  });

  // Calculamos as estatísticas baseadas apenas nos tickets permitidos
  const stats = {
    novos: userTickets.filter(t => t.status === 'aberto').length,
    pendentes: userTickets.filter(t => t.status === 'pendente').length,
    atendimento: userTickets.filter(t => t.status === 'em_andamento').length,
    solucionados: userTickets.filter(t => t.status === 'concluido').length,
    atrasados: userTickets.filter(t => t.priority === 'critica' && t.status !== 'concluido').length,
    cancelados: userTickets.filter(t => t.status === 'cancelado').length
  };

  const activeTickets = userTickets.filter(t => t.status !== 'concluido' && t.status !== 'cancelado');

  const toggleNotifications = () => {
    const newState = !config.notifications;
    setConfig(prev => ({ ...prev, notifications: newState }));
    showToast(newState ? "Notificações Ativadas" : "Notificações Desativadas", newState ? 'info' : 'warning');
  };

  const toggleAutoRefresh = () => {
    const newState = !config.autoRefresh;
    setConfig(prev => ({ ...prev, autoRefresh: newState }));
    showToast(newState ? "Auto-refresh Ativado (15s)" : "Auto-refresh Pausado", newState ? 'refresh' : 'warning');
  };

  return (
    <div className="space-y-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashboardCard title="Novos" count={stats.novos} color="bg-green-600" />
        <DashboardCard title="Pendentes" count={stats.pendentes} color="bg-orange-500" />
        <DashboardCard title="Em Atendimento" count={stats.atendimento} color="bg-blue-600" />
        <DashboardCard title="Solucionados" count={stats.solucionados} color="bg-slate-600" />
        <DashboardCard title="Atrasados" count={stats.atrasados} color="bg-[#5C4033]" />
        <DashboardCard title="Cancelados" count={stats.cancelados} color="bg-red-600" />
      </div>

      <div className="flex justify-center gap-4 py-2">
        <button 
          onClick={toggleNotifications} 
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transform transition-all hover:scale-110 active:scale-95 ${
            config.notifications ? 'bg-cyan-400 text-[#0e1525]' : 'bg-slate-700 text-slate-400'
          }`}
        >
          {config.notifications ? <Bell className="w-7 h-7" /> : <BellOff className="w-7 h-7" />}
        </button>
        <button 
          onClick={toggleAutoRefresh} 
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transform transition-all hover:scale-110 active:scale-95 ${
            config.autoRefresh ? 'bg-cyan-400 text-[#0e1525]' : 'bg-slate-700 text-slate-400'
          }`}
        >
          <RefreshCw className={`w-7 h-7 ${config.autoRefresh ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {activeTickets.length === 0 ? (
          <div className="bg-[#1a2236] p-8 rounded text-center border border-white/5">
            <p className="text-slate-500">Nenhum chamado ativo encontrado para seu perfil.</p>
            <button 
              onClick={() => setView('new-ticket')} 
              className="mt-4 text-blue-400 hover:underline text-sm"
            >
              Abrir um novo chamado
            </button>
          </div>
        ) : (
          activeTickets.map(ticket => (
            <DashboardTicketItem 
              key={ticket.id} 
              ticket={ticket} 
              onClick={() => handleOpenTicket(ticket.id)} 
            />
          ))
        )}
      </div>
      
      <div 
        onClick={() => setView('reports')} 
        className="bg-blue-500 hover:bg-blue-600 rounded-md p-4 flex items-center justify-between text-white shadow-lg cursor-pointer transition-all"
      >
        <div className="text-sm font-medium flex items-center gap-2">
          <Search className="w-4 h-4"/> 
          <span>Acesse os relatórios para exportar dados.</span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export default DashboardView;