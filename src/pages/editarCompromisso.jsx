import { useEffect, useState } from "react";
import { getCompromissoById, updateCompromisso } from "../services/compromissoService.js";
import { useParams, useNavigate } from "react-router-dom";
import CompromissoForm from "../components/compromissoForm";

export default function EditarCompromisso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compromisso, setCompromisso] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getCompromissoById(id);
      setCompromisso(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    }
  };

  const handleSubmit = async (form) => {
    try {
      await updateCompromisso(id, form);
      navigate("/calendar");
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      alert("Erro ao atualizar compromisso");
    }
  };

  if (!compromisso) return <p>Carregando...</p>;

  return (
    <div className="form">
      <h1>{compromisso.title || "(sem título)"}</h1>
      <CompromissoForm initialData={compromisso} onSubmit={handleSubmit} />
    </div>
  );
}
