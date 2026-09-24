'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ModalSessaoExpirada() {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleSessaoExpirada = () => setAberto(true);
    
    window.addEventListener('sessaoExpirada', handleSessaoExpirada);
    
    return () => {
      window.removeEventListener('sessaoExpirada', handleSessaoExpirada);
    };
  }, []);

  const handleOk = () => {
    setAberto(false);
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center transform transition-all">
        <div className="mb-4 text-red-500">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sessão Encerrada</h3>
        <p className="text-gray-600 mb-6">
          O seu tempo de acesso expirou por segurança. Por favor, faça login novamente para continuar.
        </p>
        <button
          onClick={handleOk}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}