// components/SidebarOperador.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, UserCircle, LogOut } from 'lucide-react';
import { sairDoSistema } from '../../app/lib/auth';

export default function SidebarOperador() {
  const pathname = usePathname();
  const [emailUsuario, setEmailUsuario] = useState('');

  useEffect(() => {
    setEmailUsuario(sessionStorage.getItem('emailUsuarioLogado') || '...');
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <aside className="w-[260px] bg-[#059669] text-white flex flex-col justify-between p-5 select-none shrink-0 shadow-2xl z-20 transition-all">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <img src="/imagem/logo.png" alt="Logo" className="h-8 w-auto object-contain bg-white/90 p-1 rounded-xl shadow-sm" />
          <div>
            <h2 className="font-bold text-sm tracking-wide leading-none text-white">Suporte IA</h2>
            <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Área do Operador</span>
          </div>
        </div>

        <nav className="space-y-2 text-sm font-medium">
          <Link href="/painel-operador" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/painel-operador') ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-emerald-100 hover:bg-white/10 hover:text-white'}`}>
            <Home size={18} strokeWidth={2.5} /> Página Inicial
          </Link>
          <Link href="/chat" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/chat') ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-emerald-100 hover:bg-white/10 hover:text-white'}`}>
            <MessageSquare size={18} strokeWidth={2.5} /> Consultar IA
          </Link>
          <Link href="/perfil" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/perfil') ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-emerald-100 hover:bg-white/10 hover:text-white'}`}>
            <UserCircle size={18} strokeWidth={2.5} /> Meu Perfil
          </Link>
        </nav>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="px-2">
          <p className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Logado como</p>
          <p className="text-xs text-white truncate font-medium">{emailUsuario}</p>
        </div>
        <button 
          onClick={sairDoSistema} 
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-200 hover:text-white hover:bg-rose-600/30 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-500/30"
        >
          <LogOut size={16} strokeWidth={2.5} /> Encerrar Sessão
        </button>
      </div>
    </aside>
  );
}