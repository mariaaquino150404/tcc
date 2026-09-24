'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, FileSearch } from 'lucide-react';
import SidebarAdmin from '../../../components/sidebar/sideBarAdmin';

export default function GestaoPendencias() {
  const router = useRouter();
  const [pendencias, setPendencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('emailUsuarioLogado')) {
      router.push('/login');
      return;
    }
    
    async function carregarPendencias() {
      try {
        const resp = await fetch('/api/chat/pendencias', { credentials: 'include' });
        if (!resp.ok) throw new Error('Não foi possível carregar as pendências.');
        const data = await resp.json();
        setPendencias(data);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarPendencias();
  }, [router]);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-gray-800 font-sans selection:bg-[#103f6b]/20">
      
      <SidebarAdmin />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-10 shrink-0 z-10 sticky top-0">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Chamados e Pendências</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Histórico de dúvidas não resolvidas pela IA</p>
          </div>
        </header>

        <section className="flex-1 p-10 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                <FileSearch size={20} strokeWidth={2.5} className="text-rose-500" />
                Necessitam Inclusão de Manual
              </h2>
            </div>
            
            {carregando ? (
              <div className="py-32 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 size={28} className="animate-spin text-[#103f6b]" />
                <span className="text-sm font-medium">Buscando pendências...</span>
              </div>
            ) : erro ? (
              <div className="py-20 text-center text-rose-500 text-sm font-medium bg-rose-50/50 rounded-b-3xl flex flex-col items-center gap-2">
                <AlertCircle size={24} /> {erro}
              </div>
            ) : pendencias.length === 0 ? (
              <div className="py-24 text-center text-gray-500 text-sm font-medium flex flex-col items-center gap-3">
                <div className="bg-emerald-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle size={32} className="text-emerald-500" />
                </div>
                <p className="font-extrabold text-gray-900 text-lg">Tudo em dia!</p>
                <span className="text-gray-500">A Inteligência Artificial tem conseguido responder a todas as consultas.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Data / Hora</th>
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/2">Dúvida do Operador</th>
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                      <th className="py-4 px-8 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {pendencias.map((p) => (
                      <tr key={p.id_solucaonaoencontrada} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-5 px-8 text-gray-500 font-semibold text-xs whitespace-nowrap">
                          {new Date(p.data_criacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-5 px-8 font-bold text-gray-900 text-sm italic group-hover:text-[#103f6b] transition-colors">
                          "{p.input}"
                        </td>
                        <td className="py-5 px-8 text-center">
                          <span className="inline-flex items-center justify-center w-[100px] py-1.5 rounded-xl text-xs font-bold bg-rose-50/80 text-rose-600 border border-rose-100">
                            Pendente
                          </span>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <Link href="/biblioteca" className="inline-block px-5 py-2.5 bg-[#103f6b] text-white text-xs font-bold rounded-xl hover:bg-[#0c2f50] transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                            Adicionar Doc
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}