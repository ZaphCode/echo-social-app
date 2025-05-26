import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme/theme';
import FormInput from '../ui/FormInput';
import { FormData } from './types';

type ProfileFormSectionProps = {
  mode: 'personal' | 'professional';
  form: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
};

export default function ProfileFormSection({ mode, form, onFormChange }: ProfileFormSectionProps) {
  const handleChange = (field: keyof FormData) => (value: string) => {
    onFormChange(field, value);
  };

  if (mode === 'personal') {
    return (
      <>
        <FormInput
          label="Teléfono"
          icon="phone"
          value={form.phone}
          onChangeText={handleChange('phone')}
          placeholder="Tu teléfono"
        />

        <FormInput
          label="Dirección"
          icon="map-pin"
          value={form.address}
          onChangeText={handleChange('address')}
          placeholder="Tu dirección"
        />

        <FormInput
          label="Ciudad"
          icon="map"
          value={form.city}
          onChangeText={handleChange('city')}
          placeholder="Tu ciudad"
        />

        <FormInput
          label="Estado"
          icon="map"
          value={form.state}
          onChangeText={handleChange('state')}
          placeholder="Tu estado"
        />

        <FormInput
          label="Código Postal"
          icon="hash"
          value={form.zip}
          onChangeText={handleChange('zip')}
          placeholder="Tu código postal"
        />
      </>
    );
  }

  return (
    <>
      <FormInput
        label="Descripción"
        icon="info"
        value={form.description}
        onChangeText={handleChange('description')}
        placeholder="Describe tus servicios y experiencia"
        multiline
        numberOfLines={4}
      />

      <FormInput
        label="Años de Experiencia"
        icon="clock"
        value={form.experience_years}
        onChangeText={handleChange('experience_years')}
        placeholder="0"
        keyboardType="numeric"
      />
    </>
  );
} 