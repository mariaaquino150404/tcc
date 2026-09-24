'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { sairDoSistema } from '../../lib/auth';
import { 
  Search, Loader2, ExternalLink, AlertCircle,
  Home, MessageSquare, UserCircle, LogOut 
} from 'lucide-react';

export default function Chat() {
  const router = useRouter();
  const [emailUsuario, setEmailUsuario] = useState('');
  
  // Estados da IA
  const [pergunta, setPergunta] = useState('');
  const [resultado, setResultado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem('emailUsuarioLogado');
    if (!email) {
      router.push('/login');
      return;
    }
    setEmailUsuario(email);
  }, [router]);

  async function handleBuscar(e) {
    if (e) e.preventDefault();
    if (!pergunta.trim()) return;

    setBuscando(true);
    setResultado(null);

    try {
      const resp = await fetch('/api/chat/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta }),
        credentials: 'include',
      });

      if (!resp.ok) throw new Error('Erro na busca');

      const data = await resp.json();
      setResultado(data);
    } catch {
      setResultado({ erro: 'Ocorreu um erro ao conectar com a IA. Tente novamente.' });
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden text-gray-800">
      
      {/* Sidebar Lateral - Tema Verde Operador */}
      <aside className="w-64 bg-[#059669] text-white flex flex-col justify-between p-5 select-none shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <img 
              src="/imagem/logo.png" 
              alt="Logo" 
              className="h-8 w-auto object-contain bg-white/90 p-1 rounded"
            />
            <div>
              <h2 className="font-bold text-sm tracking-wide leading-none">Suporte IA</h2>
              <span className="text-[10px] text-emerald-200 uppercase font-semibold">Área do Operador</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm">
            <Link 
              href="/painel-operador" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Home size={18} /> Página Inicial
            </Link>
            <Link 
              href="/chat" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/15 font-medium text-white transition-colors"
            >
              <MessageSquare size={18} /> Consultar IA
            </Link>
            <Link 
              href="/perfil" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <UserCircle size={18} /> Meu Perfil
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="px-2">
            <p className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Logado como</p>
            <p className="text-xs text-white truncate font-medium">{emailUsuario || '...'}</p>
          </div>
          <button 
            onClick={sairDoSistema} 
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Buscar Solução</h1>
            <p className="text-xs text-gray-500">Consulte manuais e fluxos utilizando a IA</p>
          </div>
        </header>

        {/* Área do Chat */}
        <section className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto flex flex-col h-full mt-4">
            
            {/* Caixa de Pesquisa */}
            <form onSubmit={handleBuscar} className="relative mb-8">
              <input
                type="text"
                placeholder="Ex: Como configuro o roteador PPPoE?"
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                className="w-full p-4 pr-36 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
              />
              <button
                type="submit"
                disabled={buscando || !pergunta.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-[#059669] hover:bg-[#047857] text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {buscando ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                <span>Buscar</span>
              </button>
            </form>

            {/* Área de Resultados com Animação (Framer Motion) */}
            <div className="flex-1">
              {resultado && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200"
                >
                  {/* Se encontrou uma resposta com alta similaridade */}
                  {resultado.texto ? (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-emerald-50 p-2.5 rounded-xl text-[#059669] shrink-0">
                          <MessageSquare size={24} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resposta Gerada</h3>
                          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                            {resultado.texto}
                          </p>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {resultado.url && (
                          <a
                            href={resultado.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#059669] font-semibold text-xs hover:text-[#047857] hover:underline transition-colors"
                          >
                            <ExternalLink size={16} />
                            Acessar Documento Original
                          </a>
                        )}
                        
                        {resultado.similaridade && (
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md">
                            Confiança: {(resultado.similaridade * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg">
                      <AlertCircle size={20} className="shrink-0" />
                      <p className="text-sm font-medium">
                        {resultado.mensagem || resultado.erro || 'Nenhuma resposta encontrada na base de conhecimento.'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
          </div>
        </section>
      </main>
    </div>
  );
}