import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Save, X, MessageSquare, Ban, Unlock, CheckSquare, Image as ImageIcon, AlertCircle, Timer } from 'lucide-react';
import ActionButton from '../components/common/ActionButton';

const DetailItem = ({ label, value, textColor = 'text-slate-200' }) => (
  <div className="bg-[#0e1525] p-6 rounded-xl border border-white/5 shadow-inner flex flex-col justify-center">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">{label}</span>
    <div className={`text-lg font-medium truncate ${textColor}`}>
      {value}
    </div>
  </div>
);

const TicketDetailsView = ({ ticket, onBack, onUpdateStatus, onAddUpdate, currentUser }) => {
  const [pendingAction, setPendingAction] = useState(null);
  const [reason, setReason] = useState('');
  
  // Estado para o Cronômetro
  const [timeLeft, setTimeLeft] = useState('');

  const isTech = ['admin', 'tecnico', 'tecnico_n3'].includes(currentUser?.role);
  const isRequester = currentUser?.name === ticket.requester;
  const isAssignee = ticket.assignee === currentUser?.name;

  // --- CORES DA PRIORIDADE ---
  const getPriorityBadgeColor = (priority, isExpired) => {
    // Se estiver atrasado, força vermelho piscante, senão usa a cor da prioridade
    if (isExpired) return 'bg-red-600 text-white border-red-700 animate-pulse';

    switch(priority) {
      case 'critica': return 'bg-red-600 text-white border-red-700';
      case 'alta': return 'bg-orange-500 text-white border-orange-600';
      case 'media': return 'bg-yellow-500 text-black border-yellow-600';
      case 'baixa': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-slate-600 text-white';
    }
  };

  const priorityLabels = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa'
  };

  const statusLabels = {
    aberto: 'Novo',
    pendente: 'Pendente',
    em_andamento: 'Em Atendimento', 
    concluido: 'Finalizado',
    cancelado: 'Cancelado'
  };

  // --- LÓGICA DO CRONÔMETRO (useEffect) ---
  useEffect(() => {
    const calculateTime = () => {
      if (!ticket.sla_deadline_seconds) return 'Sem SLA';
      
      const isClosed = ['concluido', 'cancelado'].includes(ticket.status);
      if (isClosed) return 'Finalizado';

      const deadline = new Date(ticket.sla_deadline_seconds * 1000);
      const now = new Date();
      const diff = deadline - now;
      
      const isExpired = diff < 0;
      const absDiff = Math.abs(diff);

      // Cálculos matemáticos de tempo
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

      // Formatação hh:mm:ss
      const formattedTime = `${days > 0 ? days + 'd ' : ''}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

      if (isExpired) {
        return `Atrasado: ${formattedTime}`;
      } else {
        return `Restam: ${formattedTime}`;
      }
    };

    // Atualiza imediatamente e depois a cada 1 segundo
    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket.sla_deadline_seconds, ticket.status]);

  // --- LÓGICA DE DATA COMPLETA (SLA) ---
  const getSLAStatus = () => {
    if (!ticket.sla_deadline_seconds) return { text: 'Não definido', color: 'text-slate-500' };

    const deadline = new Date(ticket.sla_deadline_seconds * 1000);
    const now = new Date();
    const isExpired = now > deadline;
    const isClosed = ['concluido', 'cancelado'].includes(ticket.status);

    // Formatação completa: DD/MM/AAAA às HH:MM
    const dateStr = deadline.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (isClosed) {
      return { text: `${dateStr} (Encerrado)`, color: 'text-slate-400' };
    }

    if (isExpired) {
      return { 
        text: `${dateStr}`, 
        color: 'text-red-500 font-bold' 
      };
    }

    return { 
      text: `${dateStr}`, 
      color: 'text-emerald-400 font-bold' 
    };
  };

  const slaInfo = getSLAStatus();
  
  // Helper para verificar se está expirado para pintar o cronômetro
  const isSlaExpired = () => {
    if (!ticket.sla_deadline_seconds) return false;
    if (['concluido', 'cancelado'].includes(ticket.status)) return false;
    return new Date() > new Date(ticket.sla_deadline_seconds * 1000);
  };

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

  const handleOpenImage = () => {
    const imageWindow = window.open("");
    imageWindow.document.write(`<img src="${ticket.attachment}" style="max-width: 100%; height: auto;" />`);
  };

  const sideCardColors = {
    aberto: 'bg-emerald-500',
    pendente: 'bg-orange-500',
    em_andamento: 'bg-blue-600',
    concluido: 'bg-slate-600',
    cancelado: 'bg-red-600'
  };

  const updates = Array.isArray(ticket.updates) ? ticket.updates : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
      <button 
        onClick={onBack} 
        className="bg-[#0B1A38] hover:bg-[#152347] text-white px-5 py-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Lista
      </button>

      {/* Cabeçalho do Ticket */}
      <div className="bg-[#1a2236] rounded-2xl overflow-hidden shadow-2xl border border-white/5 flex flex-col lg:flex-row min-h-[250px]">
        <div className="p-8 lg:p-10 flex-1 space-y-8">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl text-slate-200 font-bold">Detalhes do Chamado</h2>
            <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full text-xs font-bold border border-blue-500/30">
              <Clock className="w-4 h-4" />
              {getTimeAgo(ticket.created_seconds)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem label="Categoria / Assunto" value={ticket.title} />
            <DetailItem label="Local / Setor" value={ticket.location || "Geral / Não informado"} />
            
            {/* --- CRONÔMETRO DE PRIORIDADE --- */}
            <DetailItem 
              label="Prioridade / Tempo SLA" 
              value={
                <div className="flex flex-col items-start gap-2">
                  <span className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border shadow-sm font-bold uppercase tracking-wide w-full justify-center ${getPriorityBadgeColor(ticket.priority, isSlaExpired())}`}>
                    <Timer className="w-4 h-4" />
                    {priorityLabels[ticket.priority] || ticket.priority}
                  </span>
                  <span className={`text-sm font-mono font-bold w-full text-center ${isSlaExpired() ? 'text-red-400' : 'text-emerald-400'}`}>
                    {timeLeft}
                  </span>
                </div>
              } 
            />
            {/* -------------------------------- */}

            <DetailItem label="Atendente" value={ticket.assignee || "Aguardando"} textColor={ticket.assignee ? 'text-blue-400' : 'text-slate-400'} />
            
            {/* SLA COM DATA COMPLETA */}
            <DetailItem label="Vencimento do SLA" value={slaInfo.text} textColor={slaInfo.color} />
             
            <DetailItem label="Criador" value={ticket.requester} />
          </div>
        </div>
        
        {/* Card Lateral (Status Grande) */}
        <div className={`p-10 lg:w-96 flex flex-col justify-center items-center text-center ${
          sideCardColors[ticket.status] || 'bg-slate-600'
        } relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-full bg-white/5"></div>
          <p className="text-sm text-white/80 font-bold uppercase tracking-widest mb-3 z-10">Chamado Nº</p>
          <h1 className="text-6xl font-black text-white mb-6 z-10">#{ticket.id}</h1>
          <div className="bg-white/20 px-6 py-2 rounded-full text-base font-bold text-white backdrop-blur-sm z-10 shadow-lg">
            {statusLabels[ticket.status]}
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="bg-[#1a2236] rounded-2xl p-8 lg:p-10 shadow-xl border border-white/5">
        <h3 className="text-xl text-slate-200 font-bold mb-6">Descrição do Problema</h3>
        <div className="bg-[#0e1525] p-8 rounded-xl text-slate-300 text-base leading-relaxed border border-slate-700/50 min-h-[150px] whitespace-pre-wrap">
          {ticket.description}
        </div>
      </div>

      {/* Evidência */}
      {ticket.attachment && (
        <div className="bg-[#1a2236] rounded-2xl p-8 lg:p-10 shadow-xl border border-white/5">
          <h3 className="text-xl text-slate-200 font-bold mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            Evidência / Printscreen
          </h3>
          <div className="bg-[#0e1525] p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center group">
            <div className="relative cursor-pointer" onClick={handleOpenImage}>
               <img 
                src={ticket.attachment} 
                alt="Evidência do chamado" 
                className="max-h-[500px] w-auto rounded-lg shadow-2xl border border-slate-800 transition-transform group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                <span className="text-white font-bold bg-black/60 px-4 py-2 rounded-full">Clique para ampliar</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 italic">
              Clique na imagem para visualizar em tamanho original.
            </p>
          </div>
        </div>
      )}
      
      {/* Histórico e Ações */}
      {updates.length > 0 && (
        <div className="bg-[#1a2236] rounded-2xl p-8 lg:p-10 shadow-xl border border-white/5">
          <h3 className="text-xl text-slate-200 font-bold mb-6">Histórico de Acompanhamento</h3>
          <div className="space-y-6">
            {updates.map((upd, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-col items-center hidden md:flex">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    {upd.author?.charAt(0) || 'S'}
                  </div>
                  <div className="w-0.5 h-full bg-slate-700/50 mt-2"></div>
                </div>
                <div className="bg-[#0e1525] p-6 rounded-xl border border-slate-700/50 flex-1 shadow-sm">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-bold text-[#86efac]">{upd.author}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(upd.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-base text-slate-300">{upd.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de Ações */}
      <div className="bg-[#1a2236] rounded-2xl p-8 shadow-xl border border-white/5 relative">
        <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-6">Ações Disponíveis</h3>
        
        {(ticket.status === 'aberto' || ticket.status === 'pendente') && isTech && (
          <button 
            onClick={handleAssignToMe} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 text-lg rounded-xl shadow-lg shadow-orange-900/20 transition-all transform hover:scale-[1.01]"
          >
            Atribuir a mim
          </button>
        )}

        {(ticket.status === 'aberto' || ticket.status === 'pendente') && !isTech && (
          <div className="text-center py-6 bg-[#0e1525] rounded-xl border border-dashed border-slate-700">
            <p className="text-slate-400 text-base">
              Aguardando um técnico assumir este chamado. Você será notificado quando houver movimentação.
            </p>
          </div>
        )}

        {ticket.status === 'em_andamento' && !pendingAction && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(isAssignee || isRequester) && (
              <ActionButton 
                icon={MessageSquare} 
                label="Responder" 
                color="bg-blue-600 hover:bg-blue-700 py-4 text-base" 
                onClick={() => initiateAction('acompanhar', 'Adicionar Interação')} 
              />
            )}

            {isAssignee && (
              <>
                <ActionButton 
                  icon={Ban} 
                  label="Cancelar" 
                  color="bg-red-600 hover:bg-red-700 py-4 text-base" 
                  onClick={() => initiateAction('cancelar', 'Cancelar Chamado')} 
                />
                <ActionButton 
                  icon={Unlock} 
                  label="Liberar" 
                  color="bg-purple-600 hover:bg-purple-700 py-4 text-base" 
                  onClick={() => initiateAction('liberar', 'Liberar Chamado')} 
                />
                <ActionButton 
                  icon={CheckSquare} 
                  label="Finalizar" 
                  color="bg-[#0B1A38] hover:bg-slate-900 border border-slate-600 py-4 text-base" 
                  onClick={() => initiateAction('finalizar', 'Finalizar Chamado')} 
                />
              </>
            )}
          </div>
        )}
        
        {pendingAction && (
          <div className="mt-8 bg-[#0e1525] p-8 rounded-xl border border-blue-500/30 animate-fade-in shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-white">{pendingAction.label}</h4>
              <button 
                onClick={() => setPendingAction(null)} 
                className="text-slate-500 hover:text-white"
              >
                <X className="w-6 h-6"/>
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Mensagem / Observação (Obrigatório)</p>
            <textarea 
              className="w-full bg-[#1a2236] border border-slate-700 rounded-lg p-4 text-white text-base focus:border-blue-500 focus:outline-none mb-6 h-40 resize-none"
              placeholder="Digite sua mensagem aqui..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            ></textarea>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setPendingAction(null)} 
                className="px-6 py-3 text-slate-400 hover:text-white text-sm font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmAction} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!reason.trim()}
              >
                <Save className="w-5 h-5" />
                Confirmar
              </button>
            </div>
          </div>
        )}

        {(ticket.status === 'concluido' || ticket.status === 'cancelado') && (
          <div className="text-center py-6 text-slate-500 text-base italic">
            Este chamado foi {ticket.status}. Nenhuma ação disponível.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsView;