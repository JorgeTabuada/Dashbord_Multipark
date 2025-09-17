export type UserRole = "super_admin" | "admin" | "supervisor" | "back_office" | "tesoureiro" | "team_leader"

export interface AppPermission {
  id: string
  name: string
  route: string
  section: string
  allowedRoles: UserRole[]
}

export const appPermissions: AppPermission[] = [
  // Operacional
  {
    id: "caixa",
    name: "Caixa Multipark",
    route: "/caixa",
    section: "Operacional",
    allowedRoles: ["super_admin", "admin", "tesoureiro"],
  },
  {
    id: "cancelamentos",
    name: "Cancelamentos",
    route: "/cancelamentos",
    section: "Operacional",
    allowedRoles: ["super_admin", "admin", "supervisor", "back_office"],
  },
  {
    id: "confirmacao-caixa",
    name: "Confirmação de Caixa",
    route: "/confirmacao-caixa",
    section: "Operacional",
    allowedRoles: ["super_admin", "admin", "tesoureiro"],
  },
  {
    id: "entregas",
    name: "Entregas",
    route: "/entregas",
    section: "Operacional",
    allowedRoles: ["super_admin", "admin", "supervisor", "team_leader"],
  },
  {
    id: "recolhas",
    name: "Recolhas",
    route: "/recolhas",
    section: "Operacional",
    allowedRoles: ["super_admin", "admin", "supervisor", "team_leader"],
  },
  {
    id: "mapa-ocupacao",
    name: "Mapa de Ocupação",
    route: "/mapa-ocupacao",
    section: "Análise",
    allowedRoles: ["super_admin", "admin", "supervisor", "back_office"],
  },
  {
    id: "reservas",
    name: "Reservas",
    route: "/reservas",
    section: "Operacional",
    allowedRoles: ["super_admin", "admin", "supervisor", "back_office"],
  },

  // Gestão
  { id: "despesas", name: "Despesas", route: "/despesas", section: "Gestão", allowedRoles: ["super_admin", "admin"] },
  {
    id: "faturacao",
    name: "Faturação",
    route: "/faturacao",
    section: "Gestão",
    allowedRoles: ["super_admin", "admin", "back_office"],
  },
  {
    id: "recursos-humanos",
    name: "Recursos Humanos",
    route: "/recursos-humanos",
    section: "Gestão",
    allowedRoles: ["super_admin", "admin"],
  },
  {
    id: "fecho-caixa",
    name: "Fecho de Caixa",
    route: "/fecho-caixa",
    section: "Gestão",
    allowedRoles: ["super_admin", "admin", "tesoureiro"],
  },
  {
    id: "projetos",
    name: "Projetos",
    route: "/projetos",
    section: "Gestão",
    allowedRoles: ["super_admin", "admin", "supervisor"],
  },
  {
    id: "tarefas",
    name: "Tarefas",
    route: "/tarefas",
    section: "Gestão",
    allowedRoles: ["super_admin", "admin", "supervisor", "team_leader"],
  },

  // Administração e Suporte
  {
    id: "acessos-alteracoes",
    name: "Acessos e Alterações",
    route: "/acessos-alteracoes",
    section: "Administração e Suporte",
    allowedRoles: ["super_admin", "admin"],
  },
  {
    id: "auditorias-internas",
    name: "Auditorias Internas",
    route: "/auditorias-internas",
    section: "Administração e Suporte",
    allowedRoles: ["super_admin", "admin", "supervisor"],
  },
  {
    id: "comentarios-reclamacoes",
    name: "Comentários & Reclamações",
    route: "/comentarios-reclamacoes",
    section: "Administração e Suporte",
    allowedRoles: ["super_admin", "admin", "supervisor", "back_office"],
  },
  {
    id: "formacao-apoio",
    name: "Formação & Apoio",
    route: "/formacao-apoio",
    section: "Administração e Suporte",
    allowedRoles: ["super_admin", "admin", "supervisor", "back_office", "tesoureiro", "team_leader"],
  },
  {
    id: "perdidos-achados",
    name: "Perdidos & Achados",
    route: "/perdidos-achados",
    section: "Administração e Suporte",
    allowedRoles: ["super_admin", "admin", "supervisor", "team_leader"],
  },

  // Análises
  {
    id: "bi-interno",
    name: "BI Interno",
    route: "/bi-interno",
    section: "Análises",
    allowedRoles: ["super_admin", "admin", "supervisor"],
  },
  {
    id: "comportamentos",
    name: "Comportamentos",
    route: "/comportamentos",
    section: "Análises",
    allowedRoles: ["super_admin", "admin", "supervisor"],
  },
  {
    id: "mapa-ocupacao",
    name: "Mapa de Ocupação",
    route: "/mapa-ocupacao",
    section: "Análises",
    allowedRoles: ["super_admin", "admin", "supervisor"],
  },
  {
    id: "marketing",
    name: "Marketing",
    route: "/marketing",
    section: "Análises",
    allowedRoles: ["super_admin", "admin"],
  },
  {
    id: "produtividade-condutores",
    name: "Produtividade Condutores",
    route: "/produtividade-condutores",
    section: "Análises",
    allowedRoles: ["super_admin", "admin", "supervisor"],
  },
  {
    id: "relatorios",
    name: "Relatórios",
    route: "/relatorios",
    section: "Análises",
    allowedRoles: ["super_admin", "admin", "supervisor"],
  },
  {
    id: "reservas-externas",
    name: "Reservas Externas",
    route: "/reservas-externas",
    section: "Análises",
    allowedRoles: ["super_admin", "admin", "supervisor", "back_office"],
  },
]

export const hasPermission = (userRole: UserRole, appId: string): boolean => {
  const app = appPermissions.find((app) => app.id === appId)
  return app ? app.allowedRoles.includes(userRole) : false
}

export const getAvailableApps = (userRole: UserRole): AppPermission[] => {
  return appPermissions.filter((app) => app.allowedRoles.includes(userRole))
}

export const groupAppsBySection = (apps: AppPermission[]) => {
  return apps.reduce(
    (acc, app) => {
      if (!acc[app.section]) {
        acc[app.section] = []
      }
      acc[app.section].push(app)
      return acc
    },
    {} as Record<string, AppPermission[]>,
  )
}
