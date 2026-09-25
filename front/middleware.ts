import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const rotasPublicas = ['/login', '/cadastro', '/recuperar'];
  const rotasAdmin = ['/painel-adm', '/usuarios', '/biblioteca', '/pendencias', '/relatorio', '/assunto'];
  
  const isRotaPublica = rotasPublicas.includes(pathname);
  const isRotaAdmin = rotasAdmin.some(rota => pathname.startsWith(rota));

  if (!token) {
    if (!isRotaPublica && pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  let isAdministrador = false;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    const tempoAtual = Math.floor(Date.now() / 1000); 
    if (payload.exp && payload.exp < tempoAtual) {
      throw new Error('Token expirado'); 
    }

    let idEncontrado = payload.perfil_id || payload.id_perfil || payload.perfil;


    if (!idEncontrado && Array.isArray(payload.perfis)) {
       if (payload.perfis.includes(1)) {
         idEncontrado = 1;
       }
    }

    isAdministrador = Number(idEncontrado) === 1;

  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('access_token');
    return response;
  }

  if (pathname === '/') {
    const destino = isAdministrador ? '/painel-adm' : '/painel-operador';
    return NextResponse.redirect(new URL(destino, request.url));
  }

  if (isRotaPublica) {
    const destino = isAdministrador ? '/painel-adm' : '/painel-operador';
    return NextResponse.redirect(new URL(destino, request.url));
  }

  if (isRotaAdmin && !isAdministrador) {
    return NextResponse.redirect(new URL('/painel-operador', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|imagem|.*\\.(?:png|jpg|jpeg|svg|gif)).*)',
  ],
};