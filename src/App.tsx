import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FiestasPage from "./pages/FiestasPage";
import ClientesPage from "./pages/ClientesPage";
import ReportesPage from "./pages/ReportesPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<FiestasPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;