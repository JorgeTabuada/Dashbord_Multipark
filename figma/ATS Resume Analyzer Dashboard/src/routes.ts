import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { ModulePage } from "./pages/ModulePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "despesas", Component: ModulePage },
      { path: "faturas", Component: ModulePage },
      { path: "relatorio-anual", Component: ModulePage },
      { path: "multipark", Component: ModulePage },
      { path: "operacional", Component: ModulePage },
      { path: "servicos", Component: ModulePage },
      { path: "recursos-humanos", Component: ModulePage },
      { path: "performance", Component: ModulePage },
      { path: "formacao", Component: ModulePage },
      { path: "marketing", Component: ModulePage },
      { path: "google-reviews", Component: ModulePage },
      { path: "parcerias", Component: ModulePage },
      { path: "reclamacoes", Component: ModulePage },
      { path: "perdidos-achados", Component: ModulePage },
      { path: "ocorrencias", Component: ModulePage },
      { path: "utilizadores", Component: ModulePage },
      { path: "projetos", Component: ModulePage },
      { path: "tarefas", Component: ModulePage },
    ],
  },
]);
