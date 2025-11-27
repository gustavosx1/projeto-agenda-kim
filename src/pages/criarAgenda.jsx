
import { createAgenda } from "../services/agendaService";
import AgendaForm from "../components/agendaForm";
import { useNavigate } from "react-router-dom";

export default function Create() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await createAgenda(data);
    navigate("/agendas");
  };

  return (
    <div className="form">
      <h1>Criar Agenda</h1>
      <AgendaForm onSubmit={handleSubmit} />
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate('/calendar')} className="btn-primary">Ver no calendário</button>
      </div>
    </div>
  );
}
