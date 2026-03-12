import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import styled from "styled-components";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

const Wrapper = styled.section`
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #fff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 12px 18px -16px rgba(15, 23, 42, 0.45);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding: 20px 24px;
`;

const HeaderText = styled.div`
  min-width: 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #0f172a;
`;

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: 15px;
  color: #64748b;
`;

const Body = styled.div`
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export function SectionCard({
  title,
  subtitle,
  children,
  className,
  action,
}: SectionCardProps) {
  const headingId = title.replace(/\s/g, "-").toLowerCase();

  return (
    <Wrapper
      className={cn(
        className
      )}
      aria-labelledby={headingId}
    >
      <Header>
        <HeaderText>
          <Title id={headingId}>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </HeaderText>
        {action && <div>{action}</div>}
      </Header>
      <Body>{children}</Body>
    </Wrapper>
  );
}
