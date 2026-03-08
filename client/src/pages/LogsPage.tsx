import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, Loader2, AlertCircle, User, Receipt, Trash2, Edit, Plus } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  create: { label: "Criou", icon: Plus, color: "text-green-600" },
  update: { label: "Atualizou", icon: Edit, color: "text-blue-600" },
  delete: { label: "Eliminou", icon: Trash2, color: "text-red-600" },
  update_role: { label: "Alterou role de", icon: User, color: "text-purple-600" },
};

export default function LogsPage() {
  const { user: currentUser } = useAuth();
  const { data: logs, isLoading } = trpc.logs.list.useQuery();

  if (currentUser?.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">Acesso restrito</p>
        <p className="text-sm text-muted-foreground mt-1">Apenas o Super Admin pode ver os logs de atividade</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Registo completo de todas as ações na plataforma
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ScrollText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhum log registado ainda</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((item: any) => {
                // API returns { log: {...}, user: {...} }
                const logEntry = item.log ?? item;
                const logUser = item.user ?? null;
                const actionCfg = ACTION_CONFIG[logEntry.action] ?? { label: logEntry.action, icon: Receipt, color: "text-muted-foreground" };
                const Icon = actionCfg.icon;
                return (
                  <div key={logEntry.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className={`mt-0.5 shrink-0 ${actionCfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        <span className="font-medium text-foreground">{logUser?.name ?? "Sistema"}</span>
                        <span className={`font-medium ${actionCfg.color}`}>{actionCfg.label}</span>
                        <span className="text-muted-foreground">{logEntry.entity}</span>
                        {logEntry.entityId && (
                          <span className="text-muted-foreground text-xs">#{logEntry.entityId}</span>
                        )}
                      </div>
                      {logEntry.details && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{logEntry.details}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {logEntry.createdAt ? format(new Date(logEntry.createdAt), "dd MMM, HH:mm", { locale: pt }) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
