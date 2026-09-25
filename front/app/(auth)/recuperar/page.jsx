'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleRecuperar(e) {
    e.preventDefault();
    setCarregando(true);

    try {
      const resp = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.detail || 'Não foi possível processar a solicitação.');
      }

      toast.success('Instruções enviadas para o seu e-mail!'); 
      setSucesso(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
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
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <img 
            src="/imagem/logo.png" 
            alt="Logo do Sistema" 
            className="w-64 sm:w-72 h-auto object-contain drop-shadow-sm"
          />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-3 tracking-tight leading-snug">
            Recuperação de acesso simples e segura.
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Informe o e-mail cadastrado na plataforma para receber as instruções de redefinição de credenciais.
          </p>
        </div>
      </div>

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

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Redefinir senha</h2>
            <p className="text-sm text-gray-500 mt-1">
              {sucesso
                ? 'Instruções enviadas com sucesso.'
                : 'Digite seu e-mail corporativo cadastrado.'}
            </p>
          </div>

          {sucesso ? (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 leading-relaxed">
                  Enviamos as orientações de redefinição para <strong>{email}</strong>. Verifique sua caixa de entrada e a pasta de spam.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full flex items-center justify-center py-2.5 bg-[#103f6b] hover:bg-[#0c2f50] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-4">
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

              <button
                type="submit"
                disabled={carregando}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#103f6b] hover:bg-[#0c2f50] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {carregando ? <Loader2 className="animate-spin" size={18} /> : 'Enviar instruções'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Lembrou a senha?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#103f6b] hover:underline transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}