'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { sairDoSistema } from '../../lib/auth';
import { 
  Send, Loader2, ExternalLink, AlertCircle,
  Home, MessageSquare, UserCircle, LogOut, Bot, User,
  ThumbsUp, ThumbsDown // 👉 Adicionados ícones de feedback
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chat() {
  const router = useRouter();
  const [emailUsuario, setEmailUsuario] = useState('');
  
  // O estado agora é uma lista de mensagens para formar um chat real
  const [mensagens, setMensagens] = useState([
    { 
      role: 'ia', 
      texto: 'Olá! Sou o LUMORA, o seu assistente de suporte técnico. Como posso ajudar com os manuais e fluxos hoje?' 
    }
  ]);
  const [pergunta, setPergunta] = useState('');
  const [buscando, setBuscando] = useState(false);
  
  // Referência para rolar a tela automaticamente para baixo
  const fimDoChatRef = useRef(null);

  useEffect(() => {
    const email = sessionStorage.getItem('emailUsuarioLogado');
    if (!email) {
      router.push('/login');
      return;
    }
    setEmailUsuario(email);
  }, [router]);

  // Efeito para rolar suavemente para a última mensagem
  useEffect(() => {
    fimDoChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, buscando]);

  async function handleBuscar(e) {
    if (e) e.preventDefault();
    if (!pergunta.trim() || buscando) return;

    const novaPergunta = pergunta;
    setPergunta(''); // Limpa o input imediatamente para melhor UX
    
    // Adiciona a pergunta do utilizador na tela
    setMensagens(prev => [...prev, { role: 'user', texto: novaPergunta }]);
    setBuscando(true);

    try {
      const resp = await fetch('/api/chat/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: novaPergunta }),
        credentials: 'include',
      });

      if (!resp.ok) throw new Error('Erro na busca');

      const data = await resp.json();
      
      // Adiciona a resposta da IA na tela
      if (data.texto) {
        setMensagens(prev => [...prev, { 
          role: 'ia', 
          texto: data.texto, 
          url: data.url, 
          similaridade: data.similaridade,
          id_consulta: data.id_consulta, // 👉 Guarda o ID da consulta
          feedbackDado: false // 👉 Estado de controle
        }]);
      } else {
        setMensagens(prev => [...prev, { 
          role: 'ia', 
          erro: true, 
          texto: data.mensagem || 'Não encontrei informações na base de conhecimento.',
          id_consulta: data.id_consulta, // 👉 Também guarda o ID para pendências
          feedbackDado: false
        }]);
      }
    } catch {
      setMensagens(prev => [...prev, { 
        role: 'ia', 
        erro: true, 
        texto: 'Ocorreu um erro ao conectar com o servidor. Tente novamente.' 
      }]);
    } finally {
      setBuscando(false);
    }
  }

  // 👉 NOVA FUNÇÃO PARA ENVIAR FEEDBACK
  async function handleFeedback(index, id_consulta, util) {
    // Atualiza a UI imediatamente para sensação de tempo real
    setMensagens(prev => {
      const novas = [...prev];
      novas[index] = { ...novas[index], feedbackDado: true };
      return novas;
    });

    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_consulta, util }),
        credentials: 'include',
      });
    } catch (err) {
      console.error("Falha ao registrar feedback", err);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-800">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-[#059669] text-white flex flex-col justify-between p-5 select-none shrink-0 z-20 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <img src="/imagem/logo.png" alt="Logo" className="h-8 w-auto object-contain bg-white/90 p-1 rounded" />
            <div>
              <h2 className="font-bold text-sm tracking-wide leading-none">Suporte IA</h2>
              <span className="text-[10px] text-emerald-200 uppercase font-semibold">Área do Operador</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm">
            <Link href="/painel-operador" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors">
              <Home size={18} /> Página Inicial
            </Link>
            <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/15 font-medium text-white transition-colors shadow-inner">
              <MessageSquare size={18} /> Consultar IA
            </Link>
            <Link href="/perfil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors">
              <UserCircle size={18} /> Meu Perfil
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="px-2">
            <p className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Logado como</p>
            <p className="text-xs text-white truncate font-medium">{emailUsuario || '...'}</p>
          </div>
          <button onClick={sairDoSistema} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors cursor-pointer">
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal do Chat */}
      <main className="flex-1 flex flex-col h-full bg-gray-50">
        
        {/* Header no fluxo normal */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-[#059669]">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Assistente LUMORA</h1>
              <p className="text-[11px] text-gray-500 font-medium">Baseado nos manuais oficiais da empresa</p>
            </div>
          </div>
        </header>

        {/* Área de Mensagens */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-4">
            
            {mensagens.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shadow-sm
                    ${msg.role === 'user' ? 'bg-[#059669] text-white' : 'bg-white border border-gray-200 text-[#059669]'}`}
                  >
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={20} />}
                  </div>

                  {/* Balão de Mensagem */}
                  <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
                    
                    <div className={`p-4 sm:p-5 rounded-2xl shadow-sm text-sm w-full
                      ${msg.role === 'user' 
                        ? 'bg-[#059669] text-white rounded-tr-none' 
                        : msg.erro 
                          ? 'bg-rose-50 border border-rose-100 text-rose-800 rounded-tl-none'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}
                    >
                      {msg.role === 'user' ? (
                        <p className="leading-relaxed">{msg.texto}</p>
                      ) : (
                        <div className={`prose prose-sm max-w-none 
                          ${msg.erro ? 'prose-p:text-rose-800' : 'prose-slate prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-a:text-[#059669] prose-a:no-underline hover:prose-a:underline prose-li:marker:text-[#059669]'}`}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.texto}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* 👉 RODAPÉ DA MENSAGEM: Links, Confiança e Feedback */}
                    {msg.role === 'ia' && (msg.url || msg.similaridade || msg.id_consulta) && (
                      <div className="flex flex-wrap items-center justify-between w-full pl-2 mt-1">
                        
                        <div className="flex items-center gap-3">
                          {msg.url && (
                            <a href={msg.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#059669] font-medium text-[11px] hover:underline">
                              <ExternalLink size={12} /> Acessar Documento
                            </a>
                          )}
                          {msg.similaridade && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-200/60 px-2 py-1 rounded-md">
                              Confiança: {(msg.similaridade * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>

                        {/* 👉 BOTOÕES DE FEEDBACK */}
                        {msg.id_consulta && (
                          <div className="flex items-center gap-2">
                            {msg.feedbackDado ? (
                              <span className="text-[10px] text-gray-400 italic">Obrigado por avaliar!</span>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleFeedback(index, msg.id_consulta, true)}
                                  className="text-gray-400 hover:text-[#059669] transition-colors p-1 cursor-pointer"
                                  title="Resposta Útil"
                                >
                                  <ThumbsUp size={14} />
                                </button>
                                <button 
                                  onClick={() => handleFeedback(index, msg.id_consulta, false)}
                                  className="text-gray-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                                  title="Não Ajudou"
                                >
                                  <ThumbsDown size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            ))}

            {/* Indicador de Digitação (Loading) */}
            {buscando && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start">
                <div className="flex gap-4 max-w-[85%] flex-row">
                  <div className="shrink-0 h-10 w-10 rounded-full bg-white border border-gray-200 text-[#059669] flex items-center justify-center shadow-sm">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-[60px]">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={fimDoChatRef} />
          </div>
        </section>

        {/* Área de Input */}
        <div className="shrink-0 w-full bg-gray-50 pt-2 pb-8 px-4 sm:px-8 border-t border-transparent">
          <form onSubmit={handleBuscar} className="max-w-4xl mx-auto relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex items-end transition-shadow focus-within:shadow-lg focus-within:border-[#059669]/50">
            <textarea
              rows={1}
              placeholder="Pergunte ao LUMORA sobre manuais ou procedimentos..."
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleBuscar(e);
                }
              }}
              className="w-full max-h-32 min-h-[60px] p-4 pr-16 text-sm text-gray-800 bg-transparent resize-none focus:outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={buscando || !pergunta.trim()}
              className="absolute right-2 bottom-2 h-11 w-11 flex items-center justify-center bg-[#059669] hover:bg-[#047857] text-white rounded-xl transition-all disabled:opacity-40 disabled:scale-95 disabled:hover:bg-[#059669] cursor-pointer"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
          <div className="max-w-4xl mx-auto text-center mt-3">
            <p className="text-[10px] text-gray-400">O LUMORA pode cometer erros de interpretação. Verifique os documentos originais quando necessário.</p>
          </div>
        </div>

      </main>
    </div>
  );
}