'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  HelpCircle,
  Loader2,
  AlertCircle,
  BookOpen,
  Users
} from 'lucide-react';
import SidebarAdmin from '../../../components/sidebar/sideBarAdmin';

export default function PainelAdm() {
  const router = useRouter();
  const [metricas, setMetricas] = useState(null);
  const [statusIa, setStatusIa] = useState({ online: false, carregando: true });
  const [pendencias, setPendencias] = useState([]); 
  const [carregandoMetricas, setCarregandoMetricas] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const email = sessionStorage.getItem('emailUsuarioLogado');
    if (!email) {
      router.push('/login');
      return;
    }

    async function carregarDados() {
      try {
        const [resMetricas, resIa, resPendencias] = await Promise.allSettled([
          fetch('/api/admin/metricas'),
          fetch('/api/admin/status-ia'),
          fetch('/api/chat/pendencias', { credentials: 'include' }) 
        ]);

        if (resMetricas.status === 'fulfilled' && resMetricas.value.ok) {
          const data = await resMetricas.value.json();
          setMetricas(data);
        } else {
          setErro('Falha ao sincronizar métricas operacionais com o servidor.');
        }

        if (resIa.status === 'fulfilled' && resIa.value.ok) {
          const iaData = await resIa.value.json();
          setStatusIa({ online: iaData.online ?? false, carregando: false });
        } else {
          setStatusIa({ online: false, carregando: false });
        }

        if (resPendencias.status === 'fulfilled' && resPendencias.value.ok) {
          const dadosPendencias = await resPendencias.value.json();
          setPendencias(dadosPendencias);
        }
      } catch (err) {
        setErro(err.message || 'Erro de conexão com a API.');
      } finally {
        setCarregandoMetricas(false);
      }
    }

    carregarDados();
  }, [router]);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-gray-800 font-sans selection:bg-[#103f6b]/20">
      
      {/* Sidebar Componentizada */}
      <SidebarAdmin />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Visão Geral</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Métricas operacionais e integridade da infraestrutura</p>
          </div>

          <div className="flex items-center gap-3">
            {statusIa.carregando ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                <Loader2 size={14} className="animate-spin" /> Verificando IA...
              </span>
            ) : statusIa.online ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ollama Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Ollama Inacessível
              </span>
            )}
          </div>
        </header>

        <section className="flex-1 p-10 overflow-y-auto space-y-6">
          {erro && (
            <div className="p-4 bg-amber-50 text-amber-800 text-sm font-semibold rounded-2xl border border-amber-200 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-600 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Cards de Métricas em Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Chamados Pendentes</p>
                {carregandoMetricas ? (
                  <Loader2 size={24} className="animate-spin text-rose-600 mt-2" />
                ) : (
                  <h3 className="text-3xl font-black text-gray-900 mt-1">{pendencias.length}</h3>
                )}
                <Link href="/pendencias" className="text-[11px] text-[#103f6b] font-bold mt-2 block hover:underline">
                  Ver lista completa &rarr;
                </Link>
              </div>
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertCircle size={28} strokeWidth={2.5} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Documentos Base</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {carregandoMetricas ? <Loader2 size={24} className="animate-spin text-[#103f6b]" /> : (metricas?.totalDocumentos ?? 0)}
                </h3>
                <span className="text-[11px] text-gray-400 font-bold mt-1 block">Arquivos indexados</span>
              </div>
              <div className="p-4 bg-blue-50 text-[#103f6b] rounded-2xl">
                <FileText size={28} strokeWidth={2.5} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Consultas Totais</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {carregandoMetricas ? <Loader2 size={24} className="animate-spin text-[#103f6b]" /> : (metricas?.totalConsultas ?? 0)}
                </h3>
                <span className="text-[11px] text-gray-400 font-bold mt-1 block">Enviadas à IA</span>
              </div>
              <div className="p-4 bg-blue-50 text-[#103f6b] rounded-2xl">
                <HelpCircle size={28} strokeWidth={2.5} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Usuários Ativos</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {carregandoMetricas ? <Loader2 size={24} className="animate-spin text-[#103f6b]" /> : (metricas?.totalUsuarios ?? 0)}
                </h3>
                <span className="text-[11px] text-gray-400 font-bold mt-1 block">Cadastrados no sistema</span>
              </div>
              <div className="p-4 bg-blue-50 text-[#103f6b] rounded-2xl">
                <Users size={28} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Atalhos */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wide">Gerenciamento Operacional</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link href="/biblioteca" className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#103f6b]/30 hover:bg-blue-50/30 transition-all group hover:shadow-sm">
                <div className="p-3 bg-blue-50 text-[#103f6b] group-hover:bg-[#103f6b] group-hover:text-white rounded-xl transition-colors">
                  <BookOpen size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#103f6b] transition-colors">Base de Documentos</h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Gerencie os manuais e visualize o processamento de embeddings.</p>
                </div>
              </Link>
              <Link href="/usuarios" className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#103f6b]/30 hover:bg-blue-50/30 transition-all group hover:shadow-sm">
                <div className="p-3 bg-blue-50 text-[#103f6b] group-hover:bg-[#103f6b] group-hover:text-white rounded-xl transition-colors">
                  <Users size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#103f6b] transition-colors">Controle de Usuários</h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Defina permissões de administrador e visualize os acessos.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}