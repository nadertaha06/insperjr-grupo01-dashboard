import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import styled from "styled-components";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  variant?: "default" | "warning" | "danger" | "success";
}

const variantStyles = {
  default:
    "border-slate-200/90 bg-white text-slate-900 [box-shadow:0_1px_3px_0_rgb(0_0_0/0.04)]",
  warning:
    "border-amber-200/90 bg-amber-50/80 text-slate-900 [box-shadow:0_1px_3px_0_rgb(245_158_11/0.08)]",
  danger:
    "border-red-200/90 bg-red-50/80 text-slate-900 [box-shadow:0_1px_3px_0_rgb(239_68_68/0.08)]",
  success:
    "border-emerald-200/90 bg-emerald-50/80 text-slate-900 [box-shadow:0_1px_3px_0_rgb(16_185_129/0.08)]",
};

const iconBgStyles = {
  default: "bg-slate-100 text-slate-600",
  warning: "bg-amber-100/90 text-amber-700",
  danger: "bg-red-100/90 text-red-700",
  success: "bg-emerald-100/90 text-emerald-700",
};

const trendColors = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-slate-500",
};

const Card = styled.article`
  position: relative;
  isolation: isolate;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  min-height: 210px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.22s ease, box-shadow 0.22s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -14px rgba(15, 23, 42, 0.35);
  }

  @media (max-width: 768px) {
    min-height: 185px;
    padding: 24px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
`;

const TextGroup = styled.div`
  min-width: 0;

  p {
    margin: 0;
  }
`;

const Title = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
`;

const Value = styled.p`
  margin-top: 8px;
  font-size: clamp(1.75rem, 2vw, 2.25rem);
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
  overflow-wrap: anywhere;
  white-space: normal;
`;

const Subtitle = styled.p`
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.4;
  color: #94a3b8;
`;

const IconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  padding: 10px;
`;

const Trend = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-size: 14px;
    font-weight: 600;
  }
`;

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
  variant = "default",
}: KPICardProps) {
  const titleId = `kpi-${title.replace(/\s/g, "-")}`;

  return (
    <Card
      className={cn(
        variantStyles[variant],
        className
      )}
      aria-labelledby={titleId}
    >
      <Row>
        <TextGroup>
          <Title id={titleId}>{title}</Title>
          <Value>{value}</Value>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </TextGroup>
        {icon && (
          <IconWrap
            className={cn(
              iconBgStyles[variant]
            )}
          >
            {icon}
          </IconWrap>
        )}
      </Row>
      {trend && trendValue && (
        <Trend>
          <span className={cn("text-sm font-medium", trendColors[trend])}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        </Trend>
      )}
    </Card>
  );
}
