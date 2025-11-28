import { useState } from "react";

export default function DateMonthInput({ value, onChange, required = false, id = "date" }) {
  // value esperado: "dd/mm" ou vazio
  // formato salvo: "YYYY-MM-DD" no backend, mas aqui lidamos com dd/mm

  const handleChange = (e) => {
    let input = e.target.value;

    // remover caracteres não numéricos
    input = input.replace(/\D/g, "");

    // limitar a 4 caracteres (ddmm)
    if (input.length > 4) {
      input = input.slice(0, 4);
    }

    // formatar como dd/mm
    let formatted = input;
    if (input.length >= 2) {
      formatted = input.slice(0, 2) + "/" + input.slice(2);
    }

    // validar dia (01-31) e mês (01-12)
    if (formatted.length === 5) {
      const [day, month] = formatted.split("/");
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);

      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
        // inválido, mas deixa o usuário continuar digitando
      }
    }

    onChange(formatted);
  };

  return (
    <input
      id={id}
      type="text"
      placeholder="dd/mm"
      value={value}
      onChange={handleChange}
      maxLength="5"
      required={required}
      style={{ fontFamily: "monospace", letterSpacing: "0.1em" }}
    />
  );
}
