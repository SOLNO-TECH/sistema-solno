import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Funciones asíncronas para leer y escribir en SQLite
export const getStorageData = async (key, defaultData = []) => {
  try {
    const response = await fetch(`/api/store/${key}`);
    
    // Si la base de datos devuelve 404 (no existe), intentamos rescatar los datos viejos de localStorage y migrarlos
    if (response.status === 404) {
      const localData = localStorage.getItem(key);
      if (localData) {
        const parsed = JSON.parse(localData);
        // Subimos silenciosamente los datos a SQLite para que todos los dispositivos lo tengan
        await setStorageData(key, parsed);
        return parsed;
      }
      return defaultData;
    }
    
    if (!response.ok) return defaultData;
    const data = await response.json();
    return data || defaultData;
  } catch (e) {
    console.error("Error reading data from backend", e);
    // Respaldo de emergencia
    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : defaultData;
  }
};

export const setStorageData = async (key, data) => {
  try {
    await fetch(`/api/store/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error("Error saving data to backend", e);
  }
};
