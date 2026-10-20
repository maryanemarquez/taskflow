export const statuses = ['PENDENTE_A_INICIAR', 'EM_DESENVOLVIMENTO', 'EM_TESTES', 'FINALIZADO'] as const;
export type Status = typeof statuses[number];
export type Role = 'PROPRIETARIO' | 'MEMBRO';
export type Priority = 'BAIXA' | 'MEDIA' | 'ALTA';
export const statusLabels: Record<Status, string> = { PENDENTE_A_INICIAR: 'Pendente a iniciar', EM_DESENVOLVIMENTO: 'Em desenvolvimento', EM_TESTES: 'Em testes', FINALIZADO: 'Finalizado' };
export const priorityLabels: Record<Priority, string> = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta' };
export interface User { id: number; nome: string; email: string; criadoEm: string; }
export interface Workspace { id: number; nome: string; criadoEm: string; }
export interface Membership { usuarioId: number; workspaceId: number; papel: Role; criadoEm: string; }
export interface Project { id: number; nome: string; workspaceId: number; criadoEm: string; }
export interface Task { id: number; titulo: string; descricao: string; prioridade: Priority; status: Status; prazo: string; projetoId: number; responsavelId: number; autorId: number; criadoEm: string; tags: string[]; }
export interface Invite { id: number; emailConvidado: string; workspaceId: number; criadoEm: string; expiraEm: string; utilizado: boolean; invalidado: boolean; token: string; }
export interface Reset { email: string; token: string; expiraEm: string; utilizado: boolean; invalidado: boolean; }
export interface Data { usuarios: User[]; workspaces: Workspace[]; vinculos: Membership[]; projetos: Project[]; tarefas: Task[]; tags: {id: number; workspaceId: number; nome: string}[]; convites: Invite[]; recuperacoes: Reset[]; senhas: Record<number, string>; }
export interface Filters { responsavelId?: string; status?: string; tag?: string; prazoDe?: string; prazoAte?: string; }
export interface TaskInput { titulo: string; descricao: string; prioridade?: Priority; prazo: string; tags: string[]; responsavelId: number; }
export class MockError extends Error {
  constructor(public codigo: string, public status: number, message: string, public campo = '') { super(message); }
}
export const normalize = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export const emailValue = (value: string) => value.trim().toLowerCase();
export const membership = (data: Data, id: number | null) => data.vinculos.find(v => v.usuarioId === id);
export const canEdit = (task: Task, userId: number, role: Role) => role === 'PROPRIETARIO' || task.autorId === userId || task.responsavelId === userId;
export const canMove = (task: Task, userId: number, role: Role) => role === 'PROPRIETARIO' || task.responsavelId === userId;
export const calendarDate = (value: string) => value ? value.split('-').reverse().join('/') : 'Sem prazo';
export const timestamp = (value: string) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
export function textCheck(value: string, max: number, campo: string, required = true) {
  const text = value.trim();
  if (required && !text) throw new MockError('VALIDACAO', 400, 'Este campo é obrigatório.', campo);
  if (text.length > max) throw new MockError('VALIDACAO', 400, `Use no máximo ${max} caracteres.`, campo);
  return text;
}
export function emailCheck(value: string) {
  const email = textCheck(value, 150, 'email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new MockError('VALIDACAO', 400, 'Informe um e-mail válido.', 'email');
  return emailValue(email);
}
export function passwordCheck(value: string, campo = 'senha') {
  if (new TextEncoder().encode(value).length > 72) throw new MockError('VALIDACAO', 400, 'A senha é muito longa (máximo de 72 bytes).', campo);
  if (value.length < 8 || !/\p{L}/u.test(value) || !/[0-9]/.test(value)) throw new MockError('VALIDACAO', 400, 'A senha precisa ter ao menos 8 caracteres, com letra e número.', campo);
}
export function taskCheck(input: TaskInput) {
  textCheck(input.titulo, 200, 'titulo');
  if (input.descricao.length > 5000) throw new MockError('VALIDACAO', 400, 'Use no máximo 5000 caracteres.', 'descricao');
  if (input.tags.length > 10) throw new MockError('VALIDACAO', 400, 'Use no máximo 10 tags.', 'tags');
  input.tags.forEach(tag => textCheck(tag, 50, 'tags'));
  if (input.prazo && (!/^\d{4}-\d{2}-\d{2}$/.test(input.prazo) || !Number.isFinite(Date.parse(input.prazo)) || new Date(input.prazo).toISOString().slice(0, 10) !== input.prazo)) throw new MockError('VALIDACAO', 400, 'Informe uma data válida.', 'prazo');
}
export function filterTasks(tasks: Task[], filters: Filters) {
  return tasks.filter(t => (!filters.responsavelId || t.responsavelId === Number(filters.responsavelId)) && (!filters.status || t.status === filters.status) && (!filters.tag || t.tags.some(tag => normalize(tag) === normalize(filters.tag ?? ''))) && (!filters.prazoDe || (Boolean(t.prazo) && t.prazo >= filters.prazoDe)) && (!filters.prazoAte || (Boolean(t.prazo) && t.prazo <= filters.prazoAte)));
}
export function counts(tasks: Task[]) { return Object.fromEntries(statuses.map(s => [s, tasks.filter(t => t.status === s).length])) as Record<Status, number>; }
export function search(data: Data, workspaceId: number, query: string) {
  const q = normalize(query);
  const projects = data.projetos.filter(p => p.workspaceId === workspaceId);
  return { projetos: q ? projects.filter(p => normalize(p.nome).includes(q)) : [], tarefas: q ? data.tarefas.filter(t => projects.some(p => p.id === t.projetoId) && (normalize(t.titulo).includes(q) || t.tags.some(tag => normalize(tag).includes(q)) || projects.some(p => p.id === t.projetoId && normalize(p.nome).includes(q)))) : [] };
}
const nextId = (items: {id: number}[]) => Math.max(0, ...items.map(i => i.id)) + 1;
const clone = (data: Data): Data => JSON.parse(JSON.stringify(data));
export function requireWorkspace(data: Data, userId: number) {
  const link = membership(data, userId);
  if (!link) throw new MockError('SEM_WORKSPACE', 403, 'Você não faz parte de nenhum workspace.');
  return link;
}
function owner(data: Data, userId: number) {
  const link = requireWorkspace(data, userId);
  if (link.papel !== 'PROPRIETARIO') throw new MockError('ACESSO_NEGADO', 403, 'Você não tem permissão para esta ação.');
  return link;
}
function projectFor(data: Data, userId: number, projectId: number) {
  const link = requireWorkspace(data, userId);
  const project = data.projetos.find(p => p.id === projectId && p.workspaceId === link.workspaceId);
  if (!project) throw new MockError('RECURSO_NAO_ENCONTRADO', 404, 'Projeto não encontrado.');
  return {link, project};
}
function taskFor(data: Data, userId: number, taskId: number) {
  const task = data.tarefas.find(t => t.id === taskId);
  if (!task) throw new MockError('RECURSO_NAO_ENCONTRADO', 404, 'Tarefa não encontrada.');
  const {link} = projectFor(data, userId, task.projetoId);
  return {task, link};
}
export function signup(data: Data, nome: string, email: string, senha: string, now = Date.now()) {
  nome = textCheck(nome, 100, 'nome'); email = emailCheck(email); passwordCheck(senha);
  if (data.usuarios.some(u => u.email === email)) throw new MockError('EMAIL_JA_CADASTRADO', 409, 'Este e-mail já está cadastrado.', 'email');
  const result = clone(data); const id = nextId(result.usuarios); const workspaceId = nextId(result.workspaces); const criadoEm = new Date(now).toISOString();
  result.usuarios.push({id, nome, email, criadoEm}); result.senhas[id] = senha;
  result.workspaces.push({id: workspaceId, nome: `Workspace de ${nome}`, criadoEm}); result.vinculos.push({usuarioId: id, workspaceId, papel: 'PROPRIETARIO', criadoEm});
  return {data: result, userId: id};
}
export function login(data: Data, email: string, senha: string) {
  email = emailCheck(email); const user = data.usuarios.find(u => u.email === email);
  if (!user || data.senhas[user.id] !== senha) throw new MockError('CREDENCIAIS_INVALIDAS', 401, 'E-mail ou senha incorretos.');
  return user.id;
}
export function saveProject(data: Data, userId: number, nome: string, projectId?: number) {
  if (projectId) projectFor(data, userId, projectId);
  const link = owner(data, userId); nome = textCheck(nome, 150, 'nome'); const result = clone(data);
  if (projectId) result.projetos = result.projetos.map(p => p.id === projectId ? {...p, nome} : p);
  else result.projetos.unshift({id: nextId(result.projetos), nome, workspaceId: link.workspaceId, criadoEm: new Date().toISOString()});
  return result;
}
export function deleteProject(data: Data, userId: number, projectId: number) {
  projectFor(data, userId, projectId); owner(data, userId); const result = clone(data);
  result.projetos = result.projetos.filter(p => p.id !== projectId); result.tarefas = result.tarefas.filter(t => t.projetoId !== projectId); return result;
}
function reuseTags(data: Data, workspaceId: number, values: string[]) {
  return [...new Set(values.map(value => {
    const found = data.tags.find(t => t.workspaceId === workspaceId && normalize(t.nome) === normalize(value));
    if (found) return found.nome;
    const nome = value.trim().toLowerCase(); data.tags.push({id: nextId(data.tags), workspaceId, nome}); return nome;
  }))];
}
export function saveTask(data: Data, userId: number, projectId: number, input: TaskInput, taskId?: number) {
  const {link} = projectFor(data, userId, projectId); const existing = taskId ? taskFor(data, userId, taskId).task : undefined;
  if (existing && existing.projetoId !== projectId) throw new MockError('RECURSO_NAO_ENCONTRADO', 404, 'Tarefa não encontrada neste projeto.');
  if (existing && !canEdit(existing, userId, link.papel)) throw new MockError('ACESSO_NEGADO', 403, 'Você não tem permissão para editar esta tarefa.');
  taskCheck(input); const result = clone(data); const responsavelId = existing?.responsavelId ?? (link.papel === 'MEMBRO' ? userId : input.responsavelId);
  if (!result.vinculos.some(v => v.usuarioId === responsavelId && v.workspaceId === link.workspaceId)) throw new MockError('VALIDACAO', 400, 'Escolha um responsável do workspace.', 'responsavelId');
  const fields = {titulo: input.titulo.trim(), descricao: input.descricao, prioridade: input.prioridade ?? 'MEDIA' as Priority, prazo: input.prazo, tags: reuseTags(result, link.workspaceId, input.tags)};
  if (existing) result.tarefas = result.tarefas.map(t => t.id === existing.id ? {...t, ...fields} : t);
  else result.tarefas.unshift({id: nextId(result.tarefas), ...fields, projetoId: projectId, responsavelId, autorId: userId, status: 'PENDENTE_A_INICIAR', criadoEm: new Date().toISOString()});
  return result;
}
export function moveTask(data: Data, userId: number, taskId: number, status: Status) {
  const {task, link} = taskFor(data, userId, taskId);
  if (!canMove(task, userId, link.papel)) throw new MockError('ACESSO_NEGADO', 403, 'Você não tem permissão para alterar este status.');
  if (!statuses.includes(status) || Math.abs(statuses.indexOf(status) - statuses.indexOf(task.status)) !== 1) throw new MockError('TRANSICAO_STATUS_INVALIDA', 422, 'Mude um estágio por vez.');
  const result = clone(data); result.tarefas = result.tarefas.map(t => t.id === taskId ? {...t, status} : t); return result;
}
export function deleteTask(data: Data, userId: number, taskId: number) { taskFor(data, userId, taskId); owner(data, userId); const result = clone(data); result.tarefas = result.tarefas.filter(t => t.id !== taskId); return result; }
export function assignTask(data: Data, userId: number, taskId: number, responsavelId: number) {
  taskFor(data, userId, taskId); const link = owner(data, userId);
  if (!data.vinculos.some(v => v.usuarioId === responsavelId && v.workspaceId === link.workspaceId)) throw new MockError('VALIDACAO', 400, 'Escolha um responsável do workspace.', 'responsavelId');
  const result = clone(data); result.tarefas = result.tarefas.map(t => t.id === taskId ? {...t, responsavelId} : t); return result;
}
export function removeMember(data: Data, userId: number, memberId: number, responsavelId?: number) {
  const link = owner(data, userId); const target = data.vinculos.find(v => v.usuarioId === memberId && v.workspaceId === link.workspaceId);
  if (!target) throw new MockError('RECURSO_NAO_ENCONTRADO', 404, 'Membro não encontrado.');
  if (target.papel === 'PROPRIETARIO') throw new MockError('PROPRIETARIO_NAO_REMOVIVEL', 422, 'O Proprietário não pode ser removido.');
  const projectIds = data.projetos.filter(p => p.workspaceId === link.workspaceId).map(p => p.id);
  const tasks = data.tarefas.filter(t => t.responsavelId === memberId && projectIds.includes(t.projetoId));
  if (tasks.length && (!responsavelId || responsavelId === memberId || !data.vinculos.some(v => v.usuarioId === responsavelId && v.workspaceId === link.workspaceId))) throw new MockError('REATRIBUICAO_OBRIGATORIA', 422, 'Escolha o novo responsável.', 'responsavelId');
  const result = clone(data); result.vinculos = result.vinculos.filter(v => v.usuarioId !== memberId);
  result.tarefas = result.tarefas.map(t => tasks.some(item => item.id === t.id) && responsavelId ? {...t, responsavelId} : t); return result;
}
export function createInvite(data: Data, userId: number, email: string, now = Date.now()) {
  const link = owner(data, userId); email = emailCheck(email); const user = data.usuarios.find(u => u.email === email);
  if (user && membership(data, user.id)) throw new MockError('USUARIO_JA_PERTENCE_A_WORKSPACE', 422, 'Este usuário já pertence a um workspace.', 'email');
  const result = clone(data); result.convites.forEach(i => {if (i.workspaceId === link.workspaceId && i.emailConvidado === email && !i.utilizado) i.invalidado = true;});
  result.convites.unshift({id: nextId(result.convites), emailConvidado: email, workspaceId: link.workspaceId, criadoEm: new Date(now).toISOString(), expiraEm: new Date(now + 2 * 86400000).toISOString(), utilizado: false, invalidado: false, token: crypto.randomUUID()}); return result;
}
export function validateInvite(data: Data, token: string, now = Date.now()) {
  const invite = data.convites.find(i => i.token === token);
  if (!invite || invite.utilizado || invite.invalidado || Date.parse(invite.expiraEm) <= now) throw new MockError('CONVITE_INVALIDO', 422, 'Este convite expirou');
  const user = data.usuarios.find(u => u.email === invite.emailConvidado);
  if (user && membership(data, user.id)) throw new MockError('CONVITE_INVALIDO', 422, 'Este convite expirou');
  return {invite, emailConvidado: invite.emailConvidado, workspaceNome: data.workspaces.find(w => w.id === invite.workspaceId)?.nome ?? '', contaExiste: Boolean(user)};
}
export function acceptInvite(data: Data, token: string, nome: string, senha: string, now = Date.now()) {
  const {invite} = validateInvite(data, token, now); const existing = data.usuarios.find(u => u.email === invite.emailConvidado);
  if (existing) login(data, invite.emailConvidado, senha); else {nome = textCheck(nome, 100, 'nome'); passwordCheck(senha);}
  const result = clone(data); const userId = existing?.id ?? nextId(result.usuarios); const criadoEm = new Date(now).toISOString();
  if (!existing) {result.usuarios.push({id: userId, nome, email: invite.emailConvidado, criadoEm}); result.senhas[userId] = senha;}
  result.vinculos.push({usuarioId: userId, workspaceId: invite.workspaceId, papel: 'MEMBRO', criadoEm});
  const used = result.convites.find(i => i.id === invite.id); if (used) used.utilizado = true; return {data: result, userId};
}
export const recoveryMessage = 'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.';
export function requestRecovery(data: Data, email: string, now = Date.now()) {
  email = emailCheck(email); const result = clone(data);
  if (result.usuarios.some(u => u.email === email)) {result.recuperacoes.forEach(r => {if (r.email === email && !r.utilizado) r.invalidado = true;}); result.recuperacoes.unshift({email, token: crypto.randomUUID(), expiraEm: new Date(now + 1800000).toISOString(), utilizado: false, invalidado: false});}
  return {data: result, message: recoveryMessage};
}
export function validReset(data: Data, token: string, now = Date.now()) { return data.recuperacoes.find(r => r.token === token && !r.utilizado && !r.invalidado && Date.parse(r.expiraEm) > now); }
export function resetPassword(data: Data, token: string, senha: string, confirmation: string, now = Date.now()) {
  const reset = validReset(data, token, now); if (!reset) throw new MockError('TOKEN_RECUPERACAO_INVALIDO', 422, 'Este link não é mais válido.');
  passwordCheck(senha); if (senha !== confirmation) throw new MockError('VALIDACAO', 400, 'A confirmação não coincide com a senha.', 'confirmacao');
  const result = clone(data); const user = result.usuarios.find(u => u.email === reset.email); if (user) result.senhas[user.id] = senha;
  const used = result.recuperacoes.find(r => r.token === token); if (used) used.utilizado = true; return result;
}
export function saveProfile(data: Data, userId: number, nome: string) { nome = textCheck(nome, 100, 'nome'); const result = clone(data); result.usuarios = result.usuarios.map(u => u.id === userId ? {...u, nome} : u); return result; }
export function changePassword(data: Data, userId: number, atual: string, senha: string, confirmation: string) {
  if (data.senhas[userId] !== atual) throw new MockError('SENHA_ATUAL_INCORRETA', 422, 'A senha atual está incorreta.', 'atual');
  passwordCheck(senha); if (senha !== confirmation) throw new MockError('VALIDACAO', 400, 'A confirmação não coincide com a senha.', 'confirmacao');
  const result = clone(data); result.senhas[userId] = senha; return result;
}