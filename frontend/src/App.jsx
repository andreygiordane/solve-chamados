import React, { useState, useEffect, useRef } from 'react';
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
import RolesView from './pages/RolesView';
import Home from './pages/Home';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para mobile
  
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [config, setConfig] = useState({ notifications: true, autoRefresh: true });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const previousTicketCount = useRef(0);
  const isFirstLoad = useRef(true);
  const audioRef = useRef(new Audio('/music/notification.mp3'));

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
          await loadData(validation.user);
        } else {
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

  const loadData = async (currentUser = null) => {
    try {
      const activeUser = currentUser || user;
      const [ticketsData, assetsData] = await Promise.all([
        api.getTickets(),
        api.getAssets()
      ]);
      
      if (!isFirstLoad.current && ticketsData.length > previousTicketCount.current) {
        if (config.notifications) {
          try {
            audioRef.current.currentTime = 0; 
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => console.warn("Autoplay bloqueado:", error));
            }
            showToast('Novo chamado recebido!', 'info');
          } catch (e) {
            console.error("Erro som:", e);
          }
        }
      }

      previousTicketCount.current = ticketsData.length;
      if (isFirstLoad.current) isFirstLoad.current = false;
      
      setTickets(ticketsData);
      setAssets(assetsData);

      if (activeUser && activeUser.role === 'admin') {
        try {
          const [usersData, groupsData] = await Promise.all([
            api.getUsers(),
            api.getGroups()
          ]);
          setTeamMembers(usersData.users || usersData);
          setGroups(groupsData);
        } catch (adminError) {
          setTeamMembers([]);
          setGroups([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => setToast({ message: msg, type });

  const handleLogin = (userData) => {
    setUser(userData);
    setView('home');
    loadData(userData);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch(e) {}
    setUser(null);
    setTickets([]);
    setAssets([]);
    isFirstLoad.current = true;
    previousTicketCount.current = 0;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsSidebarOpen(false);
  };

  const handleCreateTicket = async (data) => {
    try {
      await api.createTicket({ ...data, requester: user.name });
      await loadData();
      setView(user.role === 'admin' || user.role === 'tecnico' ? 'dashboard' : 'tickets');
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
    } catch (error) { showToast('Erro ao atualizar status', 'error'); }
  };

  const handleAddUpdate = async (id, text, authorName = null) => {
    try {
      await api.addTicketUpdate(id, text, authorName || user.name);
      await loadData(); 
      showToast('Atualização adicionada!', 'success');
    } catch (error) { showToast('Erro ao atualizar', 'error'); }
  };

  const handleOpenTicket = (id) => { setActiveTicketId(id); setView('ticket-details'); };
  const handleBackToList = () => { setActiveTicketId(null); setView('tickets'); };

  const handleCreateUser = async (data) => {
    try { await api.createUser(data); await loadData(); showToast('Sucesso!', 'success'); } 
    catch (e) { showToast('Erro: ' + e.message, 'error'); }
  };
  const handleUpdateUser = async (id, data) => {
    try { await api.updateUser(id, data); await loadData(); showToast('Sucesso!', 'success'); } 
    catch (e) { showToast('Erro: ' + e.message, 'error'); }
  };
  const handleDeleteUser = async (id) => {
    try { await api.deleteUser(id); await loadData(); showToast('Sucesso!', 'success'); } 
    catch (e) { showToast(e.message, 'error'); }
  };

  const handleCreateAsset = async (data) => {
    try { await api.createAsset({...data, status:'ativo'}); await loadData(); showToast('Sucesso!', 'success'); } 
    catch (e) { showToast('Erro', 'error'); }
  };
  const handleDeleteAsset = async (id) => {
    try { await api.deleteAsset(id); await loadData(); showToast('Sucesso!', 'success'); } 
    catch (e) { showToast(e.message, 'error'); }
  };

  const handleCreateGroup = async (data) => {
    try { await api.createGroup(data); await loadData(); showToast('Sucesso!', 'success'); } 
    catch (e) { showToast(e.message, 'error'); }
  };
  const handleDeleteGroup = async (id) => {
    try { await api.deleteGroup(id); await loadData(); showToast('Sucesso!', 'success'); } 
    catch (e) { showToast(e.message, 'error'); }
  };

  useEffect(() => {
    let interval;
    const allowRefreshOn = ['dashboard', 'tickets', 'reports'];
    if (config.autoRefresh && user && allowRefreshOn.includes(view)) {
      interval = setInterval(() => loadData(user), 30000); 
    }
    return () => clearInterval(interval);
  }, [config.autoRefresh, user, view]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131824]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;
  const activeTicket = tickets.find(t => t.id === activeTicketId);

  return (
    // h-screen e overflow-hidden aqui impedem que a página inteira role
    <div className="h-screen bg-[#131824] flex font-sans text-slate-100 overflow-hidden relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <Sidebar 
        view={view} 
        setView={setView} 
        user={user} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* md:ml-64 -> Empurra o conteúdo para a direita no desktop 
         overflow-y-auto -> Cria a barra de rolagem APENAS no conteúdo, não na sidebar
      */}
      <main className="flex-1 md:ml-64 flex flex-col min-w-0 h-full overflow-y-auto bg-[#131824] print:ml-0">
        
        {view !== 'ticket-details' && (
          <Header 
            view={view} 
            user={user} 
            onMenuClick={() => setIsSidebarOpen(true)} 
          />
        )}
        
        <div className="p-8 print:p-0 pb-24">
          
          {view === 'home' && (
            <Home currentUser={user} setView={setView} />
          )}

          {view === 'dashboard' && <Dashboard tickets={tickets} setView={setView} config={config} setConfig={setConfig} showToast={showToast} handleOpenTicket={handleOpenTicket} currentUser={user} />}
          {view === 'tickets' && <TicketList tickets={tickets} assets={assets} handleOpenTicket={handleOpenTicket} setView={setView} currentUser={user} />}
          {view === 'new-ticket' && <NewTicket assets={assets} onSubmit={handleCreateTicket} onCancel={() => setView('tickets')} currentUser={user.name} />}
          {view === 'assets' && <Assets assets={assets} onSubmit={handleCreateAsset} onDelete={handleDeleteAsset} />}
          {view === 'users' && <Users users={teamMembers} groups={groups} onSubmit={handleCreateUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />}
          {view === 'groups' && <Groups groups={groups} onSubmit={handleCreateGroup} onDelete={handleDeleteGroup} />}
          {view === 'roles' && <RolesView />}
          {view === 'reports' && <Reports tickets={tickets} currentUser={user} handleOpenTicket={handleOpenTicket} />}
          {view === 'ticket-details' && activeTicket && <TicketDetails ticket={activeTicket} onBack={handleBackToList} onUpdateStatus={handleUpdateStatus} onAddUpdate={handleAddUpdate} currentUser={user} />}
          
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
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-white/10">
                     <button 
                       onClick={() => setView('home')}
                       className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium transition-colors"
                     >
                       Voltar ao Início
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