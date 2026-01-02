import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import DetailModal from "../components/DetailModal";
import { getAgendas } from "../services/agendaService";
import { getCompromissos } from "../services/compromissoService";
import { deleteAgenda } from "../services/agendaService";
import { deleteCompromisso } from "../services/compromissoService";

// Helper: gera labels de tempo a cada 1 hora entre hourStart e hourEnd
function generateTimeSlots(hourStart = 7, hourEnd = 22) {
  const slots = [];
  for (let h = hourStart; h <= hourEnd; h++) {
    const label = `${String(h).padStart(2, "0")}:00`;
    slots.push({ hour: h, minute: 0, label });
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const timeGutterRef = useRef(null);
  const dayContainerRef = useRef(null);

  // Sincronizar scroll entre time-gutter e day-container
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      if (timeGutterRef.current) {
        timeGutterRef.current.scrollTop = scrollTop;
      }
    };

    if (dayContainerRef.current) {
      dayContainerRef.current.addEventListener('scroll', handleScroll);
      return () => dayContainerRef.current?.removeEventListener('scroll', handleScroll);
    }
  }, []);

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
    setSelectedEvent(ev);
    setShowDetail(true);
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`Deletar "${ev.title}"?`)) return;

    try {
      if (ev.type === "compromisso") {
        await deleteCompromisso(ev.id);
      } else {
        await deleteAgenda(ev.id);
      }
      setEvents(events.filter(e => e.id !== ev.id));
      setShowDetail(false);
      alert("Evento deletado com sucesso");
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao deletar evento");
    }
  };

  const handleEdit = (ev) => {
    const type = ev.type === "compromisso" ? "compromisso" : "agenda";
    navigate(`/edit-evento/${type}/${ev.id}`);
  };

  const slots = generateTimeSlots(7, 22);
  const pixelsPerHour = 60;
  const pixelsPerMinute = pixelsPerHour / 60;
  const dayHeight = (22 - 7) * pixelsPerHour;

  // Criar data a partir de string YYYY-MM-DD sem problemas de timezone
  const [year, month, day] = dateStr.split('-').map(Number);
  const dayDate = new Date(year, month - 1, day);
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
            <div className="time-gutter" ref={timeGutterRef}>
              {slots.map((s, i) => (
                <div key={i} className="time-slot-label">
                  {s.label}
                </div>
              ))}
            </div>

            <div className="day-container" ref={dayContainerRef} style={{ height: `${dayHeight}px` }}>
              <div className="day-grid">
                {slots.map((_, i) => (
                  <div key={i} className="grid-slot" />
                ))}
                {events.map((ev) => {
                  const start = toDate(ev.start);
                  const end = toDate(ev.end);
                  const startMinutes = start.getHours() * 60 + start.getMinutes();
                  const endMinutes = end.getHours() * 60 + end.getMinutes();
                  const minutesFromStart = Math.max(0, startMinutes - 7 * 60);
                  const duration = Math.max(15, endMinutes - startMinutes);
                  const top = minutesFromStart * pixelsPerMinute;
                  const height = duration * pixelsPerMinute;

                  const startLabel = start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  const endLabel = end.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
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

        {showDetail && selectedEvent && (
          <div className="modal-overlay" onClick={() => setShowDetail(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, color: '#213547' }}>{selectedEvent.title}</h2>
                <button 
                  onClick={() => setShowDetail(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
                <p><strong>Tipo:</strong> {selectedEvent.type === 'compromisso' ? 'Compromisso' : 'Publi'}</p>
                {selectedEvent.raw?.start_time && (
                  <p><strong>Hora:</strong> {selectedEvent.raw.start_time} - {selectedEvent.raw.end_time}</p>
                )}
              </div>

              {selectedEvent.raw?.description && (
                <div style={{ marginBottom: 16 }}>
                  <p><strong>{selectedEvent.type === 'compromisso' ? 'Descrição' : 'Briefing'}:</strong></p>
                  <div style={{
                    color: '#334155',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    {selectedEvent.raw.description}
                  </div>
                </div>
              )}

              {selectedEvent.type === 'agenda' && (
                <>
                  {selectedEvent.raw?.instagram && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <div>
                        <strong>Instagram:</strong> {selectedEvent.raw.instagram}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedEvent.raw.instagram);
                          alert('Copiado!');
                        }}
                        style={{
                          background: 'var(--accent-pink)',
                          color: 'white',
                          border: 'none',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          marginLeft: '8px'
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                  {selectedEvent.raw?.link && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <div>
                        <strong>Link:</strong> <a href={selectedEvent.raw.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-pink)' }}>{selectedEvent.raw.link}</a>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedEvent.raw.link);
                          alert('Copiado!');
                        }}
                        style={{
                          background: 'var(--accent-pink)',
                          color: 'white',
                          border: 'none',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          marginLeft: '8px'
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                  {selectedEvent.raw?.cupom && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <div>
                        <strong>Cupom:</strong> {selectedEvent.raw.cupom}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedEvent.raw.cupom);
                          alert('Copiado!');
                        }}
                        style={{
                          background: 'var(--accent-pink)',
                          color: 'white',
                          border: 'none',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          marginLeft: '8px'
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button 
                  onClick={() => handleEdit(selectedEvent)}
                  className="btn-primary"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(selectedEvent)}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    padding: '0.6em 1.2em',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
