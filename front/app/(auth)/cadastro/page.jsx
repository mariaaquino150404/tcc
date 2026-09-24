'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function Cadastro() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);

    try {
      const resp = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.detail || 'Erro ao realizar cadastro.');
      }

      setSucesso('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Painel Esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f0f6fa] border-r border-gray-100 flex-col justify-between p-10 xl:p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#103f6b]/15 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#103f6b]/20 rounded-full mix-blend-multiply filter blur-3xl"></div>

        <div className="relative z-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#103f6b] hover:underline"
          >
            <ArrowLeft size={16} /> Voltar para o login
          </Link>
        </div>

        {/* Logo perfeitamente centralizada na área disponível */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <img 
            src="/imagem/logo.png" 
            alt="Logo do Sistema" 
            className="w-64 sm:w-72 h-auto object-contain drop-shadow-sm"
          />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-3 tracking-tight leading-snug">
            Comece a utilizar o Suporte Inteligente.
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Cadastre-se para ter acesso às soluções rápidas e assertivas baseadas na documentação oficial.
          </p>
        </div>
      </div>

      {/* Painel Direito - Formulário Equilibrado */}
      <div className="flex flex-1 items-center justify-center px-6 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#103f6b] hover:underline"
            >
              <ArrowLeft size={16} /> Voltar para o login
            </Link>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Criar nova conta</h2>
            <p className="text-sm text-gray-500 mt-0.5">Preencha os campos para solicitar seu acesso.</p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#103f6b] focus:ring-1 focus:ring-[#103f6b] transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                E-mail corporativo
              </label>
              <input
                type="email"
                placeholder="nome@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#103f6b] focus:ring-1 focus:ring-[#103f6b] transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#103f6b] focus:ring-1 focus:ring-[#103f6b] transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#103f6b] focus:ring-1 focus:ring-[#103f6b] transition-colors shadow-sm"
              />
            </div>

            {erro && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-md border border-red-100 font-medium">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="p-2.5 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 font-medium">
                {sucesso}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#103f6b] hover:bg-[#0c2f50] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-1 cursor-pointer"
            >
              {carregando ? <Loader2 className="animate-spin" size={18} /> : 'Finalizar cadastro'}
            </button>
          </form>

          <div className="mt-5 pt-3.5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#103f6b] hover:underline transition-colors"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}