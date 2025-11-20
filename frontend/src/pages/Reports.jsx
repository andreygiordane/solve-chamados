import React, { useState } from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';
import SolveLogo from '../components/ui/SolveLogo';

const ReportsView = ({ tickets }) => {
  const [filterStatus, setFilterStatus] = useState('todos');
  
  const filteredTickets = tickets.filter(ticket => 
    filterStatus === 'todos' ? true : ticket.status === filterStatus
  );

  const exportCSV = () => {
    const headers = ["ID,Assunto,Solicitante,Status,Data"];
    const rows = filteredTickets.map(ticket => {
      const date = ticket.created_seconds 
        ? new Date(ticket.created_seconds * 1000).toLocaleDateString() 
        : '-';
      return `${ticket.id},"${ticket.title}","${ticket.requester}",${ticket.status},${date}`;
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-white/10 print:hidden">
        <select 
          className="bg-[#0e1525] text-white text-sm border border-slate-700 rounded px-3 py-2 focus:outline-none"
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="todos">Todos os Status</option>
          <option value="aberto">Abertos</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluido">Concluídos</option>
        </select>
        
        <div className="flex gap-2">
          <button 
            onClick={exportCSV} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white text-black p-8 rounded shadow-sm print:shadow-none print:p-0">
        <div className="mb-6 border-b border-gray-200 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Relatório</h1>
            <p className="text-sm text-gray-500">Gerado em: {new Date().toLocaleString()}</p>
          </div>
          <div className="text-[#86efac] font-black italic text-xl tracking-tighter border p-2 rounded border-gray-200">
            <SolveLogo showText={true} textSize="text-xl" />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2">ID</th>
              <th className="py-2">Assunto</th>
              <th className="py-2">Solicitante</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id} className="border-b border-gray-200">
                <td className="py-2 text-gray-600 font-mono text-xs">{ticket.id}</td>
                <td className="py-2 font-medium">{ticket.title}</td>
                <td className="py-2">{ticket.requester}</td>
                <td className="py-2 uppercase text-xs font-bold">
                  {ticket.status.replace('_', ' ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsView;