import { createCompromisso } from "../services/compromissoService";
import CompromissoForm from "../components/compromissoForm";
import { useNavigate } from "react-router-dom";

export default function CriarCompromisso() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await createCompromisso(data);
      navigate("/compromissos");
    } catch (err) {
      console.error("Erro ao criar:", err);
      alert("Erro ao criar compromisso");
    }
  };

  return (
    <div className="form">
      <h1>Criar Compromisso</h1>
      <CompromissoForm onSubmit={handleSubmit} />
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate('/calendar')} className="btn-primary">Ver no calendário</button>
      </div>
    </div>
  );
}
