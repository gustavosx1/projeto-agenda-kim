import React, { useEffect, useState, useCallback } from "react";
import CalendarWeek from "../components/CalendarWeek";
import ColorLegend from "../components/ColorLegend";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import { getAgendas } from "../services/agendaService";
import { getCompromissos } from "../services/compromissoService";
import { Plus, Calendar } from "lucide-react";
import logo from "../assets/logo.svg";

function toEvent(item, type) {
  try {
    const start = new Date(`${item.date}T${(item.start_time || "00:00").slice(0, 5)}`);
    const end = new Date(`${item.date}T${(item.end_time || "00:30").slice(0, 5)}`);
    
    return {
      id: item.id,
      title: item.title || item.description || "(sem título)",
      start: start.toISOString(),
      end: end.toISOString(),
      type,
      raw: item,
    };
  } catch {
    return null;
  }
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [agendas, compromissos] = await Promise.all([
          getAgendas(),
          getCompromissos()
        ]);
        if (!mounted) return;
        
        const allEvents = [
          ...(agendas || []).map(a => toEvent(a, 'agenda')),
          ...(compromissos || []).map(c => toEvent(c, 'compromisso'))
        ].filter(Boolean);
        
        setEvents(allEvents);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const handleEventClick = useCallback((ev) => {
    navigate(`/edit-evento/${ev.type}/${ev.id}`);
  }, [navigate]);

  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  const todayIso = today.toISOString().slice(0, 10);

  return (
    <RequireAuth>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <img className="logo" src={logo} alt="Logo"/>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button 
              onClick={() => navigate('/criar-evento')}
              className="btn-icon"
              title="Adicionar Evento"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => navigate(`/eventos?date=${todayIso}`)}
              className="btn-icon"
              title="Eventos Hoje"
            >
              <Calendar size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <ColorLegend />
            <CalendarWeek
              weekStart={monday}
              events={events}
              hourStart={7}
              hourEnd={22}
              pixelsPerHour={60}
              onEventClick={handleEventClick}
              onDayClick={(dateStr) => navigate(`/expand-day?date=${dateStr}`)}
              todayIso={todayIso}
            />

            {/* Eventos Hoje button moved to header */}
          </>
        )}
      </div>
    </RequireAuth>
  );
}
