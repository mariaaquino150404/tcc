'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, LogOut, UserCircle, 
  Home, MessageSquare, BookOpen, Users 
} from 'lucide-react';
import { sairDoSistema } from '../lib/auth';

export default function MeuPerfil() {
  const router = useRouter();
  const [emailUsuario, setEmailUsuario] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState(''); 

  useEffect(() => {
    const email = sessionStorage.getItem('emailUsuarioLogado');
    if (!email) {
      router.push('/login');
      return;
    }
    setEmailUsuario(email);
    
    // Lê qual é o perfil do usuário logado (salvo na hora do login)
    const perfilSalvo = sessionStorage.getItem('tipoPerfil') || 'operador';
    setTipoPerfil(perfilSalvo);
  }, [router]);

  // Enquanto não carrega o perfil da sessão, evita piscar a tela errada
  if (!tipoPerfil) return null; 

  return (
    <div className="flex h-screen bg-white overflow-hidden text-gray-800">
      
      {/* 
        SIDEBAR DINÂMICA: 
        Se for admin = Azul (#103f6b) 
        Se for operador = Verde (#059669) 
      */}
      <aside className={`w-64 text-white flex flex-col justify-between p-5 select-none shrink-0 transition-colors ${tipoPerfil === 'admin' ? 'bg-[#103f6b]' : 'bg-[#059669]'}`}>
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <img 
              src="/imagem/logo.png" 
              alt="Logo" 
              className={`h-8 w-auto object-contain p-1 rounded ${tipoPerfil === 'admin' ? 'bg-white/75' : 'bg-white/90'}`}
            />
            <div>
              <h2 className="font-bold text-sm tracking-wide leading-none">Suporte IA</h2>
              <span className={`text-[10px] uppercase font-semibold ${tipoPerfil === 'admin' ? 'text-blue-200' : 'text-emerald-200'}`}>
                {tipoPerfil === 'admin' ? 'Painel Adm' : 'Área do Operador'}
              </span>
            </div>
          </div>

          {/* MENU DO ADMINISTRADOR (Exibido apenas para Admin) */}
          {tipoPerfil === 'admin' && (
            <nav className="space-y-1.5 text-sm">
              <Link href="/painel-adm" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-white/5 hover:text-white transition-colors">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link href="/biblioteca" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-white/5 hover:text-white transition-colors">
                <BookOpen size={18} /> Base de Documentos
              </Link>
              <Link href="/usuarios" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-white/5 hover:text-white transition-colors">
                <Users size={18} /> Gestão de Usuários
              </Link>
              <Link href="/perfil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 font-medium text-white transition-colors">
                <UserCircle size={18} /> Meu Perfil
              </Link>
            </nav>
          )}

          {/* MENU DO OPERADOR (Exibido apenas para Operador) */}
          {tipoPerfil === 'operador' && (
            <nav className="space-y-1.5 text-sm">
              <Link href="/painel-operador" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors">
                <Home size={18} /> Página Inicial
              </Link>
              <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors">
                <MessageSquare size={18} /> Consultar IA
              </Link>
              <Link href="/perfil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/15 font-medium text-white transition-colors">
                <UserCircle size={18} /> Meu Perfil
              </Link>
            </nav>
          )}
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="px-2">
            <p className={`text-[11px] uppercase font-semibold tracking-wider ${tipoPerfil === 'admin' ? 'text-blue-200' : 'text-emerald-200'}`}>
              Logado como
            </p>
            <p className="text-xs text-white truncate font-medium">{emailUsuario}</p>
          </div>
          <button 
            onClick={sairDoSistema} 
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:text-white rounded-lg transition-colors cursor-pointer ${
              tipoPerfil === 'admin' 
                ? 'text-rose-200 hover:bg-rose-600/20' 
                : 'text-rose-200 hover:bg-rose-600/30'
            }`}
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (Muda os detalhes internos conforme a cor também) */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shrink-0">
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Configurações da Conta</h1>
        </header>
        
        <section className="p-8">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-full ${tipoPerfil === 'admin' ? 'bg-blue-50 text-[#103f6b]' : 'bg-emerald-50 text-[#059669]'}`}>
                <UserCircle size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
                <p className="text-sm text-gray-500">Visualize suas informações de acesso</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">E-mail Cadastrado</label>
                <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">{emailUsuario}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nível de Acesso</label>
                <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100 capitalize">
                  {tipoPerfil === 'admin' ? 'Administrador do Sistema' : 'Operador de Suporte (IA)'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}