"use client";
import React, { useState , useContext,useEffect } from 'react';
import { RtcRole, RtcTokenBuilder } from "agora-access-token";
import { useRouter } from 'next/navigation';
import UserContext   from '../context/UserContext';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

const NameForm = () => {
    const [name, setName] = useState('');
    const [AgoraRTC, setAgoraRTC] = useState(null);
    const router = useRouter();
    const { user, setUsers, _client, _setClient } = useContext(UserContext);
    useEffect(() => {
    import('agora-rtc-sdk-ng').then((mod) => {
        setAgoraRTC(mod.default);
    });
    }, []);
    _setClient(AgoraRTC);
    async function handleSubmit(e) {
        e.preventDefault();
        if (!AgoraRTC) return;
        const user = {nome:name,id:0,skill:"jogador"}
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        _setClient(client)
        const channel = 'LoreVoice';
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const res = await fetch("/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel,name}),
        });
        console.log(res)
        const token = res.token; // ou seu token se tiver
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
                disabled={!AgoraRTC}
            >
                Connect
            </button>
        </form>
    );
};

export default NameForm;