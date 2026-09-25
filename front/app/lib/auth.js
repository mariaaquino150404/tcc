import { apiFetch } from './api';

export async function sairDoSistema() {
  sessionStorage.clear();
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.warn("Falha na comunicação de logout com a API.", error);
  }
  
  window.location.href = '/login';
}