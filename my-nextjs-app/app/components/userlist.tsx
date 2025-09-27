//my-nextjs-app/app/components/userlist.tsx
import atualizarListaUsuarios from '../../../methods/updatelist';
type UserInfo = {
    "join": number,
    "platform": number,
    "account": string,
    "in_channel": boolean,
    "role": number,
    "uid": number
}
export default async function Userlist() {
    const users = await atualizarListaUsuarios()
    users.forEach((user) => {
        console.log(user);
    });/*
    
    return <ul>
        {}
    </ul>
}