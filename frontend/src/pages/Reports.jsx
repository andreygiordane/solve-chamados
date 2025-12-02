import React, { useState } from 'react';
import { FileSpreadsheet, Download, Eye } from 'lucide-react';
import SolveLogo from '../components/ui/SolveLogo';

const ReportsView = ({ tickets, currentUser, handleOpenTicket }) => {
  const [filterStatus, setFilterStatus] = useState('todos');
  
  // 1. Filtro de Permissão
  const accessibleTickets = tickets.filter(t => {
    const isStaff = ['admin', 'tecnico', 'tecnico_n3'].includes(currentUser?.role);
    if (isStaff) return true;
    return t.requester === currentUser?.name;
  });

  // 2. Filtro de Status
  const filteredTickets = accessibleTickets.filter(ticket => 
    filterStatus === 'todos' ? true : ticket.status === filterStatus
  );

  const formatDateTime = (seconds) => {
    if (!seconds) return '-';
    return new Date(seconds * 1000).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportCSV = () => {
    const headers = ["ID,Assunto,Solicitante,Status,Data/Hora"];
    const rows = filteredTickets.map(ticket => {
      const date = formatDateTime(ticket.created_seconds);
      return `${ticket.id},"${ticket.title}","${ticket.requester}",${ticket.status},"${date}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "relatorio_solve.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Barra de Ferramentas */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-white/10 print:hidden">
        <select 
          className="bg-[#0e1525] text-white text-sm border border-slate-700 rounded px-3 py-2 focus:outline-none min-w-[200px]"
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="todos">Todos os Status</option>
          <option value="aberto">Abertos</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluido">Concluídos</option>
          <option value="cancelado">Cancelados</option>
        </select>
        
        <div className="flex gap-2">
          <button 
            onClick={exportCSV} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Imprimir PDF
          </button>
        </div>
      </div>

      {/* Tabela de Relatório */}
      <div className="bg-white text-black p-8 rounded shadow-sm print:shadow-none print:p-0 overflow-x-auto">
        <div className="mb-6 border-b border-gray-200 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Relatório Geral</h1>
            <p className="text-sm text-gray-500">Gerado em: {new Date().toLocaleString()}</p>
            {!['admin', 'tecnico', 'tecnico_n3'].includes(currentUser?.role) && (
              <p className="text-xs text-gray-400 mt-1">Filtrado para: {currentUser?.name}</p>
            )}
          </div>
          <div className="text-[#86efac] font-black italic text-xl tracking-tighter border p-2 rounded border-gray-200 print:border-0">
            <SolveLogo showText={true} textSize="text-xl" />
          </div>
        </div>
        
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Data de Abertura</th>
              <th className="py-2 pr-4">Assunto</th>
              <th className="py-2 pr-4">Solicitante</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 text-center print:hidden">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 italic">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-gray-600 font-mono text-xs font-bold">#{ticket.id}</td>
                  <td className="py-3 pr-4 text-gray-700">
                    {formatDateTime(ticket.created_seconds)}
                  </td>
                  <td className="py-3 pr-4 font-medium max-w-[200px] truncate" title={ticket.title}>
                    {ticket.title}
                  </td>
                  <td className="py-3 pr-4">{ticket.requester}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      ticket.status === 'aberto' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'pendente' ? 'bg-orange-100 text-orange-700' :
                      ticket.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-center print:hidden">
                    <button 
                      onClick={() => handleOpenTicket(ticket.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Ver Detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsView;