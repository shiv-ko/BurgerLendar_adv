import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Firebaseの初期化済みインスタンスをインポート

interface aki {
  bath: string[];
  food: string[];
  laun: number;
  laundry: number;
  sleep: number;
  smoke: number;
}

interface Event {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface ScheduledTask {
  Title: string;
  deadline: string;
}

const useUserData = (userId: string) => {
  const [akiData, setAkiData] = useState<aki | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduledTask[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ユーザーのAkiデータ取得
        const docRef = doc(db, 'Users_Aki', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as aki;
          setAkiData(data);
        } else {
          console.log('No such document in Users_Aki!');
        }

        // イベントデータ取得
        const eventsRef = query(collection(db, 'users', userId, 'events'));
        const eventsSnapshot = await getDocs(eventsRef);
        const fetchedEvents = eventsSnapshot.docs.map((doc) => ({
          date: doc.data().date,
          name: doc.data().title,
          endTime: doc.data().endTime,
          startTime: doc.data().startTime,
        }));
        setEvents(fetchedEvents);

        // ToDoデータ取得
        const todosRef = query(collection(db, 'users', userId, 'todos'));
        const todosSnapshot = await getDocs(todosRef);
        const fetchedTodos = todosSnapshot.docs.map((doc) => ({
          Title: doc.data().text,
          deadline: doc.data().dueDate,
        }));
        setScheduleTasks(fetchedTodos);

        // ユーザー名取得
        const userRef = doc(db, 'Users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserName(data?.displayName || '');
        } else {
          console.log('No such document in Users!');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return {
    akiData,
    events,
    scheduleTasks,
    userName,
    loading,
    error,
  };
};

export default useUserData;
