// components/SidebarAdmin.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, UserCircle, LogOut, AlertCircle, Tag, BarChart2 } from 'lucide-react';
import { sairDoSistema } from '../../app/lib/auth';

export default function SidebarAdmin() {
  const pathname = usePathname();
  const [emailUsuario, setEmailUsuario] = useState('');
  const [pendencias, setPendencias] = useState([]);

  useEffect(() => {
    setEmailUsuario(sessionStorage.getItem('emailUsuarioLogado') || '...');
    
    // Busca as pendências para atualizar o "badge" (bolinha vermelha)
    async function carregarPendenciasBadge() {
      try {
        const resp = await fetch('/api/chat/pendencias', { credentials: 'include' });
        if (resp.ok) {
          const data = await resp.json();
          setPendencias(data);
        }
      } catch (err) {
        console.error("Erro ao buscar pendências do menu", err);
      }
    }
    carregarPendenciasBadge();
  }, []);

  // Função auxiliar para verificar qual link está ativo
  const isActive = (path) => pathname === path;

  return (
    <aside className="w-[260px] bg-[#103f6b] text-white flex flex-col justify-between p-5 select-none shrink-0 shadow-2xl z-20 transition-all">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/5">
            <img src="/imagem/logo.png" alt="Logo" className="h-7 w-auto object-contain brightness-0 invert" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide leading-tight text-white">Suporte IA</h2>
            <span className="text-[10px] text-blue-200/80 uppercase font-bold tracking-wider">Painel Adm</span>
          </div>
        </div>

        <nav className="space-y-2 text-sm font-medium">
          <Link href="/painel-adm" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/painel-adm') ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-blue-100/70 hover:bg-white/10 hover:text-white'}`}>
            <LayoutDashboard size={18} strokeWidth={2.5} /> Dashboard
          </Link>
          <Link href="/biblioteca" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/biblioteca') ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-blue-100/70 hover:bg-white/10 hover:text-white'}`}>
            <BookOpen size={18} strokeWidth={2.5} /> Base de Dados
          </Link>
          <Link href="/pendencias" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive('/pendencias') ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-blue-100/70 hover:bg-white/10 hover:text-white'}`}>
            <div className="flex items-center gap-3">
              <AlertCircle size={18} strokeWidth={2.5} /> Chamados IA
            </div>
            {pendencias.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {pendencias.length}
              </span>
            )}
          </Link>
          <Link href="/usuarios" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/usuarios') ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-blue-100/70 hover:bg-white/10 hover:text-white'}`}>
            <Users size={18} strokeWidth={2.5} /> Usuários
          </Link>
          <Link href="/perfil" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/perfil') ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-blue-100/70 hover:bg-white/10 hover:text-white'}`}>
            <UserCircle size={18} strokeWidth={2.5} /> Meu Perfil
          </Link>
        </nav>
      </div>

      <div className="pt-5 border-t border-white/10 space-y-4">
        <div className="px-4">
          <p className="text-[10px] text-blue-200/70 uppercase font-bold tracking-wider mb-0.5">Logado como</p>
          <p className="text-xs text-white truncate font-medium opacity-90">{emailUsuario}</p>
        </div>
        <button 
          onClick={sairDoSistema} 
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-500/30"
        >
          <LogOut size={16} strokeWidth={2.5} /> Encerrar Sessão
        </button>
      </div>
    </aside>
  );
}