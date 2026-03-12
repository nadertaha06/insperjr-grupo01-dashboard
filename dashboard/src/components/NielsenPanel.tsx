import styled from "styled-components";

const Panel = styled.section`
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(120deg, #ffffff 0%, #fffbeb 100%);
  padding: 14px;
  margin-bottom: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
  }

  span {
    font-size: 12px;
    color: #92400e;
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 9999px;
    padding: 4px 8px;
    font-weight: 600;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Item = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  padding: 8px 10px;

  strong {
    display: block;
    font-size: 12px;
    color: #0f172a;
    margin-bottom: 2px;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: #475569;
  }
`;

const heuristics = [
  ["Status do sistema", "Barra superior com atualização e estado operacional."],
  ["Correspondência com o mundo real", "Termos do negócio: DOI, KHL, NENO, cabotagem."],
  ["Controle e liberdade", "Ação de retorno rápido ao topo e navegação direta."],
  ["Consistência", "Componentes padronizados para KPIs, cartões e status."],
  ["Prevenção de erro", "Alertas críticos antes de qualquer decisão de volume."],
  ["Reconhecimento", "Legendas, rótulos claros e cores semânticas."],
  ["Eficiência", "Leitura rápida por seções com foco executivo."],
  ["Design minimalista", "Sinal visual forte com baixo ruído de interface."],
  ["Diagnóstico de erros", "Riscos exibidos com causa e impacto operacional."],
  ["Ajuda e documentação", "Painel 'Como usar' contextual no topo."],
] as const;

export function NielsenPanel() {
  return (
    <Panel aria-label="Checklist de heurísticas de Nielsen">
      <Header>
        <h3>Padrão de Usabilidade (Nielsen)</h3>
        <span>10/10 Heurísticas</span>
      </Header>
      <Grid>
        {heuristics.map(([title, description]) => (
          <Item key={title}>
            <strong>{title}</strong>
            <p>{description}</p>
          </Item>
        ))}
      </Grid>
    </Panel>
  );
}
