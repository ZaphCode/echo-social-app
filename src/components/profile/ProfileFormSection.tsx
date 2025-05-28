import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme/theme';
import { useForm, Control } from 'react-hook-form';
import Field from '../ui/Field';
import { FormData } from './types';

type ProfileFormSectionProps = {
  mode: 'personal' | 'professional';
  form: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  control: Control<FormData>;
};

export default function ProfileFormSection({ mode, control }: ProfileFormSectionProps) {
  if (mode === 'personal') {
    return (
      <>
        <Field
          label="Teléfono"
          icon="phone"
          name="phone"
          control={control}
          placeholder="Tu teléfono"
          keyboardType="numeric"
        />

        <Field
          label="Dirección"
          icon="map-pin"
          name="address"
          control={control}
          placeholder="Tu dirección"
        />

        <Field
          label="Ciudad"
          icon="map"
          name="city"
          control={control}
          placeholder="Tu ciudad"
        />

        <Field
          label="Estado"
          icon="map"
          name="state"
          control={control}
          placeholder="Tu estado"
        />

        <Field
          label="Código Postal"
          icon="hash"
          name="zip"
          control={control}
          placeholder="Tu código postal"
          keyboardType="numeric"
        />
      </>
    );
  }

  return (
    <>
      <Field
        label="Descripción"
        icon="info"
        name="description"
        control={control}
        placeholder="Describe tus servicios y experiencia"
      />

      <Field
        label="Años de Experiencia"
        icon="clock"
        name="experience_years"
        control={control}
        placeholder="0"
        keyboardType="numeric"
      />
    </>
  );
} 