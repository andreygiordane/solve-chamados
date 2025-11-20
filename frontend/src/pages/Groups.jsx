import React, { useState } from 'react';
import { Plus, Shield, Trash2 } from 'lucide-react';

const GroupsView = ({ groups, onSubmit, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGroup, setNewGroup] = useState({ 
    name: '', 
    description: '' 
  });

  const inputClass = "w-full bg-[#0e1525] border border-slate-700 text-white text-xs rounded px-3 py-2 focus:outline-none focus:border-[#86efac] transition-all";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newGroup);
    setIsAdding(false);
    setNewGroup({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <h2 className="text-xl text-slate-200 font-light">Grupos de Permissão</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 
          {isAdding ? 'Cancelar' : 'Novo Grupo'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#1a2236] border border-blue-500/30 p-6 rounded-lg mb-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              required 
              type="text" 
              placeholder="Nome do Grupo" 
              className={inputClass} 
              value={newGroup.name} 
              onChange={e => setNewGroup({...newGroup, name: e.target.value})} 
            />
            <input 
              type="text" 
              placeholder="Descrição" 
              className={inputClass} 
              value={newGroup.description} 
              onChange={e => setNewGroup({...newGroup, description: e.target.value})} 
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded text-xs font-bold uppercase hover:bg-blue-500"
              >
                Salvar Grupo
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <div 
            key={group.id} 
            className="bg-[#1a2236] p-6 rounded border border-white/5 relative group"
          >
            <button 
              onClick={() => onDelete(group.id)} 
              className="absolute top-3 right-3 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4"/>
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-[#86efac]" />
              <h3 className="text-white font-bold">{group.name}</h3>
            </div>
            
            <p className="text-slate-500 text-xs">
              {group.description || "Sem descrição definida."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupsView;