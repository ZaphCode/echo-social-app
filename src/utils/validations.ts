import { RegisterOptions } from "react-hook-form";

export const validEmailRules: RegisterOptions = {
  required: "El correo es requerido",
  pattern: {
    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "El correo no es válido",
  },
};

export const validDateRules: RegisterOptions = {
  required: "La fecha es requerida",
  validate: (value) => {
    const date = new Date(value);

    if (isNaN(date.getTime())) return "La fecha no es válida";

    if (date < new Date()) return "La fecha no puede ser anterior a hoy";

    return true;
  },
};

export const validPriceRules: RegisterOptions = {
  required: "El precio es requerido",
  pattern: {
    value: /^[0-9]+(\.[0-9]{1,2})?$/,
    message: "El precio no es válido",
  },
  validate: (value) => {
    const price = parseFloat(value);
    if (price <= 0) return "El precio debe ser mayor a cero";
    return true;
  },
};
