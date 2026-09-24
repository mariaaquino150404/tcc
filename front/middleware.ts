import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const rotasPublicas = ['/login', '/cadastro', '/recuperar'];
  const isRotaPublica = rotasPublicas.includes(pathname);

  if (!token && !isRotaPublica && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }



  if (pathname === '/') {
    const destino = token ? '/painel-operador' : '/login';
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|imagem|.*\\.(?:png|jpg|jpeg|svg|gif)).*)',
  ],
};