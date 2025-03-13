import React from 'react';

/**
 * Helper function to find an item by ID in a collection and return a specific field
 * 
 * @param {Array} collection - Collection of items to search
 * @param {string|number} id - ID to search for
 * @param {string} fieldName - Name of the field to return
 * @param {string} defaultValue - Default value if not found
 * @returns {string} The field value or default
 */
export const findItemById = (collection, id, fieldName, defaultValue = 'Unknown') => {
  if (!collection || !Array.isArray(collection)) return defaultValue;
  const item = collection.find(item => item.id === id);
  return item ? item[fieldName] : defaultValue;
};

/**
 * Helper function to display empty values in a consistent way
 * 
 * @param {any} value - Value to display
 * @returns {React.ReactNode} Formatted value or placeholder
 */
export const displayValue = (value) => {
  if (!value && value !== 0) {
    return <span style={{ color: 'rgba(0, 0, 0, 0.6)', fontStyle: 'italic' }}>Not specified</span>;
  }
  return value;
};