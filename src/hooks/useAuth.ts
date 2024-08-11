import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userData, setUserData] = useState<{ displayName?: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = async (uid: string) => {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, 'Users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  };

  const checkAdminPermission = (data: any) => {
    return data?.isAdmin || false;
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setIsLoading(true);
      try {
        if (currentUser) {
          const data = await fetchUserData(currentUser.uid);
          setUser(currentUser);
          setUserData(data);
          setIsAdmin(checkAdminPermission(data));
        } else {
          setUser(null);
          setUserData(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error during authentication state change:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("User signed out."); // デバッグ用ログ
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { user, isAdmin, userData, isLoading, handleLogout };
};

export default useAuth;
