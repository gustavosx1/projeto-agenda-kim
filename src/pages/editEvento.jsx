import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import EventoForm from "../components/eventoForm";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAgendaById, updateAgenda } from "../services/agendaService";
import { getCompromissoById, updateCompromisso } from "../services/compromissoService";

export default function EditEvento() {
  const { id, type } = useParams(); // type: 'agenda' ou 'compromisso'
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEvento();
  }, [id, type]);

  const loadEvento = async () => {
    setLoading(true);
    try {
      let data;
      if (type === "agenda") {
        data = await getAgendaById(id);
        data.type = "agenda";
      } else {
        data = await getCompromissoById(id);
        data.type = "compromisso";
      }
      setEvento(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
      alert("Erro ao carregar evento");
      navigate("/calendar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      const data = {
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        title: formData.title,
        description: formData.description,
      };

      if (type === "agenda") {
        data.instagram = formData.instagram;
        data.link = formData.link;
        data.cupom = formData.cupom;
        data.anexo = formData.anexo;
        await updateAgenda(id, data);
      } else {
        await updateCompromisso(id, data);
      }

      navigate("/calendar");
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      alert("Erro ao atualizar evento: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <RequireAuth><LoadingSpinner /></RequireAuth>;

  if (!evento) return null;

  return (
    <RequireAuth>
      <div className="form">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h1 style={{ color: "#213547", margin: 0 }}>{evento.title || "(sem título)"}</h1>
        </div>

        <EventoForm initialData={evento} onSubmit={handleSubmit} loading={saving} />

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
