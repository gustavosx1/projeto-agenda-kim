
import { useEffect, useState } from "react";
import { getAgendaById, updateAgenda } from "../services/agendaService.js";
import { useParams, useNavigate } from "react-router-dom";
import AgendaForm from "../components/agendaForm";

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agenda, setAgenda] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getAgendaById(id);
    setAgenda(data);
  };

  const handleSubmit = async (form) => {
    await updateAgenda(id, form);
    navigate("/calendar");
  };

  if (!agenda) return <p>Carregando...</p>;

  return (
    <div className="form">
      <h1>{agenda.title || "(sem título)"}</h1>
      <AgendaForm initialData={agenda} onSubmit={handleSubmit} />
    </div>
  );
}
