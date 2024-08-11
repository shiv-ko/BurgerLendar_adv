import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
    userData: { displayName: string } | null;
    setUserData: React.Dispatch<React.SetStateAction<{ displayName: string } | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [userData, setUserData] = useState<{ displayName: string } | null>(null);

    return (
        <UserContext.Provider value={{ userData, setUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
