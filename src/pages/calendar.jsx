import React, { useEffect, useState } from "react";
import CalendarWeek from "../components/CalendarWeek";
import { useNavigate } from "react-router-dom";
import { getAgendas } from "../services/agendaService";
import { getCompromissos } from "../services/compromissoService";

function toEventFromAgenda(a) {
  // agenda: { id, date, start_time, end_time, title, description }
  // build ISO datetimes in local timezone
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
    if (ev.type === 'compromisso') {
      navigate(`/compromissos/edit/${ev.id}`);
    } else {
      navigate(`/agendas/edit/${ev.id}`);
    }
  };

  // weekStart: monday of current week
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7; // 0->mon
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <h2 style={{ color: "#d63384", margin: 0 }}>Calendário Semanal</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={() => navigate('/agendas/create')}>Adicionar Agenda</button>
          <button className="btn-primary" onClick={() => navigate('/compromissos/create')} style={{ background: 'linear-gradient(90deg, #7ad3ff, #4fa3ff)' }}>Adicionar Compromisso</button>
          <button onClick={() => window.location.reload()}>Atualizar</button>
        </div>
      </div>

      {loading ? (
        <p>Carregando eventos...</p>
      ) : (
        <CalendarWeek
          weekStart={monday}
          events={events}
          hourStart={8}
          hourEnd={20}
          pixelsPerHour={60}
          onEventClick={handleEventClick}
        />
      )}
    </div>
  );
}
