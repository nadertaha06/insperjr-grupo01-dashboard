import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  ChartBar,
  TrendUp,
  Factory,
  Truck,
  Package,
  Sliders,
  BeerBottle,
} from "@phosphor-icons/react";

const navItems = [
  { to: "/", icon: ChartBar, label: "Visão Geral" },
  { to: "/demanda", icon: TrendUp, label: "Demanda" },
  { to: "/producao", icon: Factory, label: "Produção" },
  { to: "/logistica", icon: Truck, label: "Logística" },
  { to: "/estoque", icon: Package, label: "Estoque" },
];

const Aside = styled.aside`
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 20;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, #0f172a 0%, #0b1738 100%);
  color: #fff;
  box-shadow: 4px 0 24px -4px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    position: sticky;
    height: auto;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
`;

const BrandIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f59e0b;
  box-shadow: 0 12px 20px -10px rgba(245, 158, 11, 0.45);
`;

const BrandText = styled.div`
  min-width: 0;

  h1 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
  }
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 18px 12px;

  @media (max-width: 1024px) {
    flex-direction: row;
    overflow-x: auto;
    padding: 10px;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-left: 2px solid transparent;
  border-radius: 12px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #e2e8f0;
    background: rgba(51, 65, 85, 0.55);
  }

  &.active {
    color: #fbbf24;
    border-left-color: #f59e0b;
    background: rgba(245, 158, 11, 0.12);
  }

  @media (max-width: 1024px) {
    border-left: none;
    border-bottom: 2px solid transparent;

    &.active {
      border-left-color: transparent;
      border-bottom-color: #f59e0b;
    }
  }
`;

const Footer = styled.div`
  padding: 14px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.25);

  p {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }
`;

export function Sidebar() {
  return (
    <Aside role="navigation" aria-label="Menu principal">
      <Brand>
        <BrandIcon aria-hidden>
          <BeerBottle size={22} weight="fill" className="text-white" />
        </BrandIcon>
        <BrandText>
          <h1>AMBEV</h1>
          <p>Dashboard LN NENO</p>
        </BrandText>
      </Brand>

      <Nav>
        {navItems.map((item) => (
          <NavItem key={item.to} to={item.to} end={item.to === "/"}>
            <item.icon size={20} weight="duotone" aria-hidden />
            <span>{item.label}</span>
          </NavItem>
        ))}
      </Nav>

      <Footer>
        <p>Case Insper Jr x Ambev</p>
        <p>Fevereiro 2026</p>
      </Footer>
    </Aside>
  );
}
