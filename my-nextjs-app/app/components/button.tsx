'use client';

export default function Botao() {
  function handleClick() {
    const nome = "Claudio";
    alert(`Olá, ${nome}!`);
  }
  
    return <button onClick={handleClick} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Iniciar</button>;
}