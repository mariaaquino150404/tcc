'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, FileSearch, UploadCloud, X } from 'lucide-react';
import SidebarAdmin from '../../../components/sidebar/sideBarAdmin';

export default function GestaoPendencias() {
  const router = useRouter();
  
  // Estados da Tela
  const [pendencias, setPendencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do Modal de Upload
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
      } finally {
        setCarregando(false);
      }
    }
    carregarPendencias();
  }, [router]);

  // Ações do Modal
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

  // Lógica de Envio do Ficheiro para o FastAPI
  const lidarComUpload = async (e) => {
    e.preventDefault();
    if (!arquivo || !pendenciaAtual) return;

    setEnviando(true);

    // Estrutura exigida para enviar arquivos + textos na mesma requisição
    const formData = new FormData();
    // 'file' deve bater exatamente com o nome do parâmetro no FastAPI (file: UploadFile)
    formData.append('file', arquivo); 
    // 'pendencia_id' deve bater com o parâmetro Form() no FastAPI
    formData.append('pendencia_id', pendenciaAtual.id_solucaonaoencontrada); 

    try {
      // Usamos fetch nativo aqui porque o FormData gera automaticamente 
      // o cabeçalho 'multipart/form-data' e o 'boundary' necessários.
      const resp = await fetch('http://localhost:8000/api/documentos/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', 
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || "Falha ao enviar documento.");
      }

      // REMOÇÃO INSTANTÂNEA: Filtra a pendência recém-resolvida para fora do estado
      setPendencias(pendencias.filter(p => p.id_solucaonaoencontrada !== pendenciaAtual.id_solucaonaoencontrada));
      
      fecharModal();
    } catch (error) {
      console.error("Erro no processamento:", error);
      alert(error.message);
    } finally {
      setEnviando(false);
    }
  };

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

        <section className="flex-1 p-10 overflow-y-auto relative">
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
                          {/* Botão substituindo o antigo Link */}
                          <button 
                            onClick={() => abrirModal(p)}
                            className="inline-block px-5 py-2.5 bg-[#103f6b] text-white text-xs font-bold rounded-xl hover:bg-[#0c2f50] transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer"
                          >
                            Solucionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ================= MODAL DE UPLOAD ================= */}
        {modalAberto && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
              
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-extrabold text-gray-900 text-lg">Adicionar Conhecimento</h3>
                <button onClick={fecharModal} className="text-gray-400 hover:text-rose-500 transition-colors">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resolvendo a dúvida:</p>
                  <p className="text-sm font-semibold text-[#103f6b] bg-[#103f6b]/5 p-4 rounded-xl border border-[#103f6b]/10 italic">
                    "{pendenciaAtual?.input}"
                  </p>
                </div>

                <form onSubmit={lidarComUpload}>
                  <label className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center mb-8 cursor-pointer hover:border-[#103f6b]/50 hover:bg-[#103f6b]/5 transition-all group">
                    <UploadCloud className="text-gray-400 mb-3 group-hover:text-[#103f6b] transition-colors" size={40} strokeWidth={1.5} />
                    <span className="text-sm font-bold text-gray-700 mb-1">Clique ou arraste um arquivo</span>
                    <span className="text-xs text-gray-400">Apenas arquivos .txt ou .pdf</span>
                    <input 
                      type="file" 
                      accept=".pdf,.txt"
                      onChange={(e) => setArquivo(e.target.files[0])}
                      required
                      className="hidden"
                    />
                    {arquivo && (
                      <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                        Selecionado: {arquivo.name}
                      </div>
                    )}
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={fecharModal}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!arquivo || enviando}
                      className="flex-1 py-3 bg-[#103f6b] text-white rounded-xl hover:bg-[#0c2f50] font-bold text-sm flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                      {enviando ? <Loader2 className="animate-spin" size={18} /> : 'Processar e Encerrar'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
} 