'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; 

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  
  useEffect(() => {
    sessionStorage.removeItem('emailUsuarioLogado');
    sessionStorage.removeItem('id_sessao');
    sessionStorage.removeItem('tipoPerfil');
  }, []);

  async function tentarLogin(forcarLogin = false) {
    setCarregando(true);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha, forcarLogin }),
        credentials: 'include', 
      });
      
      const data = await resp.json();

      if (!resp.ok) {
        if (resp.status === 409 && data.detail?.requerConfirmacao) {
          setModalVisivel(true);
          setCarregando(false);
          return;
        }
        throw new Error(data.detail || 'E-mail ou senha incorretos.');
      }

      sessionStorage.setItem('emailUsuarioLogado', data.email);
      sessionStorage.setItem('id_sessao', data.id_sessao);

      const perfisIds = data.perfis?.map((p) => p.id_perfil) || [];
      
      sessionStorage.setItem('tipoPerfil', perfisIds.includes(1) ? 'admin' : 'operador');

      toast.success('Bem-vindo de volta!');

      if (perfisIds.includes(1)) {
        router.push('/painel-adm');
      } else {
        router.push('/painel-operador');
      }
    } catch (err) {
      toast.error(err.message);
      setCarregando(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    tentarLogin();
  }

  return (
    <div className="flex min-h-screen bg-white">
      
      <div className="hidden lg:flex lg:w-1/2 bg-[#f0f6fa] border-r border-gray-100 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#103f6b]/15 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#103f6b]/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <img 
            src="/imagem/logo.png" 
            alt="Logo do Sistema" 
            className="w-44 sm:w-72 h-auto object-contain drop-shadow-sm"
          />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Gestão inteligente de conhecimento.
          </h1>
          <p className="text-lg text-gray-600">
            Acesse a plataforma para consultar manuais, fluxos e obter respostas com nossa IA integrada.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
            <p className="text-sm text-gray-500 mt-1">Insira suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                placeholder="nome@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#103f6b] focus:ring-1 focus:ring-[#103f6b] transition-colors shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link href="/recuperar" className="text-sm font-medium text-[#103f6b] hover:underline transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#103f6b] focus:ring-1 focus:ring-[#103f6b] transition-colors shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={carregando}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#103f6b] hover:bg-[#0c2f50] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {carregando ? <Loader2 className="animate-spin" size={18} /> : 'Fazer login'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                href="/cadastro" 
                className="font-semibold text-[#103f6b] hover:underline transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
      
   
      {modalVisivel && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sessão já ativa</h3>
            <p className="text-gray-600 text-sm mb-6">
              Detectamos que você já possui uma sessão aberta em outro dispositivo. Deseja encerrar a anterior e entrar aqui?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalVisivel(false);
                  toast.error('Login cancelado.'); 
                }}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalVisivel(false);
                  tentarLogin(true);
                }}
                className="flex-1 py-2.5 px-4 bg-[#103f6b] text-white text-sm font-semibold rounded-lg hover:bg-[#0c2f50] transition-colors cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}