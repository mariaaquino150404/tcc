'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, Loader2, UploadCloud, X, 
  SearchX, CheckCircle2, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import SidebarAdmin from '../../../components/sidebar/sideBarAdmin';

export default function GestaoPendencias() {
  const router = useRouter();
  
  const [pendencias, setPendencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [pendenciaAtual, setPendenciaAtual] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('emailUsuarioLogado')) {
      router.push('/login');
      return;
    }
    
    async function carregarPendencias() {
      try {
        const resp = await fetch('http://localhost:8000/api/chat/pendencias', { credentials: 'include' });
        if (!resp.ok) throw new Error('Não foi possível carregar as pendências.');
        const data = await resp.json();
        setPendencias(data);
      } catch (err) {
        setErro(err.message);
        toast.error('Falha ao sincronizar chamados.');
      } finally {
        setCarregando(false);
      }
    }
    carregarPendencias();
  }, [router]);

  const abrirModal = (pendencia) => {
    setPendenciaAtual(pendencia);
    setArquivo(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setPendenciaAtual(null);
    setArquivo(null);
  };

  const lidarComUpload = async (e) => {
    e.preventDefault();
    if (!arquivo || !pendenciaAtual) return;

    setEnviando(true);
    const formData = new FormData();
    formData.append('file', arquivo); 
    formData.append('pendencia_id', pendenciaAtual.id_solucaonaoencontrada); 

    try {
      const resp = await fetch('http://localhost:8000/api/documentos/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', 
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || "Falha ao enviar documento.");
      }

      setPendencias(pendencias.filter(p => p.id_solucaonaoencontrada !== pendenciaAtual.id_solucaonaoencontrada));
      toast.success('Documento indexado com sucesso. Chamado encerrado.');
      fecharModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-900 font-sans selection:bg-[#103f6b]/20">
      
      <SidebarAdmin />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar Minimalista */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
              <ShieldAlert size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight">Fila de Triagem de IA</h1>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Pendências de Contexto</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Perguntas realizadas pelos operadores que a IA não conseguiu responder com a base atual.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                  {pendencias.length} {pendencias.length === 1 ? 'chamado' : 'chamados'}
                </span>
              </div>
            </div>
            {carregando ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm ring-1 ring-slate-900/5">
                <Loader2 size={24} className="animate-spin text-[#103f6b]" />
                <span className="mt-4 text-sm font-medium text-slate-500">A carregar registos...</span>
              </div>
            ) : erro ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm ring-1 ring-rose-900/10">
                <AlertCircle size={28} className="text-rose-500" />
                <span className="mt-3 text-sm font-medium text-slate-600">{erro}</span>
              </div>
            ) : pendencias.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl shadow-sm ring-1 ring-slate-900/5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Nenhuma pendência encontrada</h3>
                <p className="mt-1 text-sm text-slate-500">A base de conhecimento cobre todas as dúvidas recentes.</p>
              </div>
            ) : (
              <div className="mt-4 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sm:pl-6">
                              Data e Hora
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Dúvida Original
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Ações</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {pendencias.map((p) => (
                            <tr key={p.id_solucaonaoencontrada} className="hover:bg-slate-50 transition-colors">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 sm:pl-6">
                                {new Date(p.data_criacao).toLocaleDateString('pt-BR')} <span className="text-slate-400">às</span> {new Date(p.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-4 px-3 text-sm font-medium text-slate-900">
                                {p.input}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                  Aguardando Manual
                                </span>
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  onClick={() => abrirModal(p)}
                                  className="text-[#103f6b] hover:text-[#0c2f50] font-semibold transition-colors focus:outline-none"
                                >
                                  Resolver<span className="sr-only">, {p.input}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        {modalAberto && (
          <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg ring-1 ring-slate-900/5">
                  
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-slate-100">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#103f6b]/10 sm:mx-0 sm:h-10 sm:w-10">
                        <UploadCloud className="h-5 w-5 text-[#103f6b]" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 className="text-base font-semibold leading-6 text-slate-900" id="modal-title">
                          Fornecer Contexto
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-slate-500">
                            Faça o upload do documento oficial que responde a esta dúvida:
                          </p>
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-sm font-medium text-slate-900 italic">"{pendenciaAtual?.input}"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={lidarComUpload}>
                    <div className="px-4 py-6 sm:px-6">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {arquivo ? (
                            <div className="flex flex-col items-center text-[#103f6b]">
                              <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500" />
                              <p className="text-sm font-semibold">{arquivo.name}</p>
                            </div>
                          ) : (
                            <>
                              <p className="mb-2 text-sm text-slate-600"><span className="font-semibold text-[#103f6b]">Clique para procurar</span> ou arraste</p>
                              <p className="text-xs text-slate-500">PDF, TXT, DOCX</p>
                            </>
                          )}
                        </div>
                        <input type="file" accept=".pdf,.txt,.docx" onChange={(e) => setArquivo(e.target.files[0])} required className="hidden" />
                      </label>
                    </div>

                    <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-100">
                      <button
                        type="submit"
                        disabled={!arquivo || enviando}
                        className="inline-flex w-full justify-center rounded-md bg-[#103f6b] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0c2f50] disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto transition-colors"
                      >
                        {enviando ? <Loader2 className="h-4 w-4 animate-spin mr-2 mt-0.5" /> : null}
                        {enviando ? 'A processar...' : 'Indexar Documento'}
                      </button>
                      <button
                        type="button"
                        onClick={fecharModal}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}