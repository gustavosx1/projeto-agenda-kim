import React, { useEffect, useState } from "react";
import CalendarWeek from "../components/CalendarWeek";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import { getAgendas } from "../services/agendaService";
import { getCompromissos } from "../services/compromissoService";
import { Plus, Calendar } from "lucide-react";
import logo from "../assets/logo.svg";

function toEventFromAgenda(a) {
  
  try {
    const date = a.date; // expected YYYY-MM-DD
    const startTime = (a.start_time || "00:00").slice(0,8); // normalize
    const endTime = (a.end_time || "00:30").slice(0,8);
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    return {
      id: a.id,
      title: a.title || a.description || "(sem título)",
      start: start.toISOString(),
      end: end.toISOString(),
      type: 'agenda',
      raw: a,
    };
  } catch (err) {
    return null;
  }
}

function toEventFromCompromisso(c) {
  try {
    const date = c.date;
    const startTime = (c.start_time || "00:00").slice(0,8);
    const endTime = (c.end_time || "00:30").slice(0,8);
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    return {
      id: c.id,
      title: c.title || "(sem título)",
      start: start.toISOString(),
      end: end.toISOString(),
      type: 'compromisso',
      raw: c,
    };
  } catch (err) {
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
      setLoading(true);
      try {
        const [agendas, compromissos] = await Promise.all([
          getAgendas(),
          getCompromissos()
        ]);
        if (!mounted) return;
        const agendaEvents = (agendas || []).map(toEventFromAgenda).filter(Boolean);
        const compromissoEvents = (compromissos || []).map(toEventFromCompromisso).filter(Boolean);
        setEvents([...agendaEvents, ...compromissoEvents]);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const handleEventClick = (ev) => {
    const type = ev.type === 'compromisso' ? 'compromisso' : 'agenda';
    navigate(`/edit-evento/${type}/${ev.id}`);
  };

  // weekStart: monday of current week
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7; // 0->mon
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);

  const todayIso = new Date().toISOString().slice(0,10)

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
