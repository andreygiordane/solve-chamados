import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Plus, 
  List, 
  FileText, 
  Settings, 
  Server, 
  Users, 
  Shield, 
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Lock
} from 'lucide-react';
import SolveLogo from '../ui/SolveLogo.jsx';
import SidebarItem from './SidebarItem.jsx';
import { SubMenuItem } from './SidebarItem.jsx';

const Sidebar = ({ view, setView, user, onLogout }) => {
  const [expandedMenu, setExpandedMenu] = useState({ 
    chamados: true, 
    cadastros: false,
    admin: false 
  });

  const toggleMenu = (key) => setExpandedMenu(prev => ({ ...prev, [key]: !prev[key] }));

  // Verificar permissões do usuário
  const isAdmin = user?.role === 'admin';
  const isTecnico = user?.role === 'tecnico' || isAdmin;
  const canManageUsers = isAdmin;
  const canManageGroups = isAdmin;
  const canManageAssets = isTecnico;

  return (
    <aside className="w-64 bg-[#0B1A38] flex flex-col fixed h-full z-20 shadow-xl border-r border-slate-800/50 print:hidden">
      {/* Logo */}
      <div className="h-24 flex items-center justify-center border-b border-white/10">
        <SolveLogo />
      </div>
      
      {/* Info do Usuário */}
      <div className="p-4 bg-[#081226] flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-[#86efac] text-[#0B1A38] flex items-center justify-center font-bold shadow-lg text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-white">{user?.name || 'Usuário'}</p>
          <div className="flex items-center gap-1">
            <p className="text-xs text-slate-400 capitalize">{user?.role || 'user'}</p>
            {isAdmin && (
              <Lock className="w-3 h-3 text-yellow-400" />
            )}
          </div>
        </div>
      </div>
      
      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {/* Dashboard */}
        <SidebarItem 
          icon={LayoutDashboard} 
          label="DASHBOARD" 
          active={view === 'dashboard'} 
          onClick={() => setView('dashboard')} 
        />
        
        {/* Chamados */}
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
            <div className="bg-[#081226] py-2">
              <SubMenuItem 
                active={view === 'new-ticket'} 
                onClick={() => setView('new-ticket')} 
                icon={Plus} 
                label="ABRIR CHAMADO" 
              />
              <SubMenuItem 
                active={view === 'tickets'} 
                onClick={() => setView('tickets')} 
                icon={List} 
                label="LISTA DE CHAMADOS" 
              />
              <SubMenuItem 
                active={view === 'reports'} 
                onClick={() => setView('reports')} 
                icon={FileText} 
                label="RELATÓRIO GERAL" 
              />
            </div>
          )}
        </div>

        {/* Cadastros - Apenas para técnicos e admin */}
        {(isTecnico || canManageAssets || canManageUsers) && (
          <div>
            <button 
              onClick={() => toggleMenu('cadastros')} 
              className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span>CADASTROS</span>
              </div>
              {expandedMenu.cadastros ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            {expandedMenu.cadastros && (
              <div className="bg-[#081226] py-2">
                {/* Equipamentos - Apenas técnicos e admin */}
                {(isTecnico || canManageAssets) && (
                  <SubMenuItem 
                    active={view === 'assets'} 
                    onClick={() => setView('assets')} 
                    icon={Server} 
                    label="EQUIPAMENTOS" 
                  />
                )}
                
                {/* Usuários - Apenas admin */}
                {canManageUsers && (
                  <SubMenuItem 
                    active={view === 'users'} 
                    onClick={() => setView('users')} 
                    icon={Users} 
                    label="USUÁRIOS" 
                  />
                )}
                
                {/* Grupos - Apenas admin */}
                {canManageGroups && (
                  <SubMenuItem 
                    active={view === 'groups'} 
                    onClick={() => setView('groups')} 
                    icon={Shield} 
                    label="GRUPOS" 
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Menu Admin - Apenas para administradores */}
        {isAdmin && (
          <div>
            <button 
              onClick={() => toggleMenu('admin')} 
              className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-yellow-400 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <span>ADMIN</span>
              </div>
              {expandedMenu.admin ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            {expandedMenu.admin && (
              <div className="bg-[#081226] py-2">
                <SubMenuItem 
                  active={view === 'users'} 
                  onClick={() => setView('users')} 
                  icon={Users} 
                  label="GERENCIAR USUÁRIOS" 
                />
                <SubMenuItem 
                  active={view === 'groups'} 
                  onClick={() => setView('groups')} 
                  icon={Shield} 
                  label="GERENCIAR GRUPOS" 
                />
                <SubMenuItem 
                  active={view === 'reports'} 
                  onClick={() => setView('reports')} 
                  icon={FileText} 
                  label="RELATÓRIOS AVANÇADOS" 
                />
              </div>
            )}
          </div>
        )}

        {/* Perfil do Usuário */}
        <div className="pt-4 border-t border-white/10 mx-6">
          <SidebarItem 
            icon={User} 
            label="MEU PERFIL" 
            active={view === 'profile'} 
            onClick={() => setView('profile')} 
          />
        </div>
      </nav>

      {/* Botão Sair */}
      <div className="p-4 bg-[#081226] border-t border-white/10">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-sm font-bold uppercase transition-colors shadow-lg"
        >
          <LogOut className="w-4 h-4" /> 
          Sair do Sistema
        </button>
        
        {/* Info da sessão */}
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-500">
            Logado como: <span className="text-slate-400 font-medium">{user?.name}</span>
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            {user?.role === 'admin' ? 'Administrador' : 
             user?.role === 'tecnico' ? 'Técnico' : 'Usuário'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;