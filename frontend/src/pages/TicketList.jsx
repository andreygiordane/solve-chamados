import React, { useState } from 'react';
import { Search, Filter, Plus, Ticket, Clock, User, AlertCircle } from 'lucide-react';

const TicketList = ({ tickets, assets, handleOpenTicket, setView, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Filtro de Visibilidade
  const accessibleTickets = tickets.filter(t => {
    const isStaff = ['admin', 'tecnico', 'tecnico_n3'].includes(currentUser?.role);
    if (isStaff) return true; 
    return t.requester === currentUser?.name;
  });

  const filteredTickets = accessibleTickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().includes(searchTerm) ||
      ticket.requester.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' ? true : ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // CORES ATUALIZADAS (Iguais ao Dashboard)
  // Usando cores sólidas para corresponder aos cards do dashboard
  const getStatusColor = (status) => {
    switch(status) {
      case 'aberto': return 'bg-emerald-500 text-white border-emerald-600';     // Verde (Novos)
      case 'pendente': return 'bg-orange-500 text-white border-orange-600';     // Laranja (Pendentes)
      case 'em_andamento': return 'bg-blue-600 text-white border-blue-700';     // Azul (Em atendimento)
      case 'concluido': return 'bg-slate-600 text-white border-slate-700';      // Cinza (Solucionados)
      case 'cancelado': return 'bg-red-600 text-white border-red-700';          // Vermelho (Cancelados)
      default: return 'bg-slate-700 text-white';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critica': return 'text-red-500 font-black animate-pulse';
      case 'alta': return 'text-orange-400 font-bold';
      case 'media': return 'text-yellow-400 font-medium';
      case 'baixa': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col md:flex-row justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl text-slate-200 font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-500" />
            Chamados
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {accessibleTickets.length} chamados encontrados
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por ID, assunto..." 
              className="w-full md:w-64 bg-[#1a2236] border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <select 
              className="w-full md:w-48 bg-[#1a2236] border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="aberto">Novos / Abertos</option>
              <option value="em_andamento">Em Atendimento</option>
              <option value="pendente">Pendentes</option>
              <option value="concluido">Concluídos</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>

          <button 
            onClick={() => setView('new-ticket')} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> 
            Novo Chamado
          </button>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-[#1a2236] rounded-xl border border-dashed border-slate-700">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-400">Nenhum chamado encontrado</h3>
            <p className="text-slate-500 text-sm mt-2">Tente ajustar os filtros ou crie um novo chamado.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => handleOpenTicket(ticket.id)}
              className="bg-[#1a2236] p-4 rounded-xl border border-white/5 hover:border-blue-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Lado Esquerdo: Info Principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-[#0e1525] px-2 py-1 rounded">
                      #{ticket.id}
                    </span>
                    {/* Badge de Status Atualizada com cores sólidas */}
                    <span className={`text-xs px-3 py-1 rounded-full border shadow-sm font-bold uppercase tracking-wide ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    {ticket.priority === 'critica' && (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-bold animate-pulse">
                        <AlertCircle className="w-3 h-3" /> Crítica
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                    {ticket.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span>{ticket.requester}</span>
                    </div>
                    {ticket.assignee && (
                      <div className="flex items-center gap-1.5 text-blue-300">
                        <span>→ Atendido por: {ticket.assignee}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lado Direito: Datas e Meta */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 text-xs text-slate-500 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-6 min-w-[140px]">
                  <div className="flex items-center gap-1.5" title="Data de Abertura">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ticket.created_seconds * 1000).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="text-right">
                    Prioridade: <span className={`uppercase ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;