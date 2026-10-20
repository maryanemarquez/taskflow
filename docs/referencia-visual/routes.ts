export const routes = {
  login: '/login', cadastro: '/cadastro', recuperar: '/recuperar-senha',
  dashboard: '/dashboard', projetos: '/projetos', membros: '/membros',
  configuracoes: '/configuracoes', semWorkspace: '/sem-workspace', estados: '/__estados',
  projeto: (id: number) => `/projetos/${id}`,
  tarefa: (id: number) => `/tarefas/${id}`,
  novaTarefa: (id: number) => `/projetos/${id}/tarefas/nova`,
  editarTarefa: (id: number) => `/tarefas/${id}/editar`,
  convite: (token: string) => `/invite/${token}`,
  redefinir: (token: string) => `/redefinir-senha/${token}`,
};