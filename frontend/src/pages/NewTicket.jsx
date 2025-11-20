import React, { useState } from 'react';
import { Save, User } from 'lucide-react';
import Card from '../components/ui/Card';

const NewTicketForm = ({ assets, onSubmit, onCancel, currentUser }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    priority: 'media', 
    asset_id: '', 
    location: '' 
  });

  const inputClass = "w-full bg-[#0e1525] border border-slate-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#86efac] transition-all";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-[#1a2236] border border-white/5 p-8">
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-light text-white">Novo Chamado</h2>
            <p className="text-slate-500 text-sm mt-1">Preencha as informações abaixo.</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Solicitante</span>
            <span className="text-white font-bold bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30 text-sm flex items-center gap-2 justify-end">
              <User className="w-3 h-3" />
              {currentUser}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <input 
                required 
                type="text" 
                className={inputClass} 
                placeholder="Assunto / Categoria" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <select 
              className={inputClass} 
              value={formData.priority} 
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option value="media">Prioridade Média</option>
              <option value="alta">Prioridade Alta</option>
              <option value="critica">Prioridade Crítica</option>
            </select>
            
            <select 
              className={inputClass} 
              value={formData.asset_id} 
              onChange={e => setFormData({...formData, asset_id: e.target.value})}
            >
              <option value="">Equipamento (Opcional)</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
            
            <input 
              type="text" 
              className={inputClass} 
              placeholder="Local / Setor" 
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})} 
            />
          </div>
          
          <textarea 
            rows="5" 
            className={inputClass} 
            placeholder="Detalhamento do problema..." 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
          ></textarea>
          
          <div className="pt-6 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onCancel} 
              className="text-slate-400 px-4 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Chamado
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewTicketForm;