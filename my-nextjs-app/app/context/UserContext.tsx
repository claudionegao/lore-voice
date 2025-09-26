'use client';

import { createContext, useContext, useState, ReactNode } from "react";

// 1️⃣ Define o formato dos dados que o contexto vai guardar
type UserContextType = {
  nome: string;
  tipo: string;
  setNome: (nome: string) => void;
  setTipo: (tipo: string) => void;
};

// 2️⃣ Cria o contexto com valor inicial undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// 3️⃣ Cria o provider que vai envolver os componentes e fornecer os dados
export function UserProvider({ children }: { children: ReactNode }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");

  return (
    <UserContext.Provider value={{ nome, tipo, setNome, setTipo }}>
      {children}
    </UserContext.Provider>
  );
}

// 4️⃣ Cria um hook personalizado para acessar o contexto facilmente
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
}
