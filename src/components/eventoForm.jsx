import { useState } from "react";
import DateMonthInput from "./DateMonthInput";

function getTodayDDMM() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

export default function EventoForm({ initialData = {}, onSubmit, loading = false }) {
  const [isPubli, setIsPubli] = useState(initialData.type === "agenda" || true);
  const [form, setForm] = useState({
    date: initialData.date || "",
    start_time: initialData.start_time || "",
    end_time: initialData.end_time || "",
    title: initialData.title || "",
    description: initialData.description || "",
    instagram: initialData.instagram || "",
    link: initialData.link || "",
    cupom: initialData.cupom || "",
    anexo: initialData.anexo || [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      isPubli,
    });
  };

  return (
    <form className="agenda-form" onSubmit={handleFormSubmit}>

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


      <div className="form-field-row" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="date" style={{ color: "#334155", fontWeight: 600, fontSize: 13 }}>Data (dd/mm)</label>
          <DateMonthInput
            id="date"
            value={form.date}
            onChange={(val) => setForm((prev) => ({ ...prev, date: val }))}
            required
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: "8px" }}>
          <input
            type="checkbox"
            id="hoje_check"
            onChange={(e) => {
              if (e.target.checked) {
                setForm((prev) => ({ ...prev, date: getTodayDDMM() }));
              }
            }}
          />
          <label htmlFor="hoje_check" style={{ margin: 0, fontWeight: 400, fontSize: 12, cursor: "pointer", color: "#334155" }}>
            Hoje
          </label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field" style={{ flex: 1 }}>
          <label htmlFor="start_time">Hora início</label>
          <input
            id="start_time"
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field" style={{ flex: 1 }}>
          <label htmlFor="end_time">Hora fim</label>
          <input
            id="end_time"
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      {/* Campos extras mostrados apenas se for Publi */}
      {isPubli && (
        <>
          <div className="form-field">
            <label htmlFor="instagram">Instagram</label>
            <input
              id="instagram"
              type="text"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="link">Link</label>
            <input
              id="link"
              type="text"
              name="link"
              value={form.link}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="cupom">Cupom</label>
            <input
              id="cupom"
              type="text"
              name="cupom"
              value={form.cupom}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
