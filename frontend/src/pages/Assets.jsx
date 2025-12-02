import React, { useState } from 'react';
import { Plus, Trash2, Server, Search, QrCode, FileText, Edit3, X, Save, History, Clock, Calendar, DollarSign, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const Assets = ({ assets, onSubmit, onDelete }) => {
  // Estados de Controle de UI
  const [isAdding, setIsAdding] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para o Histórico
  const [showHistory, setShowHistory] = useState(false);
  const [assetHistory, setAssetHistory] = useState([]);
  const [selectedAssetName, setSelectedAssetName] = useState('');

  // Estado do Formulário (com novos campos)
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    description: '',
    status: 'ativo',
    acquisition_date: '',
    warranty_end: '',
    cost: ''
  });

  const inputClass = "w-full bg-[#0e1525] border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600";

  // Função auxiliar para formatar data (YYYY-MM-DD) para o input HTML
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  // --- FUNÇÕES DE AÇÃO ---

  const handleEditClick = (asset) => {
    setFormData({
      name: asset.name,
      code: asset.code || '',
      description: asset.description || '',
      status: asset.status || 'ativo',
      // Formata as datas para o input type="date" aceitar
      acquisition_date: formatDateForInput(asset.acquisition_date),
      warranty_end: formatDateForInput(asset.warranty_end),
      cost: asset.cost || ''
    });
    setEditingAsset(asset);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingAsset(null);
    setFormData({ name: '', code: '', description: '', status: 'ativo', acquisition_date: '', warranty_end: '', cost: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.updateAsset(editingAsset.id, formData);
        window.location.reload();
      } else {
        await onSubmit(formData);
      }
      handleCancel();
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        await onDelete(id);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // --- CORREÇÃO APLICADA AQUI ---
  const handleHistoryClick = async (asset) => {
    try {
      const response = await api.getAssetHistory(asset.id);
      
      // Verifica se a resposta é um array direto ou se está dentro de .data
      const historyData = Array.isArray(response) ? response : (response.data || []);
      
      setAssetHistory(historyData);
      setSelectedAssetName(asset.name);
      setShowHistory(true);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar histórico: ' + error.message);
    }
  };

  // Filtragem
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl text-slate-200 font-bold flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-500" />
            Gestão de Equipamentos
          </h2>
          <p className="text-slate-500 text-sm mt-1">Inventário completo de TI e Histórico.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full bg-[#1a2236] border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> 
            Novo Item
          </button>
        </div>
      </div>

      {/* Formulário de Cadastro/Edição */}
      {isAdding && (
        <div className="bg-[#1a2236] border border-blue-500/30 p-6 rounded-xl shadow-2xl animate-fade-in relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg text-white font-bold flex items-center gap-2">
              {editingAsset ? <Edit3 className="w-5 h-5 text-blue-400"/> : <Server className="w-5 h-5 text-blue-400" />}
              {editingAsset ? 'Editar Equipamento' : 'Novo Equipamento'}
            </h3>
            <button onClick={handleCancel} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Linha 1: Nome e Código */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome *</label>
                <div className="relative">
                  <Server className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Notebook Dell Latitude"
                    className={`${inputClass} pl-10`}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patrimônio / Serial</label>
                <div className="relative">
                  <QrCode className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Ex: PAT-001"
                    className={`${inputClass} pl-10`}
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Linha 2: Financeiro e Garantia (NOVOS CAMPOS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0e1525] p-4 rounded-lg border border-slate-700/50">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data Aquisição</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input 
                    type="date" 
                    className={`${inputClass} pl-10`}
                    value={formData.acquisition_date}
                    onChange={e => setFormData({...formData, acquisition_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fim Garantia</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input 
                    type="date" 
                    className={`${inputClass} pl-10`}
                    value={formData.warranty_end}
                    onChange={e => setFormData({...formData, warranty_end: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0,00"
                    className={`${inputClass} pl-10`}
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Linha 3: Status e Descrição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select 
                  className={inputClass}
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ativo">Ativo</option>
                  <option value="manutencao">Em Manutenção</option>
                  <option value="inativo">Inativo / Descartado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observações</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <textarea 
                    placeholder="Processador, RAM, Localização..."
                    className={`${inputClass} pl-10 min-h-[80px] resize-none`}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={handleCancel} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Histórico */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a2236] w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0e1525] rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-400" /> Histórico
                </h3>
                <p className="text-slate-400 text-sm">{selectedAssetName}</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {assetHistory.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum registro encontrado.</p>
              ) : (
                <div className="relative border-l-2 border-slate-700 ml-3 space-y-8">
                  {assetHistory.map((log) => (
                    <div key={log.id} className="relative pl-8">
                      {/* Bolinha da timeline */}
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
                        log.action_type === 'CRIACAO' ? 'bg-emerald-500 border-emerald-900' : 
                        log.action_type === 'ATUALIZACAO' ? 'bg-blue-500 border-blue-900' :
                        'bg-slate-500 border-slate-900'
                      }`}></div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                            log.action_type === 'CRIACAO' ? 'bg-emerald-500/10 text-emerald-400' : 
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {log.action_type}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-slate-300 text-sm mt-1">{log.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                           <span>Por: <span className="text-slate-400">{log.user_name || 'Sistema'}</span></span>
                           {log.old_status && log.new_status && log.old_status !== log.new_status && (
                            <div className="flex items-center gap-1 ml-2 bg-[#0e1525] px-2 py-1 rounded">
                              <span className="text-red-400">{log.old_status}</span>
                              <span>→</span>
                              <span className="text-emerald-400">{log.new_status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="group bg-[#1a2236] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
            
            {/* Botões Hover */}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-gradient-to-l from-[#1a2236] via-[#1a2236] to-transparent pl-8 z-10">
              <button 
                onClick={() => handleHistoryClick(asset)}
                className="p-2 bg-slate-500/20 text-slate-400 rounded-lg hover:bg-slate-500 hover:text-white transition-colors"
                title="Ver Histórico"
              >
                <History className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleEditClick(asset)}
                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteClick(asset.id)}
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-lg bg-[#0e1525] flex items-center justify-center mb-4 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                <Server className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
              </div>
              
              <h3 className="text-white font-bold text-lg mb-1 truncate">{asset.name}</h3>
              <p className="text-sm text-slate-500 font-mono mb-4">{asset.code || 'S/N'}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-1 rounded-full font-bold ${
                    asset.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400' :
                    asset.status === 'manutencao' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {asset.status?.toUpperCase()}
                  </span>
                </div>

                {/* Mostra garantia se existir */}
                {asset.warranty_end && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3"/> Garantia:
                    </span>
                    <span className="text-slate-300">
                      {new Date(asset.warranty_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {asset.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5em] bg-[#0e1525] p-2 rounded border border-white/5">
                    {asset.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assets;