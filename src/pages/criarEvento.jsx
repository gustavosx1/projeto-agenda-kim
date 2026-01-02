import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import EventoForm from "../components/eventoForm";
import { createAgenda } from "../services/agendaService";
import { createCompromisso } from "../services/compromissoService";
import { convertDDMMtoYYYYMMDD } from "../utils/dateUtils";

export default function CriarEvento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      const dateStr = convertDDMMtoYYYYMMDD(formData.date);

      const baseData = {
        date: dateStr,
        start_time: formData.start_time,
        end_time: formData.end_time,
        title: formData.title,
        description: formData.description,
      };

      if (formData.isPubli) {
        const agendaData = {
          ...baseData,
          instagram: formData.instagram,
          link: formData.link,
          cupom: formData.cupom,
          anexo: formData.anexo,
        };
        await createAgenda(agendaData);
      } else {
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
