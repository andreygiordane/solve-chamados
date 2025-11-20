import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Shield, User, Mail, Lock, Save, X } from 'lucide-react';

const UsersView = ({ users, groups, onSubmit, onDelete, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    role: 'tecnico', 
    group_id: '' 
  });

  const inputClass = "w-full bg-[#0e1525] border border-slate-700 text-white text-xs rounded px-3 py-2 focus:outline-none focus:border-[#86efac] transition-all";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newUser.password !== newUser.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (newUser.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    try {
      await onSubmit(newUser);
      setIsAdding(false);
      setNewUser({ 
        name: '', 
        email: '', 
        password: '',
        confirmPassword: '',
        role: 'tecnico', 
        group_id: '' 
      });
    } catch (error) {
      alert('Erro ao criar usuário: ' + error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdate(editingUser.id, editingUser);
      setEditingUser(null);
    } catch (error) {
      alert('Erro ao atualizar usuário: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const getGroupName = (id) => {
    if (!id) return 'Sem Grupo';
    const group = groups.find(g => g.id === id);
    return group ? group.name : 'Sem Grupo';
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      tecnico: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      usuario: 'bg-green-500/20 text-green-400 border-green-500/30'
    };

    return (
      <span className={`px-2 py-1 rounded border text-xs font-medium ${styles[role] || styles.usuario}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl text-slate-200 font-light">Usuários do Sistema</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie os usuários e suas permissões</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 
          {isAdding ? 'Cancelar' : 'Novo Usuário'}
        </button>
      </div>

      {/* Formulário de Adição */}
      {isAdding && (
        <div className="bg-[#1a2236] border border-blue-500/30 p-6 rounded-lg mb-6 animate-fade-in">
          <h3 className="text-lg text-white font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Novo Usuário
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Nome Completo *</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Nome do usuário"
                  className={inputClass}
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-2">Email *</label>
                <input 
                  required 
                  type="email" 
                  placeholder="email@empresa.com"
                  className={inputClass}
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Senha *</label>
                <input 
                  required 
                  type="password" 
                  placeholder="Mínimo 6 caracteres"
                  className={inputClass}
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  minLength="6"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-2">Confirmar Senha *</label>
                <input 
                  required 
                  type="password" 
                  placeholder="Digite novamente a senha"
                  className={inputClass}
                  value={newUser.confirmPassword}
                  onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Cargo/Role</label>
                <select 
                  className={inputClass}
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="usuario">Usuário</option>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-2">Grupo (Opcional)</label>
                <select 
                  className={inputClass}
                  value={newUser.group_id}
                  onChange={e => setNewUser({...newUser, group_id: e.target.value})}
                >
                  <option value="">Selecione um Grupo...</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Criar Usuário
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-[#1a2236] p-4 rounded border border-white/5">
            {editingUser && editingUser.id === user.id ? (
              // Modo Edição
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    className={inputClass}
                    value={editingUser.name}
                    onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                  />
                  <input
                    type="email"
                    className={inputClass}
                    value={editingUser.email}
                    onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    className={inputClass}
                    value={editingUser.role}
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                  >
                    <option value="usuario">Usuário</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <select
                    className={inputClass}
                    value={editingUser.group_id}
                    onChange={e => setEditingUser({...editingUser, group_id: e.target.value})}
                  >
                    <option value="">Sem Grupo</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-slate-400 hover:text-white text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              // Modo Visualização
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{user.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-3 h-3 text-slate-500" />
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-800 rounded text-xs text-[#86efac]">
                    {getGroupName(user.group_id)}
                  </span>
                  
                  <button 
                    onClick={() => handleEdit(user)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Editar usuário"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => onDelete(user.id)}
                    className="text-slate-500 hover:text-red-500 transition-colors"
                    title="Excluir usuário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && !isAdding && (
        <div className="text-center py-8 text-slate-500">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum usuário cadastrado</p>
          <button 
            onClick={() => setIsAdding(true)}
            className="text-blue-400 hover:text-blue-300 mt-2"
          >
            Clique aqui para criar o primeiro usuário
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersView;