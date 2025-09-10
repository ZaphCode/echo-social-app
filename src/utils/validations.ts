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

export const validPhoneRules: RegisterOptions = {
  required: "El número telefónico es requerido",
  pattern: {
    // Permite: +52 123 456 7890, 1234567890, 123 456 7890, +521234567890, etc.
    value: /^(\+?\d{1,3})?\s?(\d[\d\s]{8,})$/,
    message: "El número telefónico no es válido",
  },
  validate: (value) => {
    // Quita espacios y +
    const digits = value.replace(/[^\d]/g, "");
    if (digits.length < 10) return "Debe tener al menos 10 dígitos";
    if (digits.length > 15) return "Debe tener máximo 15 dígitos";
    return true;
  },
};

export const validPasswordRules: RegisterOptions = {
  required: "La contraseña es requerida",
  minLength: {
    value: 8,
    message: "La contraseña debe tener al menos 8 caracteres",
  },
  maxLength: {
    value: 20,
    message: "La contraseña no puede tener más de 20 caracteres",
  },
};

export const validConfirmPasswordRules: RegisterOptions = {
  validate: (value, { password }) => {
    if (value !== password) return "Las contraseñas no coinciden";
    return true;
  },
};

export const validNameRules: RegisterOptions = {
  required: "El nombre es requerido",
  minLength: {
    value: 3,
    message: "El nombre debe tener al menos 3 caracteres",
  },
  maxLength: {
    value: 60,
    message: "El nombre no puede tener más de 60 caracteres",
  },
  pattern: {
    value: /^[a-zA-Z\s]+$/,
    message: "El nombre solo puede contener letras y espacios",
  },
};

export const validZipCodeRules: RegisterOptions = {
  required: "El código postal es requerido",
  pattern: {
    value: /^\d{5}$/,
    message: "El código postal debe tener 5 dígitos",
  },
  validate: (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 5)
      return "El código postal debe tener exactamente 5 dígitos";
    return true;
  },
};

export const validYearsRules: RegisterOptions = {
  required: "Este campo es obligatorio",
  pattern: {
    value: /^[0-9]+$/,
    message: "Solo se permiten números enteros",
  },
  validate: (value) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return "Debe ser un número";
    if (num < 0) return "No puede ser negativo";
    if (num > 100) return "¿Seguro que tienes más de 100 años de experiencia?";
    return true;
  },
};

export const validServicesPhotoRules: RegisterOptions = {
  validate: (value) => {
    if (!value || value.length === 0) return "Agrega al menos una foto";
    if (value.length > 5) return "Máximo 5 fotos permitidas";
    return true;
  },
};
