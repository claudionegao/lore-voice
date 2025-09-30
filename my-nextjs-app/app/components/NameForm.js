"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const NameForm: React.FC = () => {
    const [name, setName] = useState('');
    const router = useRouter();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (name.trim()) {
            router.push(`/nome?nome=${encodeURIComponent(name)}`);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto">
            <label htmlFor="name" className="text-lg font-semibold text-gray-700">Qual seu nome?</label>
            <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Digite seu nome"
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
            />
            <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition"
            >
                Connect
            </button>
        </form>
    );
};

export default NameForm;