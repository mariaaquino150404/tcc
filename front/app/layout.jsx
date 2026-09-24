import './globals.css';
import ModalSessaoExpirada from '../components/layout/ModalSessaoExpirada';

export const metadata = {
  title: 'Suporte Inteligente',
  description: 'Sistema de atendimento e base de conhecimento com IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="text-gray-900 antialiased">
        <ModalSessaoExpirada />
        
        {children}
      </body>
    </html>
  );
}