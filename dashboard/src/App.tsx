import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Overview } from "@/pages/Overview";
import { Demand } from "@/pages/Demand";
import { Production } from "@/pages/Production";
import { Logistics } from "@/pages/Logistics";
import { Inventory } from "@/pages/Inventory";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/demanda" element={<Demand />} />
          <Route path="/producao" element={<Production />} />
          <Route path="/logistica" element={<Logistics />} />
          <Route path="/estoque" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
