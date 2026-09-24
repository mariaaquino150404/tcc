'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import SidebarAdmin from '../../../components/sidebar/sideBarAdmin';

export default function GestaoAssuntos() {
  const router = useRouter();

  const [assuntos, setAssuntos] = useState([
    { id: 1, nome: 'Suporte de TI', status: true },
    { id: 2, nome: 'Recursos Humanos', status: true },
    { id: 3, nome: 'Financeiro', status: false },
  ]);

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
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Gestão de Assuntos</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Categorias para classificação de base de conhecimento</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#103f6b] hover:bg-[#0c2f50] text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5">
            <Plus size={18} strokeWidth={2.5} /> Novo Assunto
          </button>
        </header>

        <section className="flex-1 p-10 overflow-y-auto space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/2">Nome do Assunto</th>
                  <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-8 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {assuntos.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-5 px-8 font-bold text-gray-900 group-hover:text-[#103f6b] transition-colors">{a.nome}</td>
                    <td className="py-5 px-8 text-center">
                      <span className={`inline-flex items-center justify-center gap-1.5 w-[100px] py-1.5 rounded-xl text-xs font-bold border ${a.status ? 'bg-emerald-50/80 text-emerald-600 border-emerald-100' : 'bg-rose-50/80 text-rose-600 border-rose-100'}`}>
                        {a.status ? <><CheckCircle size={14} strokeWidth={2.5}/> Ativo</> : <><XCircle size={14} strokeWidth={2.5}/> Inativo</>}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <button className="px-5 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer shadow-sm">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}