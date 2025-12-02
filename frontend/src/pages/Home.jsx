import React from 'react';
import { Plus, List, FileText, Zap, Shield, Clock, ArrowRight, Server, Users, Key, Settings } from 'lucide-react';

const Home = ({ currentUser, setView }) => {
  
  // Helper para verificar role
  const hasRole = (allowedRoles) => {
    if (!allowedRoles) return true; // Se não tiver restrição, todos veem
    return allowedRoles.includes(currentUser?.role);
  };

  // Lista completa de ações possíveis
  const allActions = [
    {
      title: "Abrir Chamado",
      desc: "Relate um problema ou solicite serviço.",
      icon: Plus,
      color: "bg-blue-500",
      view: "new-ticket",
      allowedRoles: null // Todos
    },
    {
      title: "Meus Chamados", // Para técnicos vira "Fila de Chamados" visualmente no futuro se quiser
      desc: "Acompanhe suas solicitações.",
      icon: List,
      color: "bg-emerald-500",
      view: "tickets",
      allowedRoles: null
    },
    {
      title: "Relatórios",
      desc: "Exporte dados e analise métricas.",
      icon: FileText,
      color: "bg-purple-500",
      view: "reports",
      allowedRoles: null
    },
    // --- APENAS TÉCNICOS E ADMINS ---
    {
      title: "Equipamentos",
      desc: "Gestão de inventário de TI.",
      icon: Server,
      color: "bg-orange-500",
      view: "assets",
      allowedRoles: ['admin', 'tecnico', 'tecnico_n3']
    },
    // --- APENAS ADMIN ---
    {
      title: "Usuários",
      desc: "Gerenciar contas e acessos.",
      icon: Users,
      color: "bg-pink-600",
      view: "users",
      allowedRoles: ['admin']
    },
    {
      title: "Grupos de Acesso",
      desc: "Configurar grupos de atendimento.",
      icon: Shield,
      color: "bg-indigo-600",
      view: "groups",
      allowedRoles: ['admin']
    },
    {
      title: "Permissões",
      desc: "Definir regras de cargos.",
      icon: Key,
      color: "bg-yellow-600",
      view: "roles",
      allowedRoles: ['admin']
    }
  ];

  // Filtra as ações baseadas no usuário atual
  const visibleActions = allActions.filter(action => hasRole(action.allowedRoles));

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-[#1a2236] to-[#0B1A38] rounded-3xl p-8 md:p-12 overflow-hidden border border-white/5 shadow-2xl flex flex-col-reverse md:flex-row items-center gap-8 group">
        
        {/* Efeitos de Fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-1000 group-hover:bg-blue-600/20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none transition-all duration-1000 group-hover:bg-emerald-500/20"></div>

        <div className="flex-1 z-10 space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Solve Chamados V1.0
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{currentUser?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto md:mx-0 leading-relaxed">
              {hasRole(['admin', 'tecnico']) 
                ? "Painel administrativo pronto. O que vamos gerenciar hoje?" 
                : "Bem-vindo ao seu portal de serviços. Estamos prontos para resolver seus problemas técnicos."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
            <button 
              onClick={() => setView('new-ticket')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-1 flex items-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Abrir Chamado
            </button>
            {/* Botão Secundário condicional */}
            {hasRole(['admin', 'tecnico']) ? (
              <button 
                onClick={() => setView('dashboard')}
                className="bg-[#0e1525] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3"
              >
                <Zap className="w-5 h-5" />
                Ver Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setView('tickets')}
                className="bg-[#0e1525] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3"
              >
                <List className="w-5 h-5" />
                Meus Chamados
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center z-10 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A38] via-transparent to-transparent opacity-20 rounded-full blur-xl"></div>
          <img 
            src="/image/solve-home.svg" 
            alt="Ilustração" 
            className="w-full max-w-md object-contain drop-shadow-2xl transform transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>

      {/* ÁREA DE ACESSO RÁPIDO */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl text-white font-bold">Acesso Rápido</h2>
          </div>
          {currentUser?.role === 'admin' && (
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Modo Administrador</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleActions.map((action, idx) => (
            <button 
              key={idx}
              onClick={() => setView(action.view)}
              className="flex items-center gap-4 p-4 bg-[#151b2b] hover:bg-[#1e273b] border border-slate-800 hover:border-slate-600 rounded-xl transition-all group text-left relative overflow-hidden"
            >
              {/* Hover Effect Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

              <div className={`w-12 h-12 rounded-lg ${action.color} bg-opacity-20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-200 font-bold text-sm group-hover:text-white truncate">{action.title}</h4>
                <p className="text-slate-500 text-xs truncate">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {/* STATUS DO SISTEMA (Só visual, para dar um toque profissional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-medium">Sistema Operacional</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 md:justify-center">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Suporte 24/7</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 md:justify-end">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Conexão Segura</span>
        </div>
      </div>

    </div>
  );
};

export default Home;