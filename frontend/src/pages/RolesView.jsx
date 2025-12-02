import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Shield, Check, X, Save, Key } from 'lucide-react';
import { api } from '../services/api'; // Supondo que api.js esteja aqui

const RolesView = () => {
  const [roles, setRoles] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Lista de todas as ações possíveis no sistema
  const availablePermissions = [
    { id: 'view_dashboard', label: 'Visualizar Dashboard' },
    { id: 'manage_tickets', label: 'Gerenciar Chamados (Editar/Status)' },
    { id: 'create_ticket', label: 'Abrir Novos Chamados' },
    { id: 'assign_tickets', label: 'Atribuir Chamados a si/outros' },
    { id: 'delete_tickets', label: 'Deletar Chamados' },
    { id: 'manage_assets', label: 'Gerenciar Equipamentos' },
    { id: 'manage_users', label: 'Gerenciar Usuários' },
    { id: 'manage_groups', label: 'Gerenciar Grupos' },
    { id: 'manage_roles', label: 'Gerenciar Permissões/Cargos (Admin)' },
  ];

  const [newRole, setNewRole] = useState({ 
    name: '', 
    label: '', 
    permissions: [] 
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      // Ajuste para chamar sua API real
      const data = await api.getRoles(); 
      setRoles(data);
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
    }
  };

  const handlePermissionToggle = (permId, isEditing = false) => {
    if (isEditing && editingRole) {
      const currentPerms = editingRole.permissions || [];
      const updatedPerms = currentPerms.includes(permId)
        ? currentPerms.filter(p => p !== permId)
        : [...currentPerms, permId];
      setEditingRole({ ...editingRole, permissions: updatedPerms });
    } else {
      const currentPerms = newRole.permissions;
      const updatedPerms = currentPerms.includes(permId)
        ? currentPerms.filter(p => p !== permId)
        : [...currentPerms, permId];
      setNewRole({ ...newRole, permissions: updatedPerms });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createRole(newRole);
      setIsAdding(false);
      setNewRole({ name: '', label: '', permissions: [] });
      fetchRoles();
    } catch (error) {
      alert('Erro ao criar cargo: ' + error.message);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.updateRole(editingRole.id, editingRole);
      setEditingRole(null);
      fetchRoles();
    } catch (error) {
      alert('Erro ao atualizar cargo: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza? Usuários com este cargo perderão acesso.')) {
      try {
        await api.deleteRole(id);
        fetchRoles();
      } catch (error) {
        alert('Erro ao deletar: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl text-slate-200 font-light">Gestão de Cargos e Permissões</h2>
          <p className="text-slate-500 text-sm mt-1">Configure o que cada nível de usuário pode fazer.</p>
        </div>
        {!isAdding && !editingRole && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> 
            Novo Cargo
          </button>
        )}
      </div>

      {/* Formulário de Criação / Edição */}
      {(isAdding || editingRole) && (
        <div className="bg-[#1a2236] border border-yellow-500/30 p-6 rounded-xl animate-fade-in shadow-xl">
          <h3 className="text-lg text-white font-semibold mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-500" />
            {editingRole ? 'Editar Permissões' : 'Configurar Novo Cargo'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-bold">Identificador (Sistema)</label>
              <input 
                type="text" 
                placeholder="ex: tecnico_n3"
                className="w-full bg-[#0e1525] border border-slate-700 text-white rounded p-3 focus:border-yellow-500 outline-none"
                value={editingRole ? editingRole.name : newRole.name}
                onChange={e => editingRole 
                  ? setEditingRole({...editingRole, name: e.target.value}) 
                  : setNewRole({...newRole, name: e.target.value})}
                disabled={!!editingRole} // Não muda nome ao editar para não quebrar referências
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-bold">Nome de Exibição</label>
              <input 
                type="text" 
                placeholder="ex: Técnico Nível 3"
                className="w-full bg-[#0e1525] border border-slate-700 text-white rounded p-3 focus:border-yellow-500 outline-none"
                value={editingRole ? editingRole.label : newRole.label}
                onChange={e => editingRole 
                  ? setEditingRole({...editingRole, label: e.target.value}) 
                  : setNewRole({...newRole, label: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-[#0e1525] p-6 rounded-lg border border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Permissões de Acesso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePermissions.map(perm => {
                const isChecked = editingRole 
                  ? editingRole.permissions?.includes(perm.id)
                  : newRole.permissions.includes(perm.id);

                return (
                  <label key={perm.id} className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${
                    isChecked 
                      ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-100' 
                      : 'bg-[#1a2236] border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                      isChecked ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-slate-600'
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={isChecked}
                      onChange={() => handlePermissionToggle(perm.id, !!editingRole)}
                    />
                    <span className="text-sm font-medium">{perm.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              onClick={() => { setIsAdding(false); setEditingRole(null); }}
              className="px-6 py-2 text-slate-400 hover:text-white font-bold"
            >
              Cancelar
            </button>
            <button 
              onClick={editingRole ? handleUpdate : handleSubmit}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              {editingRole ? 'Salvar Alterações' : 'Criar Cargo'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-[#1a2236] p-6 rounded-xl border border-white/5 hover:border-white/10 transition-all shadow-lg flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg text-white font-bold">{role.label}</h4>
                <code className="text-xs text-slate-500 bg-[#0e1525] px-2 py-1 rounded mt-1 inline-block">
                  {role.name}
                </code>
              </div>
              <Shield className={`w-6 h-6 ${role.name === 'admin' ? 'text-red-500' : 'text-blue-500'}`} />
            </div>

            <div className="flex-1 mb-6">
              <p className="text-xs text-slate-400 font-bold uppercase mb-2">Acesso:</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.slice(0, 5).map(p => (
                    <span key={p} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {availablePermissions.find(ap => ap.id === p)?.label.split(' ')[0] || p}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-600 italic">Nenhuma permissão especial</span>
                )}
                {role.permissions?.length > 5 && (
                  <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-500 rounded border border-slate-700">
                    +{role.permissions.length - 5}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                onClick={() => setEditingRole(role)}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" /> Editar
              </button>
              
              {role.name !== 'admin' && (
                <button 
                  onClick={() => handleDelete(role.id)}
                  className="text-slate-500 hover:text-red-500 flex items-center gap-1 text-sm font-medium ml-2"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesView;