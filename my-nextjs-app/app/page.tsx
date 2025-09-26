"use client";
import Formulario from "./components/formulario";
import { UserProvider } from "./context/UserContext";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <UserProvider>
        <Formulario />
      </UserProvider>
    </div>

  );
}
