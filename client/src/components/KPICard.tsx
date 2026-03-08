import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
}

export function KPICard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  delta,
  deltaLabel,
}: KPICardProps) {
  const isPositive = delta >= 0;

  return (
    <Card className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-12 w-12 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[13px] font-semibold ${
            isPositive
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {Math.abs(delta)}%
        </div>
      </div>
      <div className="text-[13px] font-medium text-muted-foreground mb-2">
        {label}
      </div>
      <div className="text-[28px] font-bold text-foreground leading-none mb-1">
        {value}
      </div>
      <div className="text-xs text-muted-foreground/70">{deltaLabel}</div>
    </Card>
  );
}
