import React, { useEffect, useState } from 'react'
import { getAgendas } from '../services/agendaService'
import { getCompromissos } from '../services/compromissoService'
import RequireAuth from '../components/RequireAuth'
import LoadingSpinner from '../components/LoadingSpinner'
import { useNavigate, useLocation } from 'react-router-dom'

function formatTimeRange(startIso, endIso) {
  try {
    const s = new Date(startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    const e = new Date(endIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    return `${s} - ${e}`
  } catch {
    return ''
  }
}

export default function ListaEventos() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [agendas, compromissos] = await Promise.all([getAgendas(), getCompromissos()])
        if (!mounted) return
        const a = (agendas || []).map((x) => ({
          id: x.id,
          date: x.date,
          time: formatTimeRange(`${x.date}T${x.start_time}`, `${x.date}T${x.end_time || x.start_time}`),
          title: x.title || x.description || '(sem título)',
          type: 'agenda',
        }))
        const c = (compromissos || []).map((x) => ({
          id: x.id,
          date: x.date,
          time: formatTimeRange(`${x.date}T${x.start_time}`, `${x.date}T${x.end_time || x.start_time}`),
          title: x.title || '(sem título)',
          type: 'compromisso',
        }))
        const combined = [...a, ...c].sort((p,q) => (p.date + p.time).localeCompare(q.date + q.time))
        setEvents(combined)
      } catch (err) {
        console.error('Erro listando eventos', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return <RequireAuth><LoadingSpinner /></RequireAuth>

  // check for optional ?date=YYYY-MM-DD filter
  const params = new URLSearchParams(location.search)
  const filterDate = params.get('date')

  // group by date
  const groups = events.reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] || []
    acc[ev.date].push(ev)
    return acc
  }, {})
  // if filterDate is present, keep only that group's key order
  const keys = filterDate ? [filterDate] : Object.keys(groups)

  return (
    <RequireAuth>
      <div className="form" style={{ paddingBottom: 40 }}>
        <h1>Eventos</h1>
        {keys.length === 0 && <p>Nenhum evento encontrado.</p>}
        {keys.map((date) => (
          groups[date] ? (
            <div key={date} style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 8 }}>{new Date(date).toLocaleDateString()}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#334155' }}>Horário</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#334155' }}>Título</th>
                  </tr>
                </thead>
                <tbody>
                  {groups[date].map((ev) => (
                    <tr key={ev.id} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '10px 12px', width: 180, color: '#556' }}>{ev.time}</td>
                      <td style={{ padding: '10px 12px', color: ev.type === 'compromisso' ? '#1e3a8a' : '#b91c73', fontWeight: 600 }}>{ev.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate('/calendar')} className="btn-primary">Ver no calendário</button>
        </div>
            </div>
          ) : (
            <div key={date} style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 8 }}>{new Date(date).toLocaleDateString()}</h3>
              <p>Nenhum evento neste dia.</p>
              <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate('/calendar')} className="btn-primary">Ver no calendário</button>
        </div>
            </div>
          )
        ))}
      </div>
    </RequireAuth>
  )
}
