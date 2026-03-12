import { cn } from "@/lib/utils";
import styled from "styled-components";

interface StatusBadgeProps {
  status: "ok" | "warning" | "critical" | "neutral";
  label: string;
}

const statusStyles = {
  ok: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-800",
  neutral: "bg-slate-100 text-slate-700",
};

const dotColors = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  neutral: "bg-slate-500",
};

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 9999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 9999px;
`;

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        statusStyles[status]
      )}
      role="status"
    >
      <Dot className={cn(dotColors[status])} aria-hidden />
      {label}
    </Badge>
  );
}
