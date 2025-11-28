
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CalendarPage from "./pages/calendar.jsx"
import CriarEvento from "./pages/criarEvento.jsx"
import EditEvento from "./pages/editEvento.jsx"
import ExpandDay from "./pages/expandDay.jsx"
import ListaEventos from "./pages/listaEventos.jsx"
import Login from "./pages/login.jsx";  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/criar-evento" element={<CriarEvento />} />
        <Route path="/edit-evento/:type/:id" element={<EditEvento />} />
        <Route path="/expand-day" element={<ExpandDay />} />
        <Route path="/eventos" element={<ListaEventos />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
