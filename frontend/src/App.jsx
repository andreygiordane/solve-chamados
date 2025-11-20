import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Toast from './components/ui/Toast';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import NewTicket from './pages/NewTicket';
import TicketDetails from './pages/TicketDetails';
import Assets from './pages/Assets';
import Users from './pages/Users';
import Groups from './pages/Groups';
import Reports from './pages/Reports';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [config, setConfig] = useState({ notifications: true, autoRefresh: true });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const validation = await api.validateSession();
        if (validation.success) {
          setUser(validation.user);
          await loadData();
        } else {
          // Sessão inválida, limpar storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.log('Usuário não autenticado ou erro na validação:', error);
    } finally {
      setAuthChecked(true);
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, assetsData, usersData, groupsData] = await Promise.all([
        api.getTickets(),
        api.getAssets(),
        api.getUsers(),
        api.getGroups()
      ]);
      
      setTickets(ticketsData);
      setAssets(assetsData);
      setTeamMembers(usersData.users || usersData); // Suporte a diferentes formatos de resposta
      setGroups(groupsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados do servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => setToast({ message: msg, type });

  const handleLogin = (userData) => {
    setUser(userData);
    loadData();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setTickets([]);
      setAssets([]);
      setTeamMembers([]);
      setGroups([]);
      showToast('Logout realizado com sucesso', 'success');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Limpar mesmo com erro
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  // Handlers para tickets
  const handleCreateTicket = async (data) => {
    try {
      await api.createTicket({ ...data, requester: user.name });
      await loadData();
      setView('dashboard');
      showToast('Chamado criado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao criar chamado', 'error');
    }
  };

  const handleUpdateStatus = async (id, status, additionalData = {}) => {
    try {
      await api.updateTicketStatus(id, status, additionalData);
      await loadData();
      showToast('Status atualizado!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const handleAddUpdate = async (id, text, authorName = null) => {
    try {
      await api.addTicketUpdate(id, text, authorName || user.name);
      await loadData();
      showToast('Atualização adicionada!', 'success');
    } catch (error) {
      showToast('Erro ao adicionar atualização', 'error');
    }
  };

  const handleOpenTicket = (id) => {
    setActiveTicketId(id);
    setView('ticket-details');
  };

  const handleBackToList = () => {
    setActiveTicketId(null);
    setView('tickets');
  };

  // Handlers para usuários
  const handleCreateUser = async (userData) => {
    try {
      await api.createUser(userData);
      await loadData();
      showToast('Usuário criado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao criar usuário: ' + (error.message || 'Verifique os dados'), 'error');
      throw error; // Re-throw para o componente Users poder mostrar o erro específico
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      await api.updateUser(id, userData);
      await loadData();
      showToast('Usuário atualizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar usuário', 'error');
      throw error;
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      await loadData();
      showToast('Usuário excluído com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao excluir usuário', 'error');
      throw error;
    }
  };

  // Handlers para assets
  const handleCreateAsset = async (assetData) => {
    try {
      await api.createAsset({ ...assetData, status: 'ativo' });
      await loadData();
      showToast('Equipamento criado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao criar equipamento', 'error');
      throw error;
    }
  };

  const handleDeleteAsset = async (id) => {
    try {
      await api.deleteAsset(id);
      await loadData();
      showToast('Equipamento excluído com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao excluir equipamento', 'error');
      throw error;
    }
  };

  // Handlers para groups
  const handleCreateGroup = async (groupData) => {
    try {
      await api.createGroup(groupData);
      await loadData();
      showToast('Grupo criado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao criar grupo', 'error');
      throw error;
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await api.deleteGroup(id);
      await loadData();
      showToast('Grupo excluído com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao excluir grupo', 'error');
      throw error;
    }
  };

  // Auto-refresh
  useEffect(() => {
    let interval;
    if (config.autoRefresh && user) {
      interval = setInterval(() => {
        loadData();
        showToast('Dados atualizados automaticamente', 'refresh');
      }, 30000); // 30 segundos
    }
    return () => clearInterval(interval);
  }, [config.autoRefresh, user]);

  // Mostrar loading enquanto verifica autenticação
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131824]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  return (
    <div className="min-h-screen bg-[#131824] flex font-sans text-slate-100 overflow-hidden relative">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <Sidebar view={view} setView={setView} user={user} onLogout={handleLogout} />
      
      <main className="flex-1 ml-0 md:ml-64 overflow-y-auto bg-[#131824] print:ml-0">
        {view !== 'ticket-details' && <Header view={view} user={user} />}
        
        <div className="p-8 print:p-0">
          {view === 'dashboard' && (
            <Dashboard 
              tickets={tickets} 
              setView={setView} 
              config={config} 
              setConfig={setConfig} 
              showToast={showToast} 
              handleOpenTicket={handleOpenTicket} 
            />
          )}
          
          {view === 'tickets' && (
            <TicketList 
              tickets={tickets} 
              assets={assets} 
              handleOpenTicket={handleOpenTicket} 
              setView={setView} 
            />
          )}
          
          {view === 'new-ticket' && (
            <NewTicket 
              assets={assets} 
              onSubmit={handleCreateTicket} 
              onCancel={() => setView('tickets')} 
              currentUser={user.name} 
            />
          )}
          
          {view === 'assets' && (
            <Assets 
              assets={assets} 
              onSubmit={handleCreateAsset}
              onDelete={handleDeleteAsset}
            />
          )}
          
          {view === 'users' && (
            <Users 
              users={teamMembers} 
              groups={groups} 
              onSubmit={handleCreateUser}
              onUpdate={handleUpdateUser}
              onDelete={handleDeleteUser}
            />
          )}
          
          {view === 'groups' && (
            <Groups 
              groups={groups} 
              onSubmit={handleCreateGroup}
              onDelete={handleDeleteGroup}
            />
          )}
          
          {view === 'reports' && <Reports tickets={tickets} />}
          
          {view === 'ticket-details' && activeTicket && (
            <TicketDetails 
              ticket={activeTicket} 
              onBack={handleBackToList}
              onUpdateStatus={handleUpdateStatus}
              onAddUpdate={handleAddUpdate}
              currentUser={user} 
            />
          )}

          {/* Página de Perfil (placeholder) */}
          {view === 'profile' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#1a2236] rounded-xl p-8 border border-white/5">
                <h2 className="text-2xl font-light text-white mb-2">Meu Perfil</h2>
                <p className="text-slate-500 mb-6">Gerencie suas informações pessoais</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0e1525] p-6 rounded-lg border border-white/5">
                    <h3 className="text-lg text-white font-semibold mb-4">Informações Pessoais</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-400 block mb-1">Nome</label>
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-1">Email</label>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-1">Cargo</label>
                        <p className="text-white font-medium capitalize">{user.role}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-1">Grupo</label>
                        <p className="text-white font-medium">{user.group_name || 'Não atribuído'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#0e1525] p-6 rounded-lg border border-white/5">
                    <h3 className="text-lg text-white font-semibold mb-4">Estatísticas</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-400 block mb-1">Chamados Ativos</label>
                        <p className="text-white font-medium">
                          {tickets.filter(t => t.status !== 'concluido' && t.status !== 'cancelado').length}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-1">Último Login</label>
                        <p className="text-white font-medium">
                          {user.last_login ? new Date(user.last_login).toLocaleString() : 'Primeiro acesso'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <button 
                        onClick={() => setView('dashboard')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium transition-colors"
                      >
                        Voltar ao Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}