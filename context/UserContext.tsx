import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getProfil } from "@/api/profil";

interface UserContextType {
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProfil()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
