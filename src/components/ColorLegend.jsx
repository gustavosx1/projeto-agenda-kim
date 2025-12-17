import React from 'react'

export default function ColorLegend() {
  return (
    <div className="color-legend">
      <div className="legend-item">
        <div className="legend-color publi"></div>
        <span>Rosa = Publi/Agenda</span>
      </div>
      <div className="legend-item">
        <div className="legend-color compromisso"></div>
        <span>Azul = Compromisso Kim</span>
      </div>
    </div>
  )
}
