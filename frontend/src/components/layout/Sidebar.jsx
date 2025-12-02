import React, { useState } from 'react';
import { 
  LayoutDashboard, Ticket, Plus, List, FileText, Settings, Server, 
  Users, Shield, LogOut, ChevronDown, ChevronRight, Lock, Key, 
  Home, X 
} from 'lucide-react';
import SidebarItem from './SidebarItem.jsx';
import { SubMenuItem } from './SidebarItem.jsx';

const Sidebar = ({ view, setView, user, onLogout, isOpen, onClose }) => {
  const [expandedMenu, setExpandedMenu] = useState({ 
    chamados: true, 
    admin: false 
  });

  const toggleMenu = (key) => setExpandedMenu(prev => ({ ...prev, [key]: !prev[key] }));

  // Helper para fechar o menu ao clicar em um item (apenas mobile)
  const handleNavigation = (newView) => {
    setView(newView);
    onClose();
  };

  // Helper para verificar permissões
  const hasPermission = (permission) => {
    if (user?.role === 'admin') return true;
    return user?.permissions?.includes(permission);
  };

  const isAdmin = user?.role === 'admin';
  const isTecnico = ['admin', 'tecnico', 'tecnico_n3'].includes(user?.role);

  // Regras de Visualização
  const showDashboard = isTecnico; 
  const showAssets = isAdmin || isTecnico || hasPermission('manage_assets');
  const showUsers = isAdmin || hasPermission('manage_users');
  const showGroups = isAdmin || hasPermission('manage_groups');
  const showRoles = isAdmin || hasPermission('manage_roles');
  const showAdminSection = showAssets || showUsers || showGroups || showRoles;

  return (
    <>
      {/* --- OVERLAY (Fundo escuro no mobile) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0B1A38] flex flex-col 
        shadow-xl border-r border-slate-800/50 print:hidden
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
      `}>
        
        {/* --- ÁREA DA LOGOMARCA --- */}
        <div className="h-28 flex items-center justify-center border-b border-white/15 gap-4 bg-gradient-to-b from-[#0e1525] to-[#0B1A38] px-4 relative">
          <img 
            src="/image/logo.svg" 
            alt="Logo Solve" 
            className="w-40 h-40 rounded-xl hover:scale-105 transition-transform duration-300" 
          />
          
          {/* Botão Fechar (Apenas Mobile) */}
          <button 
            onClick={onClose}
            className="md:hidden absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Info do Usuário */}
        <button 
          onClick={() => handleNavigation('profile')}
          className="w-full p-4 bg-[#081226] flex items-center gap-3 border-b border-white/5 hover:bg-[#101d36] transition-colors text-left group"
          title="Ir para Meu Perfil"
        >
          <div className="w-10 h-10 rounded-full bg-[#86efac] text-[#0B1A38] flex items-center justify-center font-bold shadow-lg text-sm group-hover:scale-105 transition-transform border-2 border-[#0B1A38] ring-2 ring-[#86efac]/20">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-white group-hover:text-[#86efac] transition-colors">
              {user?.name || 'Usuário'}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide bg-slate-800 px-1.5 py-0.5 rounded">
                {user?.role_label || user?.role || 'user'}
              </p>
              {isAdmin && <Lock className="w-3 h-3 text-yellow-400" />}
            </div>
          </div>
        </button>
        
        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
          
          <SidebarItem 
            icon={Home} 
            label="INÍCIO" 
            active={view === 'home'} 
            onClick={() => handleNavigation('home')} 
          />

          {showDashboard && (
            <SidebarItem 
              icon={LayoutDashboard} 
              label="DASHBOARD" 
              active={view === 'dashboard'} 
              onClick={() => handleNavigation('dashboard')} 
            />
          )}
          
          {/* Menu Chamados */}
          <div>
            <button 
              onClick={() => toggleMenu('chamados')} 
              className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5 ${
                view.includes('ticket') || view === 'reports' ? 'text-white' : 'text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5" />
                <span>CHAMADOS</span>
              </div>
              {expandedMenu.chamados ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            {expandedMenu.chamados && (
              <div className="bg-[#050b1a] py-2 shadow-inner">
                <SubMenuItem 
                  active={view === 'new-ticket'} 
                  onClick={() => handleNavigation('new-ticket')} 
                  icon={Plus} 
                  label="ABRIR CHAMADO" 
                />
                <SubMenuItem 
                  active={view === 'tickets'} 
                  onClick={() => handleNavigation('tickets')} 
                  icon={List} 
                  label="LISTA DE CHAMADOS" 
                />
                <SubMenuItem 
                  active={view === 'reports'} 
                  onClick={() => handleNavigation('reports')} 
                  icon={FileText} 
                  label="RELATÓRIO GERAL" 
                />
              </div>
            )}
          </div>

          {/* Menu Administração */}
          {showAdminSection && (
            <div>
              <button 
                onClick={() => toggleMenu('admin')} 
                className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5 ${
                  ['assets', 'users', 'groups', 'roles'].includes(view) ? 'text-white' : 'text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5" /> 
                  <span>ADMINISTRAÇÃO</span>
                </div>
                {expandedMenu.admin ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {expandedMenu.admin && (
                <div className="bg-[#050b1a] py-2 shadow-inner">
                  {showAssets && <SubMenuItem active={view === 'assets'} onClick={() => handleNavigation('assets')} icon={Server} label="EQUIPAMENTOS" />}
                  {showUsers && <SubMenuItem active={view === 'users'} onClick={() => handleNavigation('users')} icon={Users} label="USUÁRIOS" />}
                  {showGroups && <SubMenuItem active={view === 'groups'} onClick={() => handleNavigation('groups')} icon={Shield} label="GRUPOS DE ACESSO" />}
                  {showRoles && <SubMenuItem active={view === 'roles'} onClick={() => handleNavigation('roles')} icon={Key} label="PERMISSÕES & CARGOS" />}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Botão Sair */}
        <div className="p-4 bg-[#081226] border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-sm font-bold uppercase transition-colors shadow-lg group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;