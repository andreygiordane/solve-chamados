import React, { useState } from 'react';
import { Plus, Monitor, Trash2 } from 'lucide-react';

const AssetsView = ({ assets, onSubmit, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAsset, setNewAsset] = useState({ 
    name: '', 
    type: 'Laptop', 
    serial_number: '', 
    location: '' 
  });

  const inputClass = "w-full bg-[#0e1525] border border-slate-700 text-white text-xs rounded px-3 py-2 focus:outline-none focus:border-[#86efac]";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newAsset);
    setIsAdding(false);
    setNewAsset({ name: '', type: 'Laptop', serial_number: '', location: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <h2 className="text-xl text-slate-200 font-light">Equipamentos</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 
          {isAdding ? 'Fechar' : 'Novo Equipamento'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#1a2236] border border-blue-500/30 p-6 rounded-lg mb-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <input 
              required 
              type="text" 
              placeholder="Nome" 
              className={inputClass} 
              value={newAsset.name} 
              onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
            />
            <input 
              required 
              type="text" 
              placeholder="Serial" 
              className={inputClass} 
              value={newAsset.serial_number} 
              onChange={e => setNewAsset({...newAsset, serial_number: e.target.value})} 
            />
            <input 
              type="text" 
              placeholder="Local" 
              className={inputClass} 
              value={newAsset.location} 
              onChange={e => setNewAsset({...newAsset, location: e.target.value})} 
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold uppercase w-full hover:bg-blue-500"
            >
              Salvar
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assets.map(asset => (
          <div 
            key={asset.id} 
            className="bg-[#1a2236] p-4 rounded border border-white/5 hover:border-blue-500/50 transition-colors group relative"
          >
            <button 
              onClick={() => onDelete(asset.id)} 
              className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4"/>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#0e1525] rounded text-blue-400">
                <Monitor className="w-6 h-6"/>
              </div>
              <div>
                <h4 className="text-white font-medium">{asset.name}</h4>
                <p className="text-xs text-slate-500">{asset.serial_number}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsView;