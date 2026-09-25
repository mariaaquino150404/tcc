'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus, Search, CheckCircle, XCircle, Loader2, X, Shield, 
  User, MoreVertical, AlertTriangle, Key, Trash2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast'; 
import SidebarAdmin from '../../../components/sidebar/sideBarAdmin';

export default function GestaoUsuarios() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroPesquisa, setErroPesquisa] = useState('');
  const [busca, setBusca] = useState('');
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalEditAberto, setModalEditAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmacao, setConfirmacao] = useState({ visivel: false, id_usuario: null });
  const [formNovo, setFormNovo] = useState({ nome: '', email: '', senha: '', id_perfil: 2 });
  const [formEdit, setFormEdit] = useState({ id_usuario: null, nome: '', email: '', id_perfil: 2 });
  const [formExclusao, setFormExclusao] = useState({ id_usuario: null, nome: '', email_admin: '', senha_admin: '' });

  useEffect(() => {
    const email = sessionStorage.getItem('emailUsuarioLogado');
    if (!email) {
      router.push('/login');
      return;
    }
    carregarUsuarios();

    const handleClickFora = () => setMenuAbertoId(null);
    document.addEventListener('click', handleClickFora);
    return () => document.removeEventListener('click', handleClickFora);
  }, [router]);


  async function carregarUsuarios() {
    setCarregando(true);
    setErroPesquisa('');
    try {
      const token = sessionStorage.getItem('token');
      
      const headers = {};
      if (token && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const resp = await fetch('/api/users', {
        headers,
        credentials: 'include'
      });
      
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || 'Não foi possível carregar a lista de usuários.');
      }

      const data = await resp.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setErroPesquisa(err.message);
      toast.error('Erro ao buscar utilizadores.'); 
    } finally {
      setCarregando(false);
    }
  }

  async function alternarStatus(idUsuario, statusAtual) {
    try {
      const token = sessionStorage.getItem('token');
      const resp = await fetch(`/api/users/${idUsuario}/status?status_in=${!statusAtual}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!resp.ok) throw new Error('Falha ao atualizar status do usuário.');
      setUsuarios((prev) =>
        prev.map((u) => (u.id_usuario === idUsuario ? { ...u, status: !statusAtual } : u))
      );
      toast.success(`Conta ${!statusAtual ? 'Ativada' : 'Desativada'} com sucesso!`); 
    } catch (err) {
      toast.error(err.message); // 👉 Toast Erro
    }
  }

  async function handleCriarUsuario(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const resp = await fetch('/api/users/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(formNovo)
      });

      if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro ao criar usuário.');

      setModalNovoAberto(false);
      setFormNovo({ nome: '', email: '', senha: '', id_perfil: 2 });
      carregarUsuarios();
      toast.success('Usuário criado com sucesso!'); 
    } catch (err) {
      toast.error(err.message); 
    } finally {
      setSalvando(false);
    }
  }

  async function handleEditarUsuario(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const resp = await fetch(`/api/users/${formEdit.id_usuario}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ nome: formEdit.nome, email: formEdit.email, id_perfil: formEdit.id_perfil })
      });

      if (!resp.ok) throw new Error((await resp.json()).detail || 'Erro ao atualizar usuário.');

      setModalEditAberto(false);
      carregarUsuarios();
      toast.success('Dados atualizados com sucesso!'); 
    } catch (err) {
      toast.error(err.message); 
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluirUsuario(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const resp = await fetch(`/api/users/${formExclusao.id_usuario}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ email_admin: formExclusao.email_admin, senha_admin: formExclusao.senha_admin })
      });

      if (!resp.ok) throw new Error((await resp.json()).detail || 'Falha na autorização ou exclusão.');

      setModalExclusaoAberto(false);
      setFormExclusao({ id_usuario: null, nome: '', email_admin: '', senha_admin: '' });
      carregarUsuarios();
      toast.success('Usuário excluído permanentemente.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSalvando(false);
    }
  }

  function solicitarResetSenha(idUsuario) {
    setConfirmacao({ visivel: true, id_usuario: idUsuario });
  }

  async function executarResetSenha() {
    const idUsuario = confirmacao.id_usuario;
    setConfirmacao({ visivel: false, id_usuario: null });
    
    try {
      const resp = await fetch(`/api/users/${idUsuario}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const data = await resp.json();
      
      if (!resp.ok) throw new Error(data.detail || 'Erro ao resetar senha.');
      toast.success(data.message || 'Senha resetada para Mudar@123'); 
    } catch (err) {
      toast.error(err.message);
    }
  }

  const abrirModalEdicao = (u) => {
    const isAdmin = u.perfis?.some((p) => p.id_perfil === 1 || p.nome === 'Administrador');
    setFormEdit({ id_usuario: u.id_usuario, nome: u.nome, email: u.email, id_perfil: isAdmin ? 1 : 2 });
    setModalEditAberto(true);
  };

  const abrirModalExclusao = (u) => {
    const emailLogado = sessionStorage.getItem('emailUsuarioLogado');
    setFormExclusao({ id_usuario: u.id_usuario, nome: u.nome, email_admin: emailLogado, senha_admin: '' });
    setModalExclusaoAberto(true);
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );
  const inputEstilo = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#103f6b]/20 focus:border-[#103f6b] transition-all duration-200";

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-gray-800 font-sans selection:bg-[#103f6b]/20">
      
      <SidebarAdmin />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Gestão de Usuários</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Controle de acessos e permissões do sistema</p>
          </div>

          <button
            onClick={() => setModalNovoAberto(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#103f6b] hover:bg-[#0c2f50] text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
          >
            <UserPlus size={18} strokeWidth={2.5} /> Novo Usuário
          </button>
        </header>
        <section className="flex-1 p-10 overflow-y-auto space-y-6">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-[#103f6b]/10 focus-within:border-[#103f6b]/30 transition-all max-w-2xl">
            <div className="pl-3 text-gray-400">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Buscar usuário por nome ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            />
            {busca && (
              <button onClick={() => setBusca('')} className="pr-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-visible">
            {carregando ? (
              <div className="py-32 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 size={28} className="animate-spin text-[#103f6b]" />
                <span className="text-sm font-medium">Sincronizando usuários...</span>
              </div>
            ) : erroPesquisa ? (
              <div className="py-20 text-center text-rose-500 text-sm font-medium bg-rose-50/50 rounded-b-3xl flex items-center justify-center gap-2">
                 <AlertCircle size={20}/> {erroPesquisa}
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="py-24 text-center text-gray-400 text-sm font-medium flex flex-col items-center gap-3">
                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Search size={24} className="text-gray-300" />
                </div>
                Nenhum usuário encontrado na pesquisa.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Usuário</th>
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-1/3">E-mail Corporativo</th>
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Nível de Acesso</th>
                      <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                      <th className="py-4 px-8 text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {usuariosFiltrados.map((u) => {
                      const isAdmin = u.perfis?.some((p) => p.id_perfil === 1 || p.nome === 'Administrador');
                      const menuVisivel = menuAbertoId === u.id_usuario;

                      return (
                        <tr key={u.id_usuario} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="py-4 px-8">
                            <span className="font-semibold text-gray-900 group-hover:text-[#103f6b] transition-colors">{u.nome}</span>
                          </td>
                          <td className="py-4 px-8 text-gray-500 font-medium">{u.email}</td>

                          <td className="py-4 px-8 text-center">
                            <span
                              className={`inline-flex items-center justify-center gap-1.5 w-[135px] py-1.5 rounded-xl text-xs font-bold border ${
                                isAdmin ? 'bg-indigo-50/80 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-600 border-slate-200/60'
                              }`}
                            >
                              {isAdmin ? <Shield size={14} strokeWidth={2.5} /> : <User size={14} strokeWidth={2.5} />}
                              {isAdmin ? 'Administrador' : 'Operador'}
                            </span>
                          </td>

                          <td className="py-4 px-8 text-center">
                            <button
                              onClick={() => alternarStatus(u.id_usuario, u.status !== false)}
                              className={`inline-flex items-center justify-center gap-1.5 w-[100px] py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:shadow-sm ${
                                u.status !== false ? 'border-emerald-100 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100' : 'border-rose-100 bg-rose-50/80 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              {u.status !== false ? <CheckCircle size={14} strokeWidth={2.5} /> : <XCircle size={14} strokeWidth={2.5} />}
                              {u.status !== false ? 'Ativo' : 'Inativo'}
                            </button>
                          </td>

                          <td className="py-4 px-8 text-center relative">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
                                  setMenuAbertoId(menuVisivel ? null : u.id_usuario);
                                }}
                                className={`p-2 rounded-xl transition-all cursor-pointer ${menuVisivel ? 'bg-[#103f6b] text-white shadow-md' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`}
                              >
                                <MoreVertical size={18} strokeWidth={2.5} />
                              </button>

                              {menuVisivel && (
                                <div 
                                  className="absolute right-full top-0 mr-3 w-36 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-[999] animate-in fade-in zoom-in-95 origin-top-right"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
                                  }}
                                >
                                  <button onClick={() => { setMenuAbertoId(null); abrirModalEdicao(u); }} className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#103f6b] transition-colors cursor-pointer">
                                    Editar Conta
                                  </button>
                                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                  <button onClick={() => { setMenuAbertoId(null); abrirModalExclusao(u); }} className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {modalNovoAberto && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[50] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-gray-100">
              <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Novo Usuário</h3>
              <button onClick={() => setModalNovoAberto(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all cursor-pointer"><X size={20} strokeWidth={2.5} /></button>
            </div>
            <form onSubmit={handleCriarUsuario} className="space-y-5">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Nome Completo</label><input type="text" required placeholder="Ex: Maria Silva" value={formNovo.nome} onChange={(e) => setFormNovo({ ...formNovo, nome: e.target.value })} className={inputEstilo} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">E-mail Corporativo</label><input type="email" required placeholder="maria@empresa.com" value={formNovo.email} onChange={(e) => setFormNovo({ ...formNovo, email: e.target.value })} className={inputEstilo} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Senha Provisória</label><input type="password" required placeholder="••••••••" value={formNovo.senha} onChange={(e) => setFormNovo({ ...formNovo, senha: e.target.value })} className={inputEstilo} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Perfil de Acesso</label><select value={formNovo.id_perfil} onChange={(e) => setFormNovo({ ...formNovo, id_perfil: Number(e.target.value) })} className={`${inputEstilo} cursor-pointer`}><option value={2}>Operador (Padrão)</option><option value={1}>Administrador (Total)</option></select></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setModalNovoAberto(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors cursor-pointer">Cancelar</button><button type="submit" disabled={salvando} className="flex-1 py-3 bg-[#103f6b] hover:bg-[#0c2f50] shadow-md text-white font-bold rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer transition-all">{salvando ? <Loader2 size={18} className="animate-spin" /> : 'Cadastrar Usuário'}</button></div>
            </form>
          </div>
        </div>
      )}

      {modalEditAberto && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[50] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-gray-100">
              <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Editar Usuário</h3>
              <button onClick={() => setModalEditAberto(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all cursor-pointer"><X size={20} strokeWidth={2.5} /></button>
            </div>
            
            <form onSubmit={handleEditarUsuario} className="space-y-5">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Nome Completo</label><input type="text" required value={formEdit.nome} onChange={(e) => setFormEdit({ ...formEdit, nome: e.target.value })} className={inputEstilo} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">E-mail Corporativo</label><input type="email" required value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} className={inputEstilo} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Perfil de Acesso</label><select value={formEdit.id_perfil} onChange={(e) => setFormEdit({ ...formEdit, id_perfil: Number(e.target.value) })} className={`${inputEstilo} cursor-pointer`}><option value={2}>Operador (Padrão)</option><option value={1}>Administrador (Total)</option></select></div>
              
              <div className="pt-2">
                <button type="button" onClick={() => solicitarResetSenha(formEdit.id_usuario)} className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                  <Key size={16} strokeWidth={2.5} /> Redefinir Senha (Mudar@123)
                </button>
              </div>

              <div className="flex gap-3 pt-5 mt-2 border-t border-gray-100"><button type="button" onClick={() => setModalEditAberto(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors cursor-pointer">Cancelar</button><button type="submit" disabled={salvando} className="flex-1 py-3 bg-[#103f6b] hover:bg-[#0c2f50] shadow-md text-white font-bold rounded-xl text-sm disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer transition-all">{salvando ? <Loader2 size={18} className="animate-spin" /> : 'Salvar Alterações'}</button></div>
            </form>
          </div>
        </div>
      )}
      {modalExclusaoAberto && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[50] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border-t-8 border-rose-500 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center mb-7">
              <div className="bg-rose-100 p-4 rounded-full text-rose-500 mb-4"><AlertTriangle size={32} strokeWidth={2.5} /></div>
              <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Excluir "{formExclusao.nome}"?</h3>
              <p className="text-sm text-gray-500 mt-2 px-2 font-medium">Essa ação é irreversível. Insira sua senha de administrador para confirmar.</p>
            </div>
            
            <form onSubmit={handleExcluirUsuario} className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Seu E-mail (Admin)</label><input type="email" required readOnly value={formExclusao.email_admin} className="w-full px-4 py-2.5 bg-gray-100 border border-transparent text-gray-500 rounded-xl text-sm cursor-not-allowed outline-none font-medium" /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Sua Senha</label><input type="password" required autoFocus placeholder="Digite sua senha..." value={formExclusao.senha_admin} onChange={(e) => setFormExclusao({ ...formExclusao, senha_admin: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200" /></div>
              <div className="flex gap-3 pt-5"><button type="button" onClick={() => setModalExclusaoAberto(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors cursor-pointer">Cancelar</button><button type="submit" disabled={salvando} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 shadow-md text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">{salvando ? <Loader2 size={18} className="animate-spin" /> : <><Trash2 size={18} strokeWidth={2.5}/> Excluir Conta</>}</button></div>
            </form>
          </div>
        </div>
      )}
      {confirmacao.visivel && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in-95">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-5 bg-amber-100 text-amber-600">
              <Key size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">Redefinir Senha?</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">A senha deste usuário será alterada imediatamente para <strong className="text-gray-700">Mudar@123</strong>.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmacao({ visivel: false, id_usuario: null })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={executarResetSenha} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 shadow-md text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                Sim, Redefinir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}