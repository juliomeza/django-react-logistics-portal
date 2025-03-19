import React from 'react';

/**
 * Tipo para colecciones de objetos con id
 */
type ItemCollection<T> = Array<T & { id: number | string }>;

/**
 * Busca un elemento en una colección por su ID y retorna el valor de un campo específico.
 */
export const findItemById = <T extends Record<string, unknown>>(
  collection: ItemCollection<T>,
  id: string | number,
  fieldName: keyof T,
  defaultValue: string = 'Unknown'
): string => {
  if (!collection || !Array.isArray(collection)) return defaultValue;
  const item = collection.find((item) => item.id === id);
  return item ? String(item[fieldName]) : defaultValue;
};

/**
 * Muestra un valor o, si está vacío, retorna un elemento con un placeholder formateado.
 */
export const displayValue = (value: React.ReactNode): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return (
      <span style={{ color: 'rgba(0, 0, 0, 0.6)', fontStyle: 'italic' }}>
        Not specified
      </span>
    );
  }
  return value;
};