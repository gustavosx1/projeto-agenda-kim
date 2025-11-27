
import { useEffect, useState } from "react";
import { getAgendas, deleteAgenda } from "../services/agendaService";
import { Link, useNavigate } from "react-router-dom";

export default function List() {
  const [agendas, setAgendas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getAgendas();
    setAgendas(data);
  };

  const remove = async (id) => {
    await deleteAgenda(id);
    load();
  };

  return (
    <div>
      <h1>Agendas</h1>
      <Link to="/agendas/create">Criar Nova</Link>
      <button style={{ marginLeft: 12 }} onClick={() => navigate('/calendar')} className="btn-primary">Ver calendário</button>

      {agendas.map((a) => (
        <div key={a.id}>
          <h3>{a.title}</h3>
          <p>{a.date}</p>
          <Link to={`/agendas/edit/${a.id}`}>Editar</Link>
          <button onClick={() => remove(a.id)}>Excluir</button>
        </div>
      ))}
    </div>
  );
}

