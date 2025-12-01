import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAgendas } from "../services/agendaService";
import { getCompromissos } from "../services/compromissoService";

// Helper: gera labels de tempo a cada 30 minutos entre hourStart e hourEnd
function generateTimeSlots(hourStart = 8, hourEnd = 20, stepMinutes = 30) {
  const slots = [];
  for (let h = hourStart; h <= hourEnd; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push({ hour: h, minute: m, label });
    }
  }
  return slots;
}

function toDate(d) {
  return d instanceof Date ? d : new Date(d);
}

export default function ExpandDay() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [agendas, compromissos] = await Promise.all([
          getAgendas(),
          getCompromissos(),
        ]);
        if (!mounted) return;

        // filtrar apenas eventos do dia
        const agendaEvents = (agendas || [])
          .filter((a) => a.date === dateStr)
          .map((a) => ({
            id: a.id,
            title: a.title || a.description || "(sem título)",
            start: new Date(`${a.date}T${a.start_time || "00:00"}`).toISOString(),
            end: new Date(`${a.date}T${a.end_time || "00:30"}`).toISOString(),
            type: "agenda",
            raw: a,
          }));

        const compromissoEvents = (compromissos || [])
          .filter((c) => c.date === dateStr)
          .map((c) => ({
            id: c.id,
            title: c.title || "(sem título)",
            start: new Date(`${c.date}T${c.start_time || "00:00"}`).toISOString(),
            end: new Date(`${c.date}T${c.end_time || "00:30"}`).toISOString(),
            type: "compromisso",
            raw: c,
          }));

        setEvents([...agendaEvents, ...compromissoEvents].sort((a, b) =>
          new Date(a.start) - new Date(b.start)
        ));
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [dateStr]);

  const handleEventClick = (ev) => {
    const type = ev.type === "compromisso" ? "compromisso" : "agenda";
    navigate(`/edit-evento/${type}/${ev.id}`);
  };

  const slots = generateTimeSlots(7, 22, 30);
  const pixelsPerHour = 60;
  const pixelsPerMinute = pixelsPerHour / 60;
  const dayHeight = (22 - 7) * pixelsPerHour;

  const dayDate = new Date(dateStr);
  const dayMap = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayLabel = dayMap[dayDate.getDay()];
  const formattedDate = dayDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <RequireAuth>
      <div className="expand-day-page">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h1>{dayLabel}</h1>
          <button
            className="btn-primary"
            onClick={() => navigate("/calendar")}
            style={{ marginLeft: "auto", background: "#ccc", color: "#333" }}
          >
            ← Voltar
          </button>
        </div>

        <p style={{ color: "#666", marginBottom: 20 }}>{formattedDate}</p>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="expand-day-calendar">
            <div className="time-gutter">
              {slots.map((s, i) => (
                <div key={i} className="time-slot-label">
                  {s.label}
                </div>
              ))}
            </div>

            <div className="day-container" style={{ height: `${dayHeight}px` }}>
              <div className="day-grid">
                {slots.map((_, i) => (
                  <div key={i} className="grid-slot" />
                ))}
                {events.map((ev) => {
                  const start = toDate(ev.start);
                  const end = toDate(ev.end);
                  const startMinutes = start.getHours() * 60 + start.getMinutes();
                  const endMinutes = end.getHours() * 60 + end.getMinutes();
                  const minutesFromStart = Math.max(0, startMinutes - 8 * 60);
                  const duration = Math.max(15, endMinutes - startMinutes);
                  const top = minutesFromStart * pixelsPerMinute;
                  const height = duration * pixelsPerMinute;

                  const startLabel = start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endLabel = end.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const typeClass =
                    ev.type === "compromisso" ? "event-compromisso" : "event-agenda";

                  return (
                    <div
                      key={ev.id || `${ev.title}-${start.toISOString()}`}
                      className={`event-item ${typeClass}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      title={`${ev.title} (${startLabel} - ${endLabel})`}
                      onClick={() => handleEventClick(ev)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="event-title">{ev.title}</div>
                      <div className="event-time">
                        {startLabel} - {endLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {events.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                <p>Nenhum evento neste dia</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/criar-evento")}
                >
                  Criar Evento
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
