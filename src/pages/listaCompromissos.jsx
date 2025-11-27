import { useEffect, useState } from "react";
import { getCompromissos, deleteCompromisso } from "../services/compromissoService";
import { Link } from "react-router-dom";

export default function ListaCompromissos() {
  const [compromissos, setCompromissos] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getCompromissos();
      setCompromissos(data || []);
    } catch (err) {
      console.error("Erro ao carregar compromissos:", err);
    }
  };

  const remove = async (id) => {
    if (confirm("Tem certeza?")) {
      try {
        await deleteCompromisso(id);
        load();
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
    }
  };

  return (
    <div className="form">
      <h1>Compromissos</h1>
      <Link to="/compromissos/create">Criar Novo</Link>

      {compromissos.map((c) => (
        <div key={c.id} style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <h3>{c.title}</h3>
          <p>{c.date} {c.start_time}</p>
          {c.description && <p>{c.description}</p>}
          <Link to={`/compromissos/edit/${c.id}`}>Editar</Link>
          <button onClick={() => remove(c.id)} style={{ marginLeft: 8 }}>Excluir</button>
        </div>
      ))}
    </div>
  );
}
