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
  const [user, setUser] = useState({ name: 'Admin' });
  const [view, setView] = useState('dashboard');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [config, setConfig] = useState({ notifications: true, autoRefresh: true });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

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
      setTeamMembers(usersData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados do servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => setToast({ message: msg, type });

  // Handlers para tickets
  const handleCreateTicket = async (data) => {
    try {
      await api.createTicket({ ...data, requester: 'Admin' });
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

  const handleAddUpdate = async (id, text, authorName = 'Admin') => {
    try {
      await api.addTicketUpdate(id, text, authorName);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131824]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
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
      
      <Sidebar view={view} setView={setView} />
      
      <main className="flex-1 ml-0 md:ml-64 overflow-y-auto bg-[#131824] print:ml-0">
        {view !== 'ticket-details' && <Header view={view} />}
        
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
              currentUser="Admin" 
            />
          )}
          
          {view === 'assets' && (
            <Assets 
              assets={assets} 
              onSubmit={(data) => api.createAsset({ ...data, status: 'ativo' }).then(loadData)} 
              onDelete={(id) => api.deleteAsset(id).then(loadData)} 
            />
          )}
          
          {view === 'users' && (
            <Users 
              users={teamMembers} 
              groups={groups} 
              onSubmit={(data) => api.createUser(data).then(loadData)} 
              onDelete={(id) => api.deleteUser(id).then(loadData)} 
            />
          )}
          
          {view === 'groups' && (
            <Groups 
              groups={groups} 
              onSubmit={(data) => api.createGroup(data).then(loadData)} 
              onDelete={(id) => api.deleteGroup(id).then(loadData)} 
            />
          )}
          
          {view === 'reports' && <Reports tickets={tickets} />}
          
          {view === 'ticket-details' && activeTicket && (
            <TicketDetails 
              ticket={activeTicket} 
              onBack={handleBackToList}
              onUpdateStatus={handleUpdateStatus}
              onAddUpdate={handleAddUpdate}
              currentUser={{ name: 'Admin', id: 'admin' }} 
            />
          )}
        </div>
      </main>
    </div>
  );
}