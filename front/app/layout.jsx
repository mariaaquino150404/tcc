import './globals.css';
import ModalSessaoExpirada from '../components/layout/ModalSessaoExpirada';
import { Toaster } from 'react-hot-toast'; 

export const metadata = {
  title: 'Suporte Inteligente',
  description: 'Sistema de atendimento e base de conhecimento com IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="text-gray-900 antialiased">
        
        <ModalSessaoExpirada />
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 1500,
            style: {
              borderRadius: '12px',
              background: '#333',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                background: '#059669', 
              },
            },
            error: {
              style: {
                background: '#e11d48', 
              },
            },
          }}
        />
        
        {children}
      </body>
    </html>
  );
}