'use client';

import { createContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [_client,_setClient] = useState();

  return (
    <UserContext.Provider value={{ _client, _setClient }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;