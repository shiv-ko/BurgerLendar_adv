import React, { useState, useEffect } from "react";
import Edu from "./GPT";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore"; // Firebase Firestoreのインポート
import { getAuth } from "firebase/auth"; // Firebase Authのインポート

interface AppProps {
  mode: string;
}

interface ScheduleEvent {
  done: boolean;
  endTime: string;
  startTime: string;
  title: string;
}

const GPT: React.FC<AppProps> = ({ mode }) => {
  const [output, setOutput] = useState<string>(""); // outputをstring型に変更
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const getCurrentDateFormatted = (): string => {
    const date = new Date();
    const year = String(date.getFullYear()).slice(-2); // 年の下2桁を取得
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月を2桁にフォーマット
    const day = String(date.getDate()).padStart(2, '0'); // 日を2桁にフォーマット
    return `${year}${month}${day}`; // YYMMDD形式で返す
  };

  const parseOutputToScheduleEvents = (output: string): ScheduleEvent[] => {
    const lines = output.split("\n"); // 改行で分割して各行を取得
    const scheduleEvents: ScheduleEvent[] = [];

    lines.forEach(line => {
      const match = line.match(/(\d{2}:\d{2}) - (.+)/);
      if (match) {
        const startTime = match[1];
        const title = match[2].trim();

        // 無視するべき内容はスキップ
        if (title.startsWith("Schedule") || title.startsWith("Task")) {
          return;
        }

        // 前のイベントの終了時間を更新
        const lastEvent = scheduleEvents[scheduleEvents.length - 1];
        if (lastEvent) {
          lastEvent.endTime = startTime;
        }

        // 新しいイベントを追加
        scheduleEvents.push({
          done: false,
          startTime: startTime,
          endTime: "", // 次のイベントが見つかるまで空にしておく
          title: title,
        });
      }
    });

    // 最後のイベントの終了時間を指定（例: 23:59など）
    if (scheduleEvents.length > 0) {
      scheduleEvents[scheduleEvents.length - 1].endTime = "23:59";
    }

    return scheduleEvents;
  };

  const handleAddSchedule = async (userId: string, scheduleEvents: ScheduleEvent[]): Promise<void> => {
    const currentDate = getCurrentDateFormatted();

    try {
      // Users_Schedule コレクション -> userId ドキュメント -> schedule サブコレクション -> currentDate ドキュメント
      const scheduleRef = collection(db, "Users_Schedule", userId, "schedule");
      const docRef = doc(scheduleRef, currentDate);

      // データをFirebaseに保存
      await setDoc(docRef, { scheduleEvents });
      console.log("Event has been added!");
    } catch (error) {
      console.error("Error adding event: ", error);
      console.log("Failed to add event");
    }
  };

  useEffect(() => {
    const saveOutputAndNavigate = async () => {
      if (output !== "" && user) {
        const scheduleEvents = parseOutputToScheduleEvents(output);
        if (scheduleEvents.length > 0) {
          // Firebaseにスケジュールイベントを保存
          await handleAddSchedule(user.uid, scheduleEvents);
          // 保存が成功したら、ナビゲートする
          navigate("/ScheduleList");
        }
      }
    };

    saveOutputAndNavigate();
  }, [output, navigate, db, user]);

  return (
    <div>
      {output === "" && <Edu setOutput={setOutput} mode={mode} />}
    </div>
  );
};

export default GPT;
