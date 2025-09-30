"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContext } from '../context/UserContext';
import AgoraRTC ,{ microphoneTrack } from 'agora-rtc-sdk-ng';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

const NameForm = () => {
    const [name, setName] = useState('');
    const router = useRouter();
    const { user, setUsers, _client, _setClient } = useContext();
    const AgoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setClient(AgoraClient);
    function handleSubmit(e) {
        e.preventDefault();
        const user = {nome=name,id=0,skill="jogador"}
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        setClient(client);
        const token = null; // ou seu token se tiver
        const channel = 'LoreVoice';
        await client.join(appId, channel, token, name);
        const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([microphoneTrack]);
        router.push(`/nome?nome=${encodeURIComponent(name)}`);
        };
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