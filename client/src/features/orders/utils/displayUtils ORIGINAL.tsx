import React from 'react';

/**
 * Busca un elemento en una colección por su ID y retorna el valor de un campo específico.
 */
export const findItemById = (
  collection: any[],
  id: string | number,
  fieldName: string,
  defaultValue: string = 'Unknown'
): string => {
  if (!collection || !Array.isArray(collection)) return defaultValue;
  const item = collection.find((item) => item.id === id);
  return item ? item[fieldName] : defaultValue;
};

/**
 * Muestra un valor o, si está vacío, retorna un elemento con un placeholder formateado.
 */
export const displayValue = (value: any): React.ReactNode => {
  if (!value && value !== 0) {
    return (
      <span style={{ color: 'rgba(0, 0, 0, 0.6)', fontStyle: 'italic' }}>
        Not specified
      </span>
    );
  }
  return value;
};
