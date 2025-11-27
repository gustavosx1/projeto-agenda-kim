import React, { useMemo } from "react";
import "./CalendarWeek.css";

// Helper: retorna array de Date para os 7 dias começando em weekStart
function getWeekDays(weekStart) {
  const days = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

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

// Converte string/Date para Date segura
function toDate(d) {
  return d instanceof Date ? d : new Date(d);
}

export default function CalendarWeek({
  weekStart = new Date(),
  events = [],
  hourStart = 8,
  hourEnd = 20,
  pixelsPerHour = 60,
  stepMinutes = 30,
  onEventClick, // function(event)
}) {
  const pixelsPerMinute = pixelsPerHour / 60;

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const slots = useMemo(() => generateTimeSlots(hourStart, hourEnd, stepMinutes), [hourStart, hourEnd, stepMinutes]);

  // eventos indexados por dia (YYYY-MM-DD)
  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const s = toDate(ev.start);
      const key = s.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const dayColumnStyle = {
    height: `${(hourEnd - hourStart) * pixelsPerHour}px`,
  };

  return (
    <div className="calendar-week">
      <div className="calendar-header">
        <div className="time-gutter" />
        {days.map((d) => (
          <div key={d.toISOString()} className="header-day">
            {d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
          </div>
        ))}
      </div>

      <div className="calendar-body">
        <div className="time-gutter">
          {slots.map((s, i) => (
            <div key={i} className="time-slot-label">
              {s.label}
            </div>
          ))}
        </div>

        <div className="days-grid">
          {days.map((d) => {
            const key = d.toISOString().slice(0, 10);
            const dayEvents = eventsByDay[key] || [];
            return (
              <div key={key} className="day-column" style={dayColumnStyle}>
                <div className="day-grid">
                  {slots.map((_, i) => (
                    <div key={i} className="grid-slot" />
                  ))}
                  {dayEvents.map((ev) => {
                    const start = toDate(ev.start);
                    const end = toDate(ev.end);
                    // calcular top e altura em pixels com base em hourStart
                    const startMinutes = start.getHours() * 60 + start.getMinutes();
                    const endMinutes = end.getHours() * 60 + end.getMinutes();
                    const minutesFromStart = Math.max(0, startMinutes - hourStart * 60);
                    const duration = Math.max(15, endMinutes - startMinutes);
                    const top = minutesFromStart * pixelsPerMinute;
                    const height = duration * pixelsPerMinute;

                    const startLabel = new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endLabel = new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const typeClass = ev.type === 'compromisso' ? 'event-compromisso' : 'event-agenda';
                    return (
                      <div
                        key={ev.id || `${ev.title}-${start.toISOString()}`}
                        className={`event-item ${typeClass}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        title={`${ev.title} (${startLabel} - ${endLabel})`}
                        onClick={() => onEventClick && onEventClick(ev)}
                        role={onEventClick ? "button" : undefined}
                        tabIndex={onEventClick ? 0 : undefined}
                      >
                        <div className="event-title">{ev.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
