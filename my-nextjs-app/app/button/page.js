"use client";
import React, { useState } from "react";

export default function TestePage() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <button
        onClick={() => setClicked(!clicked)}
        className={`px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 ${
          clicked ? "bg-green-500" : "bg-blue-500"
        }`}
      >
        {clicked ? "Clicado!" : "Clique em mim"}
      </button>
    </div>
  );
}
