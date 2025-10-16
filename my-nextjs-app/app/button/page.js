"use client";
import { useState } from "react";

export default function TestePage() {
  // Botão 1
  const [btn1Color, setBtn1Color] = useState("blue");

  // Botão 2
  const [btn2Color, setBtn2Color] = useState("blue");
  const [btn2Disabled, setBtn2Disabled] = useState(false);

  const handleBtn1Click = () => {
    setBtn1Color(prev => (prev === "blue" ? "green" : "blue"));
  };

  const handleBtn2Click = () => {
    setBtn2Color("green");
    setBtn2Disabled(true);

    setTimeout(() => {
      setBtn2Color("blue");
      setBtn2Disabled(false);
    }, 5000);
  };

  return (
    <>
      <div className="container">
        <button
          onClick={handleBtn1Click}
          style={{ backgroundColor: btn1Color }}
          className="button"
        >
          Botão 1
        </button>

        <button
          onClick={handleBtn2Click}
          disabled={btn2Disabled}
          style={{
            backgroundColor: btn2Color,
            cursor: btn2Disabled ? "not-allowed" : "pointer",
            opacity: btn2Disabled ? 0.7 : 1,
          }}
          className="button"
        >
          {btn2Disabled ? "Aguardando..." : "Botão 2"}
        </button>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background-color: #ffffff; /* fundo neutro */
          padding: 20px; /* opcional, deixa o container um pouco maior que os botões */
          border-radius: 12px; /* opcional, arredonda o container */
        }

        .button {
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          color: white;
          font-size: 18px;
          transition: all 0.3s;
        }
      `}</style>
    </>
  );
}
