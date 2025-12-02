import React, { useState } from 'react';
import { Save, User, Upload, X, Clock, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';

const NewTicketForm = ({ assets, onSubmit, onCancel, currentUser }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    priority: 'media', 
    asset_id: '', 
    location: '',
    attachment: null
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  const inputClass = "w-full bg-[#0e1525] border border-slate-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#86efac] transition-all";

  const getSLAInfo = (priority) => {
    switch(priority) {
      case 'baixa': return { label: '72 Horas (Baixa)', color: 'text-blue-400' };
      case 'media': return { label: '48 Horas (Média)', color: 'text-yellow-400' };
      case 'alta': return { label: '24 Horas (Alta)', color: 'text-orange-400' };
      case 'critica': return { label: '4 Horas (Crítica)', color: 'text-red-500' };
      default: return { label: '48 Horas', color: 'text-slate-400' };
    }
  };

  const slaInfo = getSLAInfo(formData.priority);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("A imagem é muito grande! Limite de 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, attachment: reader.result });
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, attachment: null });
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="bg-[#1a2236] border border-white/5 p-8 shadow-2xl">
        <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Novo Chamado</h2>
            <p className="text-slate-500 text-sm mt-1">Preencha os detalhes e anexe evidências.</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider mb-1">Solicitante</span>
            <span className="text-blue-300 font-bold bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/30 text-xs flex items-center gap-2 justify-end">
              <User className="w-3 h-3" />
              {currentUser}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Assunto</label>
            <input 
              required 
              type="text" 
              className={inputClass} 
              placeholder="Ex: Erro no sistema, Impressora parada..." 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Prioridade</label>
                <select 
                  className={inputClass} 
                  value={formData.priority} 
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
                <div className="mt-3 bg-[#0e1525] border border-slate-700/50 rounded p-3 flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${formData.priority === 'critica' ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Prazo SLA</span>
                    <span className={`text-sm font-bold ${slaInfo.color}`}>{slaInfo.label}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Local</label>
                <input 
                  type="text" 
                  className={inputClass} 
                  placeholder="Ex: Financeiro, Sala 10..." 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Equipamento</label>
                <select 
                  className={inputClass}
                  value={formData.asset_id} 
                  onChange={e => setFormData({...formData, asset_id: e.target.value})}
                >
                  <option value="">Nenhum / Não se aplica</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Limite de 500 caracteres */}
              <div>
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className="block text-slate-400 text-xs font-bold uppercase">Descrição Detalhada</label>
                  <span className={`text-xs font-mono font-bold ${formData.description.length >= 500 ? 'text-red-500' : 'text-slate-500'}`}>
                    {formData.description.length}/500
                  </span>
                </div>
                <textarea 
                  required
                  maxLength={500}
                  rows="5" 
                  className={inputClass} 
                  placeholder="Detalhe o problema (máximo 500 caracteres)..." 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
             <h3 className="text-slate-300 font-bold flex items-center gap-2 mb-4">
              <Upload className="w-4 h-4 text-blue-500" /> Evidências (Print)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                 <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer bg-[#0e1525]/50 hover:bg-[#0e1525] hover:border-blue-500 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <p className="mb-2 text-sm text-slate-400">Clique ou arraste</p>
                  </div>
                </label>
              </div>
              <div className="relative h-32 bg-[#0e1525] rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="h-full object-contain" />
                    <button 
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-600">Sem imagem</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-8 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg text-slate-400 hover:text-white font-medium">Cancelar</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg flex items-center gap-2">
              <Save className="w-4 h-4" /> Salvar Chamado
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewTicketForm;