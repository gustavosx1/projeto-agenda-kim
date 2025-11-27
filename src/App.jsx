
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import List from "./pages/listaAgendas.jsx"
import Create from "./pages/criarAgenda.jsx"
import Edit from "./pages/editaAgenda.jsx"
import CalendarPage from "./pages/calendar.jsx"
import ListaCompromissos from "./pages/listaCompromissos.jsx"
import CriarCompromisso from "./pages/criarCompromisso.jsx"
import EditarCompromisso from "./pages/editarCompromisso.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/agendas" element={<List />} />
        <Route path="/agendas/create" element={<Create />} />
        <Route path="/agendas/edit/:id" element={<Edit />} />
        <Route path="/compromissos" element={<ListaCompromissos />} />
        <Route path="/compromissos/create" element={<CriarCompromisso />} />
        <Route path="/compromissos/edit/:id" element={<EditarCompromisso />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

