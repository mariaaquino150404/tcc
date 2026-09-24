import './globals.css';

export const metadata = {
  title: 'Suporte Inteligente',
  description: 'Sistema de atendimento e base de conhecimento com IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}