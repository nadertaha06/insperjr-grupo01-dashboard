import { useEffect, useState } from "react";
import styled from "styled-components";
import { ClockCounterClockwise, Pulse } from "@phosphor-icons/react";

const Bar = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: linear-gradient(90deg, #ffffff 0%, #f8fafc 100%);
`;

const Left = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
`;

function nowText() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ExperienceBar() {
  const [timeLabel, setTimeLabel] = useState(nowText());

  useEffect(() => {
    const timer = setInterval(() => setTimeLabel(nowText()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const statusLabel = "Dados do case carregados";

  return (
    <Bar aria-label="Status e controles do dashboard">
      <Left>
        <Chip>
          <Pulse size={14} color="#059669" />
          Status: {statusLabel}
        </Chip>
        <Chip>
          <ClockCounterClockwise size={14} color="#2563eb" />
          Atualizado: {timeLabel}
        </Chip>
        <Chip>Modo: Planejamento Tático NENO</Chip>
      </Left>
    </Bar>
  );
}
