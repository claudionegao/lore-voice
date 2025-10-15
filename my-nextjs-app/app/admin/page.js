"use client";

export default function AdminPage() {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white flex items-center justify-center">
      {/* Fundo escurecido */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Caixa central */}
      <div className="relative bg-gray-800 p-6 rounded-2xl shadow-lg w-80 text-center z-10">
        <h2 className="text-xl mb-4 font-semibold">Digite a senha</h2>
        <input
          type="password"
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white text-center outline-none"
          placeholder="Senha..."
        />
        <button className="w-full bg-green-600 hover:bg-green-700 transition p-2 rounded-lg font-semibold">
          Entrar
        </button>
      </div>
    </div>
  );
}
