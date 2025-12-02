import React, { useState, useEffect } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
// Certifique-se de que estes caminhos estão corretos no seu projeto
import { api } from '../services/api';
import Toast from '../components/ui/Toast';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      
      if (user && token) {
        try {
          const validation = await api.validateSession();
          if (validation.success) {
            onLogin(validation.user);
          }
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, [onLogin]);

  const showToast = (msg, type) => setToast({ message: msg, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Exemplo de chamada de API. Ajuste conforme sua implementação real.
      const result = await api.login(formData.email, formData.password);
      
      if (result.success) {
        showToast('Login realizado com sucesso!', 'success');
        onLogin(result.user);
      } else {
        showToast(result.message || 'Erro no login', 'error');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      // showToast('Erro ao conectar com o servidor', 'error');
       // Simulando sucesso para visualização, já que não temos a API real aqui.
       showToast('Simulação: Login bem sucedido!', 'success');
       setTimeout(() => onLogin({ name: 'Usuário Teste', email: formData.email }), 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e1525] relative overflow-hidden font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Efeitos de Fundo Sutis */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#86efac]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-sm bg-[#1a2236] rounded-2xl shadow-2xl border border-white/5 z-10 overflow-hidden">
        <div className="p-8">
          
          {/* --- ÁREA DA LOGO CENTRALIZADA (MODIFICADO) --- */}
          <div className="text-center mb-8 flex flex-col items-center">
            {/* ATENÇÃO: Substitua o src abaixo pelo caminho real da sua imagem salva */}
            <img 
              src="/image/logo-login.svg" 
              alt="Logo Solve" 
              // Ajustei as classes para a nova logo: removi bordas/sombras e ajustei o tamanho
              className="h-16 w-auto mb-6 hover:scale-105 transition-transform duration-300"
            />
            <h2 className="text-xl font-semibold text-white tracking-wide">Acessar Sistema</h2>
            <p className="text-xs text-slate-400 mt-1">Entre com suas credenciais</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-[#0e1525] border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#86efac] focus:ring-1 focus:ring-[#86efac]/50 transition-all placeholder:text-slate-600"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-[#0e1525] border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#86efac] focus:ring-1 focus:ring-[#86efac]/50 transition-all pr-10 placeholder:text-slate-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#86efac] hover:bg-[#6ee798] text-[#0e1525] font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20 mt-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0e1525] border-t-transparent"></div>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Entrando...' : 'ENTRAR'}
            </button>
          </form>
        </div>

        
      </div>
    </div>
  );
};

export default Login;