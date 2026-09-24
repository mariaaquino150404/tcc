'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, TrendingUp, Activity } from 'lucide-react';
import SidebarAdmin from '../../../components/sidebar/sideBarAdmin';

export default function Relatorios() {
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('emailUsuarioLogado')) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-gray-800 font-sans selection:bg-[#103f6b]/20">
      
      <SidebarAdmin />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Relatórios Gerenciais</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Métricas de acesso e engajamento com a IA</p>
          </div>
        </header>
        
        <section className="flex-1 p-10 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-gray-900 tracking-tight uppercase text-xs">Consultas Recentes</h3>
                <div className="p-3 bg-blue-50 text-[#103f6b] rounded-xl"><MessageSquare size={20} strokeWidth={2.5}/></div>
              </div>
              <div className="text-4xl font-black text-gray-900 mb-2">1,245</div>
              <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-bold bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                <TrendingUp size={14} strokeWidth={3} /> +12% em relação ao mês anterior
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-gray-900 tracking-tight uppercase text-xs">Uso do Sistema</h3>
                <div className="p-3 bg-blue-50 text-[#103f6b] rounded-xl"><Activity size={20} strokeWidth={2.5} /></div>
              </div>
              <div className="text-4xl font-black text-gray-900 mb-2">98.5%</div>
              <p className="text-xs text-gray-500 font-bold bg-gray-50 w-fit px-3 py-1 rounded-lg">
                Taxa de uptime do Ollama (7 dias)
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
             <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mb-4">
                 <BarChart2 size={32} className="text-gray-300" />
             </div>
             <p className="text-gray-400 text-sm font-bold uppercase tracking-wide">Integração com Gráficos</p>
             <span className="text-xs text-gray-400 mt-1">Módulo em desenvolvimento</span>
          </div>
        </section>
      </main>
    </div>
  );
}