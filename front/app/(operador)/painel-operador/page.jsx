'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sairDoSistema } from '../../lib/auth';
import { 
  Home, 
  MessageSquare, 
  UserCircle, 
  LogOut, 
  Activity, 
  BookOpen, 
  Search,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function PainelOperador() {
  const router = useRouter();
  const [emailUsuario, setEmailUsuario] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    const email = sessionStorage.getItem('emailUsuarioLogado');
    if (!email) {
      router.push('/login');
      return;
    }
    setEmailUsuario(email);
    setNomeUsuario(email.split('@')[0]);
  }, [router]);

  return (
    <div className="flex h-screen bg-white overflow-hidden text-gray-800">
      
      {/* Sidebar Lateral - Tema Verde Operador */}
      <aside className="w-64 bg-[#059669] text-white flex flex-col justify-between p-5 select-none shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <img 
              src="/imagem/logo.png" 
              alt="Logo" 
              className="h-8 w-auto object-contain bg-white/90 p-1 rounded"
            />
            <div>
              <h2 className="font-bold text-sm tracking-wide leading-none">Suporte IA</h2>
              <span className="text-[10px] text-emerald-200 uppercase font-semibold">Área do Operador</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm">
            <Link 
              href="/painel-operador" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/15 font-medium text-white transition-colors"
            >
              <Home size={18} /> Página Inicial
            </Link>
            <Link 
              href="/chat" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <MessageSquare size={18} /> Consultar IA
            </Link>
            <Link 
              href="/perfil" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <UserCircle size={18} /> Meu Perfil
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="px-2">
            <p className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Logado como</p>
            <p className="text-xs text-white truncate font-medium">{emailUsuario || '...'}</p>
          </div>
          <button 
            onClick={sairDoSistema} 
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        
        {/* Header Fixo Superior */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight capitalize">Olá, {nomeUsuario}! 👋</h1>
            <p className="text-xs text-gray-500">Pronto para resolver chamados com apoio da IA.</p>
          </div>

          <Link 
            href="/chat" 
            className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <MessageSquare size={16} /> Nova Consulta
          </Link>
        </header>

        {/* Área de Rolagem do Conteúdo */}
        <section className="flex-1 p-8 overflow-y-auto space-y-6">
          
          {/* Grid de Cards Superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Card 1: Status Motor */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status do Motor IA</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">Online</h3>
                </div>
                <span className="text-[11px] text-gray-500 font-medium mt-1 block">Conexão estável com RAG</span>
              </div>
              <div className="p-3 bg-emerald-50 text-[#059669] rounded-xl">
                <Activity size={24} />
              </div>
            </div>

            {/* Card 2: Base de Dados */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Base de Conhecimento</p>
                <h3 className="text-lg font-bold text-gray-900 mt-2">Sincronizada</h3>
                <span className="text-[11px] text-gray-500 font-medium mt-1 block">Pronta para consultas textuais</span>
              </div>
              <div className="p-3 bg-emerald-50 text-[#059669] rounded-xl">
                <BookOpen size={24} />
              </div>
            </div>

            {/* Card 3: Histórico de Uso */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suas Consultas</p>
                <h3 className="text-lg font-bold text-gray-900 mt-2">Nenhuma</h3>
                <span className="text-[11px] text-gray-500 font-medium mt-1 block">Registros da semana atual</span>
              </div>
              <div className="p-3 bg-emerald-50 text-[#059669] rounded-xl">
                <Search size={24} />
              </div>
            </div>

          </div>

          {/* Card Largo: Histórico e Ação */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              <h2 className="text-sm font-bold text-gray-900">Atividades Recentes</h2>
            </div>
            
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="p-4 bg-gray-50 rounded-full mb-3 border border-gray-100">
                <MessageSquare size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Seu histórico está vazio</p>
              <p className="text-xs text-gray-500 mt-1 mb-5 max-w-sm">
                Quando você realizar perguntas para a IA, os atalhos para as soluções encontradas aparecerão aqui.
              </p>
              <Link 
                href="/chat" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669] hover:text-[#047857] bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Fazer a primeira consulta <ChevronRight size={14} />
              </Link>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}