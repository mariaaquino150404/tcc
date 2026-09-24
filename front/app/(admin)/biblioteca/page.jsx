'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Search, CheckCircle, Trash2, FileText, Loader2, X, AlertCircle
} from 'lucide-react';
import SidebarAdmin from '../../../components/sidebar/sideBarAdmin';

export default function BibliotecaDocumentos() {
  const router = useRouter();
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  
  const [modalAberto, setModalAberto] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('emailUsuarioLogado')) {
      router.push('/login');
      return;
    }
    carregarDocumentos();
  }, [router]);

  async function carregarDocumentos() {
    setCarregando(true);
    setErro('');
    try {
      const resp = await fetch('/api/documentos');
      if (!resp.ok) throw new Error('Não foi possível carregar os documentos.');
      const data = await resp.json();
      setDocumentos(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!arquivo) return;
    setEnviando(true);
    const formData = new FormData();
    formData.append('file', arquivo);
    
    try {
      const resp = await fetch('/api/documentos/upload', { method: 'POST', body: formData });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || 'Erro ao processar o arquivo.');
      setModalAberto(false);
      setArquivo(null);
      carregarDocumentos(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function excluirDocumento(idDocumento) {
    if (!confirm('Deseja realmente excluir este documento? Os embeddings associados a ele também serão removidos.')) return;
    try {
      const resp = await fetch(`/api/documentos/${idDocumento}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Falha ao excluir o documento.');
      setDocumentos((prev) => prev.filter((d) => d.id_documento !== idDocumento));
    } catch (err) {
      alert(err.message);
    }
  }

  const documentosFiltrados = documentos.filter((d) =>
    d.titulo?.toLowerCase().includes(busca.toLowerCase()) || 
    d.arquivo?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-gray-800 font-sans selection:bg-[#103f6b]/20">
      
      <SidebarAdmin />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Base de Documentos</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Gerenciamento de manuais e arquivos indexados na IA</p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#103f6b] hover:bg-[#0c2f50] text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
          >
            <Upload size={18} strokeWidth={2.5} /> Enviar Arquivo
          </button>
        </header>

        <section className="flex-1 p-10 overflow-y-auto space-y-6">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-[#103f6b]/10 focus-within:border-[#103f6b]/30 transition-all max-w-2xl">
            <div className="pl-3 text-gray-400">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Buscar documento por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            />
            {busca && (
              <button onClick={() => setBusca('')} className="pr-3 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-visible">
            {carregando ? (
              <div className="py-32 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 size={28} className="animate-spin text-[#103f6b]" />
                <span className="text-sm font-medium">Sincronizando arquivos...</span>
              </div>
            ) : erro ? (
              <div className="py-20 text-center text-rose-500 text-sm font-medium bg-rose-50/50 rounded-b-3xl flex flex-col items-center gap-2">
                <AlertCircle size={24} /> {erro}
              </div>
            ) : documentosFiltrados.length === 0 ? (
              <div className="py-24 text-center text-gray-400 text-sm font-medium flex flex-col items-center gap-3">
                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-gray-300" />
                </div>
                Nenhum documento encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/2">Arquivo</th>
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Data de Envio</th>
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status RAG</th>
                      <th className="py-4 px-8 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {documentosFiltrados.map((doc) => (
                      <tr key={doc.id_documento} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-4 px-8 flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-[#103f6b] rounded-xl shrink-0">
                            <FileText size={18} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-[#103f6b] transition-colors">{doc.titulo}</p>
                            <p className="text-gray-400 text-xs font-semibold mt-0.5">{doc.tipo || '--'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-8 text-center text-gray-500 font-medium">
                          {doc.data_criacao ? new Date(doc.data_criacao).toLocaleDateString('pt-BR') : '--'}
                        </td>
                        <td className="py-4 px-8 text-center">
                          <span
                            className={`inline-flex items-center justify-center gap-1.5 w-[140px] py-1.5 rounded-xl text-xs font-bold border ${
                              doc.status === 'processando' ? 'bg-amber-50/80 text-amber-700 border-amber-100' : 'bg-emerald-50/80 text-emerald-700 border-emerald-100'
                            }`}
                          >
                            {doc.status === 'processando' ? (
                              <><Loader2 size={14} className="animate-spin" /> Em Processamento</>
                            ) : (
                              <><CheckCircle size={14} strokeWidth={2.5} /> IA Indexada</>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-8 text-right">
                          <button
                            onClick={() => excluirDocumento(doc.id_documento)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex"
                            title="Excluir Documento"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
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
      </main>
      {modalAberto && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[50] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-gray-100">
              <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Adicionar à Base</h3>
              <button onClick={() => { setModalAberto(false); setArquivo(null); }} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all cursor-pointer">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50/50 hover:border-[#103f6b]/50 transition-all cursor-pointer relative">
                <Upload size={40} strokeWidth={1.5} className="text-[#103f6b] mb-4" />
                <label className="text-base font-bold text-gray-900 cursor-pointer absolute inset-0 flex flex-col items-center justify-center pt-8">
                  Clique para selecionar
                  <input type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={(e) => setArquivo(e.target.files[0])} />
                </label>
                <p className="text-xs font-semibold text-gray-400 mt-6 relative z-10 pointer-events-none">PDF, DOCX ou TXT (Max. 10MB)</p>
                
                {arquivo && (
                  <div className="mt-5 p-3 bg-blue-100/50 border border-blue-200 text-[#103f6b] text-xs font-bold rounded-xl flex items-center gap-2 w-full justify-center relative z-10 pointer-events-none">
                    <FileText size={16} /> <span className="truncate max-w-[200px]">{arquivo.name}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModalAberto(false); setArquivo(null); }} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={!arquivo || enviando} className="flex-1 py-3 bg-[#103f6b] hover:bg-[#0c2f50] shadow-md text-white font-bold rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer transition-all">
                  {enviando ? <Loader2 size={18} className="animate-spin" /> : 'Processar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}