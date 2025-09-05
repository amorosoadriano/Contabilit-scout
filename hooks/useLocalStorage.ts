import { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T, migrationFunc?: (data: any) => T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      let parsedData = JSON.parse(item);
      
      if (migrationFunc) {
        parsedData = migrationFunc(parsedData);
      }
      
      return parsedData;
    } catch (error) {
      console.error(`Error reading or migrating localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore =
        typeof storedValue === 'function'
          ? storedValue(storedValue)
          : storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;