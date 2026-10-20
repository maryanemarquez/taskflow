import type {Data, Task} from './engine';
export function seedData(now = Date.now()): Data {
  const iso = (days = 0) => new Date(now + days * 86400000).toISOString();
  const usuarios = [
    {id: 1, nome: 'Maria Silva', email: 'maria@exemplo.com', criadoEm: iso(-20)},
    {id: 2, nome: 'João Pereira', email: 'joao@exemplo.com', criadoEm: iso(-18)},
    {id: 3, nome: 'Ana Costa', email: 'ana@exemplo.com', criadoEm: iso(-15)},
    {id: 4, nome: 'Carlos Souza', email: 'carlos@exemplo.com', criadoEm: iso(-12)},
  ];
  const task = (id: number, titulo: string, status: Task['status'], responsavelId: number, prioridade: Task['prioridade'], tags: string[], prazo: string, projetoId = 1, autorId = 1): Task => ({id, titulo, status, responsavelId, prioridade, tags, prazo, projetoId, autorId, descricao: 'Organizar os requisitos e preparar a entrega com a equipe. Revisar os detalhes antes de avançar para a próxima etapa.', criadoEm: iso(-id)});
  const tarefas = [
    task(1, 'Definir a estrutura das páginas', 'PENDENTE_A_INICIAR', 1, 'ALTA', ['planejamento', 'site'], '2026-10-25'),
    task(2, 'Revisar os textos do site', 'PENDENTE_A_INICIAR', 2, 'MEDIA', ['conteúdo'], '2026-10-27'),
    task(3, 'Desenvolver a página inicial', 'EM_DESENVOLVIMENTO', 2, 'ALTA', ['site', 'design'], '2026-10-28'),
    task(4, 'Preparar os componentes de navegação', 'EM_DESENVOLVIMENTO', 1, 'MEDIA', ['design'], '', 1, 2),
    task(5, 'Testar o formulário de contato', 'EM_TESTES', 1, 'MEDIA', ['ação', 'qualidade'], '2026-10-30'),
    task(6, 'Validar a versão para celular', 'EM_TESTES', 2, 'ALTA', ['site', 'qualidade'], '2026-10-29'),
    task(7, 'Organizar os arquivos do projeto', 'FINALIZADO', 1, 'BAIXA', [], '2026-10-17'),
    task(8, 'Aprovar a identidade visual', 'FINALIZADO', 2, 'MEDIA', ['design'], '2026-10-19'),
    task(9, 'Planejar a campanha de lançamento', 'PENDENTE_A_INICIAR', 1, 'ALTA', ['ação', 'urgência'], '2026-11-02', 2),
    task(10, 'Preparar os materiais da campanha', 'EM_DESENVOLVIMENTO', 2, 'MEDIA', ['conteúdo'], '', 2),
  ];
  return {usuarios, workspaces: [{id: 1, nome: 'Workspace de Maria Silva', criadoEm: iso(-20)}], vinculos: usuarios.filter(u => u.id !== 4).map(u => ({usuarioId: u.id, workspaceId: 1, papel: u.id === 1 ? 'PROPRIETARIO' : 'MEMBRO', criadoEm: u.criadoEm})), projetos: [
    {id: 1, nome: 'Lançamento do site', workspaceId: 1, criadoEm: iso(-12)},
    {id: 2, nome: 'Campanha de marketing', workspaceId: 1, criadoEm: iso(-10)},
    {id: 3, nome: 'Backlog técnico', workspaceId: 1, criadoEm: iso(-8)},
  ], tarefas, tags: [...new Set(tarefas.flatMap(t => t.tags))].map((nome, i) => ({id: i + 1, workspaceId: 1, nome})), senhas: {1: 'Taskflow123', 2: 'Taskflow123', 3: 'Taskflow123', 4: 'Taskflow123'}, convites: [
    {id: 1, emailConvidado: 'beatriz@exemplo.com', workspaceId: 1, criadoEm: iso(0), expiraEm: iso(2), utilizado: false, invalidado: false, token: 'novo-usuario'},
    {id: 2, emailConvidado: 'carlos@exemplo.com', workspaceId: 1, criadoEm: iso(0), expiraEm: iso(2), utilizado: false, invalidado: false, token: 'conta-existente'},
    {id: 3, emailConvidado: 'pedro@exemplo.com', workspaceId: 1, criadoEm: iso(-4), expiraEm: iso(-2), utilizado: false, invalidado: false, token: 'expirado'},
    {id: 4, emailConvidado: 'ana@exemplo.com', workspaceId: 1, criadoEm: iso(-10), expiraEm: iso(-8), utilizado: true, invalidado: false, token: 'utilizado'},
    {id: 5, emailConvidado: 'beatriz@exemplo.com', workspaceId: 1, criadoEm: iso(-1), expiraEm: iso(1), utilizado: false, invalidado: true, token: 'invalidado'},
  ], recuperacoes: [{email: 'maria@exemplo.com', token: 'valido', expiraEm: new Date(now + 1800000).toISOString(), utilizado: false, invalidado: false}]};
}
export function extremeData(data: Data): Data {
  const result: Data = JSON.parse(JSON.stringify(data));
  result.projetos.push({id: 4, workspaceId: 1, nome: 'Projeto de integração e organização de todas as entregas da equipe para o lançamento da nova experiência digital '.padEnd(150, 'x').slice(0,150), criadoEm: new Date().toISOString()});
  const first = result.tarefas[0];
  if (first) result.tarefas.push({...first, id: 11, titulo: 'Revisar a documentação completa dos fluxos de trabalho e conferir os requisitos de cada etapa do projeto com todos os responsáveis '.padEnd(200,'x').slice(0,200), descricao: 'Documentação da entrega. '.repeat(220).slice(0,5000), tags: ['ação','urgência','conteúdo','design','site','qualidade','revisão','equipe','entrega','planejamento']});
  return result;
}