import React, { useMemo } from "react";

// Helper: retorna array de Date para os 7 dias começando em weekStart
function getWeekDays(weekStart) {
  const days = [];
  let date = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Helper: gera labels de tempo a cada 30 minutos entre hourStart e hourEnd
function generateTimeSlots(hourStart = 8, hourEnd = 20, stepMinutes = 30) {
  const slots = [];
  for (let h = hourStart; h <= hourEnd; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      slots.push({
        label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      });
    }
  }
  return slots;
}

export default function CalendarWeek({
  weekStart = new Date(),
  events = [],
  hourStart = 8,
  hourEnd = 20,
  pixelsPerHour = 60,
  stepMinutes = 30,
  onEventClick, // function(event)
  onDayClick, // function(dateStr) - chamado quando clica em um dia
  todayIso, // optional YYYY-MM-DD string to highlight today
}) {
  const pixelsPerMinute = pixelsPerHour / 60;

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const slots = useMemo(() => generateTimeSlots(hourStart, hourEnd, stepMinutes), [hourStart, hourEnd, stepMinutes]);

  // eventos indexados por dia (YYYY-MM-DD)
  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const key = new Date(ev.start).toISOString().slice(0, 10);
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
        {days.map((d) => {
          const iso = d.toISOString().slice(0,10)
          const isToday = todayIso ? iso === todayIso : (new Date().toISOString().slice(0,10) === iso)
          const dayOfWeek = d.getDay();
          const dayMap = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
          const dayLabel = dayMap[dayOfWeek];
          return (
            <div 
              key={d.toISOString()} 
              className={`header-day ${isToday ? 'today' : ''}`}
              onClick={() => onDayClick && onDayClick(iso)}
              style={{ cursor: onDayClick ? 'pointer' : 'default' }}
              role={onDayClick ? "button" : undefined}
              tabIndex={onDayClick ? 0 : undefined}
            >
              {dayLabel} {d.getDate()}
            </div>
          )
        })}
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
            const isToday = todayIso ? key === todayIso : key === new Date().toISOString().slice(0, 10);
            
            return (
              <div key={key} className={`day-column ${isToday ? 'day-today' : ''}`} style={dayColumnStyle}>
                <div className="day-grid">
                  {slots.map((_, i) => (
                    <div key={i} className="grid-slot" />
                  ))}
                  {dayEvents.map((ev) => {
                    const start = new Date(ev.start);
                    const end = new Date(ev.end);
                    const startMinutes = start.getHours() * 60 + start.getMinutes() - hourStart * 60;
                    const duration = (end - start) / (1000 * 60);
                    const top = Math.max(0, startMinutes * pixelsPerMinute);
                    const height = Math.max(15, duration * pixelsPerMinute);

                    return (
                      <div
                        key={ev.id}
                        className={`event-item ${ev.type === 'compromisso' ? 'event-compromisso' : 'event-agenda'} ${ev.raw?.completed ? 'event-completed' : ''}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        title={ev.title}
                        onClick={() => onEventClick?.(ev)}
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
