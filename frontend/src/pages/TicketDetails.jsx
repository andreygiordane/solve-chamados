import React, { useState } from 'react';
import { ArrowLeft, Clock, Save, X, MessageSquare, Ban, Unlock, CheckSquare } from 'lucide-react';
import ActionButton from '../components/common/ActionButton';

const DetailItem = ({ label, value, highlight }) => (
  <div className="bg-[#0e1525] p-4 rounded-lg border border-white/5">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</span>
    <p className={`font-medium truncate ${highlight ? 'text-[#86efac]' : 'text-slate-200'}`}>{value}</p>
  </div>
);

const TicketDetailsView = ({ ticket, onBack, onUpdateStatus, onAddUpdate, currentUser }) => {
  const [pendingAction, setPendingAction] = useState(null);
  const [reason, setReason] = useState('');

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recente';
    const seconds = Math.floor((new Date() - new Date(timestamp * 1000)) / 1000);
    if (seconds < 60) return `há ${seconds} segundos`;
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)} horas`;
    return `há ${Math.floor(seconds / 86400)} dias`;
  };

  const handleAssignToMe = () => {
    onUpdateStatus(ticket.id, 'em_andamento', { assignee: currentUser.name });
    onAddUpdate(ticket.id, `Chamado atribuído a ${currentUser.name}`, currentUser.name);
  };

  const initiateAction = (type, label) => {
    setPendingAction({ type, label });
    setReason('');
  };

  const handleConfirmAction = () => {
    if (!reason.trim()) {
      alert("Por favor, descreva o motivo ou detalhe a ação.");
      return;
    }

    const actionMap = {
      'acompanhar': { status: null, logPrefix: 'Atualização' },
      'cancelar': { status: 'cancelado', logPrefix: 'Cancelamento' },
      'liberar': { status: 'pendente', logPrefix: 'Liberação', extraData: { assignee: null } },
      'finalizar': { status: 'concluido', logPrefix: 'Finalização' }
    };

    const config = actionMap[pendingAction.type];
    
    onAddUpdate(ticket.id, `${config.logPrefix}: ${reason}`, currentUser.name);

    if (config.status) {
      onUpdateStatus(ticket.id, config.status, config.extraData || {});
    }

    setPendingAction(null);
    setReason('');
  };

  const statusColors = {
    aberto: 'bg-orange-500',
    pendente: 'bg-purple-500', 
    em_andamento: 'bg-blue-600',
    concluido: 'bg-emerald-500',
    cancelado: 'bg-red-500'
  };

  const statusLabels = {
    aberto: 'Novo',
    pendente: 'Pendente',
    em_andamento: 'Em Atendimento', 
    concluido: 'Finalizado',
    cancelado: 'Cancelado'
  };

  // Garantir que updates seja um array
  const updates = Array.isArray(ticket.updates) ? ticket.updates : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <button 
        onClick={onBack} 
        className="bg-[#0B1A38] hover:bg-[#152347] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Lista
      </button>

      <div className="bg-[#1a2236] rounded-xl overflow-hidden shadow-lg border border-white/5 flex flex-col lg:flex-row">
        <div className="p-6 lg:p-8 flex-1 space-y-6">
          <h2 className="text-xl text-slate-200 font-semibold">Detalhes do Chamado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem label="Categoria / Assunto" value={ticket.title} />
            <DetailItem label="Local / Setor" value={ticket.location || "Geral / Não informado"} />
            <DetailItem label="Criador" value={ticket.requester} />
            <DetailItem label="Atendente" value={ticket.assignee || "Não informado"} highlight={!!ticket.assignee} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Aberto há:</span>
            <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
              <Clock className="w-3 h-3" />
              {getTimeAgo(ticket.created_seconds)}
            </div>
          </div>
        </div>
        
        <div className={`p-8 lg:w-80 flex flex-col justify-center items-center text-center ${
          statusColors[ticket.status] || 'bg-slate-600'
        } relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-full bg-white/5"></div>
          <p className="text-xs text-white/80 font-bold uppercase tracking-widest mb-2 z-10">Chamado Nº</p>
          <h1 className="text-5xl font-black text-white mb-4 z-10">#{ticket.id}</h1>
          <div className="bg-white/20 px-4 py-1 rounded-full text-sm font-bold text-white backdrop-blur-sm z-10">
            {statusLabels[ticket.status]}
          </div>
        </div>
      </div>

      <div className="bg-[#1a2236] rounded-xl p-6 lg:p-8 shadow-lg border border-white/5">
        <h3 className="text-lg text-slate-200 font-semibold mb-4">Descrição</h3>
        <div className="bg-[#0e1525] p-6 rounded-lg text-slate-300 text-sm leading-relaxed border border-slate-700/50 min-h-[120px]">
          {ticket.description}
        </div>
      </div>
      
      {updates.length > 0 && (
        <div className="bg-[#1a2236] rounded-xl p-6 lg:p-8 shadow-lg border border-white/5">
          <h3 className="text-lg text-slate-200 font-semibold mb-4">Histórico de Acompanhamento</h3>
          <div className="space-y-4">
            {updates.map((upd, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-col items-center hidden md:flex">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {upd.author?.charAt(0) || 'S'}
                  </div>
                  <div className="w-0.5 h-full bg-slate-700/50 mt-2"></div>
                </div>
                <div className="bg-[#0e1525] p-4 rounded-lg border border-slate-700/50 flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-[#86efac]">{upd.author}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(upd.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{upd.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#1a2236] rounded-xl p-6 shadow-lg border border-white/5 relative">
        <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-4">Ações do Atendente</h3>
        
        {(ticket.status === 'aberto' || ticket.status === 'pendente') && (
          <button 
            onClick={handleAssignToMe} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg shadow-lg shadow-orange-900/20 transition-all transform hover:scale-[1.01]"
          >
            Atribuir a mim
          </button>
        )}

        {ticket.status === 'em_andamento' && ticket.assignee === currentUser.name && !pendingAction && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton 
              icon={MessageSquare} 
              label="Acompanhar" 
              color="bg-blue-600 hover:bg-blue-700" 
              onClick={() => initiateAction('acompanhar', 'Adicionar Acompanhamento')} 
            />
            <ActionButton 
              icon={Ban} 
              label="Cancelar" 
              color="bg-red-600 hover:bg-red-700" 
              onClick={() => initiateAction('cancelar', 'Cancelar Chamado')} 
            />
            <ActionButton 
              icon={Unlock} 
              label="Liberar" 
              color="bg-purple-600 hover:bg-purple-700" 
              onClick={() => initiateAction('liberar', 'Liberar Chamado')} 
            />
            <ActionButton 
              icon={CheckSquare} 
              label="Finalizar" 
              color="bg-[#0B1A38] hover:bg-slate-900 border border-slate-600" 
              onClick={() => initiateAction('finalizar', 'Finalizar Chamado')} 
            />
          </div>
        )}
        
        {pendingAction && (
          <div className="mt-6 bg-[#0e1525] p-6 rounded-lg border border-blue-500/30 animate-fade-in shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">{pendingAction.label}</h4>
              <button 
                onClick={() => setPendingAction(null)} 
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Motivo / Descrição (Obrigatório)</p>
            <textarea 
              className="w-full bg-[#1a2236] border border-slate-700 rounded p-3 text-white text-sm focus:border-blue-500 focus:outline-none mb-4 h-32 resize-none"
              placeholder="Descreva detalhadamente o motivo desta ação..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setPendingAction(null)} 
                className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmAction} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!reason.trim()}
              >
                <Save className="w-4 h-4" />
                Confirmar e Salvar
              </button>
            </div>
          </div>
        )}

        {(ticket.status === 'concluido' || ticket.status === 'cancelado') && (
          <div className="text-center py-4 text-slate-500 text-sm italic">
            Este chamado foi {ticket.status}. Nenhuma ação disponível.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsView;