import React from 'react';
import { Plus } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

const TicketListView = ({ tickets, assets, handleOpenTicket, setView }) => {
  const getAssetName = (id) => {
    if (!id) return 'N/A';
    const asset = assets.find(a => a.id === id);
    return asset ? asset.name : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-white/10">
        <h3 className="text-white text-lg font-medium">Todos os Chamados</h3>
        <button 
          onClick={() => setView('new-ticket')} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Chamado
        </button>
      </div>
      
      <div className="bg-[#1a2236] rounded-lg border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-[#0e1525] text-slate-300 uppercase font-semibold text-xs">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assunto</th>
              <th className="px-6 py-4">Solicitante</th>
              <th className="px-6 py-4">Equipamento</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tickets.map(ticket => (
              <tr 
                key={ticket.id} 
                className="hover:bg-white/5 transition-colors cursor-pointer" 
                onClick={() => handleOpenTicket(ticket.id)}
              >
                <td className="px-6 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{ticket.title}</p>
                </td>
                <td className="px-6 py-4">{ticket.requester}</td>
                <td className="px-6 py-4">{getAssetName(ticket.asset_id)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-400 hover:text-white bg-blue-400/10 hover:bg-blue-500 px-3 py-1 rounded text-xs transition-colors">
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketListView;