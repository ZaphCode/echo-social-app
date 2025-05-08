import { RegisterOptions } from "react-hook-form";

export const isValidEmail: RegisterOptions = {
  required: "El campo es requerido",
  pattern: {
    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "El correo no es válido",
  },
};
