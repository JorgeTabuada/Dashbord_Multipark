import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

interface ModuleCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  path: string;
  alertCount?: number;
  accentColor: string;
}

export function ModuleCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  path,
  alertCount,
  accentColor,
}: ModuleCardProps) {
  const [, setLocation] = useLocation();

  return (
    <Card
      className="p-5 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all"
      style={{
        ["--accent" as string]: accentColor,
      }}
      onClick={() => setLocation(path)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = `0 8px 20px ${accentColor}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-7 w-7" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-foreground truncate">
            {label}
          </div>
        </div>
        {alertCount !== undefined && alertCount > 0 && (
          <div className="min-w-[24px] h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center px-2">
            {alertCount}
          </div>
        )}
      </div>
    </Card>
  );
}
