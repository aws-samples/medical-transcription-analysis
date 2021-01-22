import { useContext, createContext } from 'react';

interface AppState {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppState>(null);

export function useAppContext(): AppState {
  return useContext(AppContext);
}
