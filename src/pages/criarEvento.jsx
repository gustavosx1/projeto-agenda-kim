import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import EventoForm from "../components/eventoForm";
import { createAgenda } from "../services/agendaService";
import { createCompromisso } from "../services/compromissoService";

export default function CriarEvento() {
  const navigate = useNavigate();
  const [isPubli, setIsPubli] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      // converter dd/mm para YYYY-MM-DD
      const today = new Date();
      const [day, month] = formData.date.split("/");
      const year = today.getFullYear();
      // validar se a data é válida
      const dateObj = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10));
      if (isNaN(dateObj.getTime())) {
        throw new Error("Data inválida");
      }
      const dateStr = dateObj.toISOString().slice(0, 10);

      // preparar dados básicos
      const baseData = {
        date: dateStr,
        start_time: formData.start_time,
        end_time: formData.end_time,
        title: formData.title,
        description: formData.description,
      };

      if (formData.isPubli) {
        // salvar em tabela de agendas com campos extras
        const agendaData = {
          ...baseData,
          instagram: formData.instagram,
          link: formData.link,
          cupom: formData.cupom,
          anexo: formData.anexo,
        };
        await createAgenda(agendaData);
      } else {
        // salvar em tabela de compromissos (sem campos extras)
        await createCompromisso(baseData);
      }

      navigate("/calendar");
    } catch (err) {
      console.error("Erro ao criar evento:", err);
      alert("Erro ao criar evento: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="form">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h1 style={{ color: "#213547", margin: 0 }}>Criar Evento</h1>
          <button
            type="button"
            onClick={() => setIsPubli(!isPubli)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 4,
              border: "2px solid #f472b6",
              background: isPubli ? "#f472b6" : "transparent",
              color: isPubli ? "white" : "#f472b6",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold",
            }}
            title={isPubli ? "Publi ativo" : "Publi inativo"}
          >
            ✓
          </button>
          <span style={{ fontSize: 14, color: "#666" }}>
            {isPubli ? "Publicação" : "Compromisso"}
          </span>
        </div>

        <EventoForm onSubmit={handleFormSubmit} loading={loading} />

        <div style={{ display: "flex", gap: 8, marginTop: 12, paddingRight: 20 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/calendar")}
            style={{ background: "#ccc", color: "#333" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </RequireAuth>
  );
}
