'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, MessageSquare, BookOpen, FileQuestion, BarChart2, Users, User, LogOut } from 'lucide-react';

export default function Sidebar({ links }) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await fetch('/api/sessoes/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch {
      // Ignora erro de rede no logout
    }
    // Removemos o token do storage, mantendo apenas o e-mail se quiser para cache[cite: 1, 4]
    sessionStorage.clear();
    router.push('/login');
  }

  return (
    <>
      {/* Botão Mobile */}
      <button 
        className="md:hidden fixed top-3 left-3 bg-green-600 text-white p-2 rounded-lg z-50 hover:bg-green-700"
        onClick={() => setAberto(!aberto)}
      >
        {aberto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Mobile */}
      {aberto && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setAberto(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed top-0 left-0 h-screen w-64 bg-green-600 text-white flex flex-col pt-16 md:pt-8 transition-transform duration-300 z-40
        ${aberto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icone = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`
                  flex items-center gap-3 w-full p-3 rounded-lg font-bold transition-all
                  ${isActive ? 'bg-green-700 shadow-inner' : 'hover:bg-green-700 hover:scale-105 hover:shadow-md'}
                `}
              >
                <Icone size={20} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Botão de Logout */}
        <div className="p-4 border-t border-green-500">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </nav>
    </>
  );
}