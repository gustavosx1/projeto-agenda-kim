import { useState } from "react";

export default function CompromissoForm({ initialData = {}, onSubmit }) {
  const [form, setForm] = useState({
    date: initialData.date || "",
    start_time: initialData.start_time || "",
    end_time: initialData.end_time || "",
    title: initialData.title || "",
    description: initialData.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      className="agenda-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="form-field">
        <label htmlFor="date">Data</label>
        <input id="date" type="date" name="date" value={form.date} onChange={handleChange} />
      </div>

      <div className="form-row">
        <div className="form-field" style={{ flex: 1 }}>
          <label htmlFor="start_time">Hora início</label>
          <input id="start_time" type="time" name="start_time" value={form.start_time} onChange={handleChange} />
        </div>
        <div className="form-field" style={{ flex: 1 }}>
          <label htmlFor="end_time">Hora fim</label>
          <input id="end_time" type="time" name="end_time" value={form.end_time} onChange={handleChange} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="title">Título</label>
        <input id="title" type="text" name="title" value={form.title} onChange={handleChange} />
      </div>

      <div className="form-field">
        <label htmlFor="description">Descrição</label>
        <textarea id="description" name="description" value={form.description} onChange={handleChange} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  );
}
