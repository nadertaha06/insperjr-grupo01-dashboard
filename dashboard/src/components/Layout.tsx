import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { ExperienceBar } from "./ExperienceBar";
import { Sidebar } from "./Sidebar";

const Shell = styled.div`
  --sidebar-width: 256px;
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Content = styled.main`
  min-width: 0;
  min-height: 100vh;
  padding: 20px 24px 28px;
  overflow-x: auto;

  @media (max-width: 1024px) {
    padding: 16px;
  }
`;

const ContentInner = styled.div`
  width: min(1500px, 100%);
  margin: 0 auto;
`;

export function Layout() {
  return (
    <Shell>
      <Sidebar />
      <Content role="main" aria-label="Conteúdo principal">
        <ContentInner>
          <ExperienceBar />
          <Outlet />
        </ContentInner>
      </Content>
    </Shell>
  );
}
