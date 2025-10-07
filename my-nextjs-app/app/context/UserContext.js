'use client';

import { createContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [users, setUsers] = useState([{ nome: '', id: 0, skill: '' }]);
  const [_client,_setClient] = useState();
  const [ _mClient, _setMclient] = useState();

  return (
    <UserContext.Provider value={{ users, _client,_mClient, _setClient, setUsers,_setMclient }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;