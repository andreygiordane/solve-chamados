import React, { useState, useEffect } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import SolveLogo from '../components/ui/SolveLogo';
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
    // Verificar se já está autenticado
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
          // Sessão inválida, limpar storage
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
      const result = await api.login(formData.email, formData.password);
      
      if (result.success) {
        showToast('Login realizado com sucesso!', 'success');
        onLogin(result.user);
      } else {
        showToast(result.message || 'Erro no login', 'error');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showToast('Erro ao conectar com o servidor', 'error');
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
    <div className="min-h-screen flex items-center justify-center bg-[#0e1525] relative overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#86efac]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md p-8 bg-[#1a2236] rounded-2xl shadow-2xl border border-white/5 z-10">
        <div className="text-center mb-8">
          <SolveLogo className="w-16 h-16" textSize="text-4xl" />
          <h2 className="text-2xl font-bold text-white mt-4">Acessar Sistema</h2>
          <p className="text-slate-400 mt-2">Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-[#0e1525] border border-slate-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#86efac] transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
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
                className="w-full bg-[#0e1525] border border-slate-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#86efac] transition-all pr-10"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#86efac] hover:bg-[#6ee798] text-[#0e1525] font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0e1525]"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-300">
              <strong className="block">Credenciais de teste:</strong>
              <span>Email: admin@solve.com</span><br />
              <span>Senha: 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;