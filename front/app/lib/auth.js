export async function sairDoSistema() {
  sessionStorage.clear();

  try {
    await fetch('/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    });
  } catch (error) {
    console.warn("Falha na comunicação de logout com a API.");
  }
  window.location.href = '/login';
}