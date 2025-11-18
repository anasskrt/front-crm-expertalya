import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Utilisateur } from "@/data/mockData";
import { getProfil } from "@/api/profil";

interface UserContextType {
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    getProfil()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
