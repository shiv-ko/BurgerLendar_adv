import React, { useState, useEffect } from "react";
import { collection, getDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import './ScheduleList.css';  // CSSファイルをインポート
import GenerateBurger from "./GenerateBurger";

interface ScheduleEvent {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  done: boolean;
}
interface BurgerConfig {
  includeMeatCount: number;
  includeCheeseCount: number;
  includeTomatoCount: number;
  includeLettuceCount: number;
}

function getCurrentDateFormatted() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(2);
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return year + month + day;
}

const ScheduleList: React.FC = () => {
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [user, setUser] = useState<any>(null); // 現在のユーザー情報を管理
  const [userid, setUserid] = useState<string>("");
  const [today, setToday] = useState<string>("");
  const [burgerConfig, setBurgerConfig] = useState<BurgerConfig>({
    includeMeatCount: 0,
    includeCheeseCount: 0,
    includeTomatoCount: 0,
    includeLettuceCount: 0,
  });

  // Firebaseからデータを取得する関数
  const fetchScheduleEvents = async (userId: string) => {
    try {
      const scheduleDocRef = doc(db, "Users_Schedule", userId, "schedule", today);
      const scheduleDocSnap = await getDoc(scheduleDocRef);

      if (scheduleDocSnap.exists()) {
        const fetchedEvents = scheduleDocSnap.data().scheduleEvents;
        setScheduleEvents(fetchedEvents);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching schedule events:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setToday(getCurrentDateFormatted());
        setUserid(currentUser.uid);
        setUser(currentUser);
      } else {
        setUserid("error");
      }
    });

    return () => unsubscribe();
  }, []);

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    if (user) {
      fetchScheduleEvents(userid);
    }
  }, [userid]);

  const toggleDone = async (eventIndex: number, currentDone: boolean) => {
    try {
      // スケジュールイベントの状態を更新
      const updatedEvents = [...scheduleEvents];
      updatedEvents[eventIndex].done = !currentDone;
      setScheduleEvents(updatedEvents);

      // Firestoreのドキュメントも更新
      const scheduleDocRef = doc(db, "Users_Schedule", user.uid, "schedule", today);
      await updateDoc(scheduleDocRef, { scheduleEvents: updatedEvents });
    } catch (error) {
      console.error("Error updating schedule event:", error);
    }
  };

  // 現在の時間を取得する関数
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 時刻を分に変換する関数
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const currentTime = getCurrentTime();
  const currentMinutes = timeToMinutes(currentTime);

  return (
  <div className="schedule-container">
    <h1>Today's Schedule</h1>
      <div className="schedule-date">{new Date().toLocaleDateString("ja-JP")}</div>
    
    <div className="schedule-content">

      <ul className="schedule-list">
      {scheduleEvents.map((event, index) => {
        const eventStartMinutes = timeToMinutes(event.startTime);
        const eventEndMinutes = timeToMinutes(event.endTime);

        // 現在の時間がイベントの範囲内にある場合、スタイルを変更
        const isCurrentEvent = currentMinutes >= eventStartMinutes && currentMinutes < eventEndMinutes;

        // 現在の時間がイベントの終了時間を過ぎている場合、スタイルを変更
        const isPastEvent = currentMinutes > eventEndMinutes;
        return (
          <li
            key={index}
            onClick={() => toggleDone(index, event.done)}
            className={`schedule-item 
              ${isCurrentEvent ? "current" : ""}
              ${event.done ? "completed" : ""}
              ${isPastEvent ? "past" : ""}
              ${event.title.toLowerCase().includes("free time") ? "free-time" : ""}
              ${event.title.toLowerCase().includes("sleep") ? "sleep" : ""}`}
          >
            {event.startTime} - {event.endTime}: {event.title}
          </li>
        );
      })}
    </ul>
    </div>
    
  </div>
);


};

export default ScheduleList;
