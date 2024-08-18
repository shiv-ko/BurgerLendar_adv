import React, { useState, useEffect } from "react";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Unity, { UnityContext } from "react-unity-webgl";
import Modal from "react-modal";
import { isToday } from "date-fns";

interface ScheduleEvent {
  title: string;
  done: boolean;
}

interface BurgerConfig {
  includeMeatCount: number;
  includeCheeseCount: number;
  includeTomatoCount: number;
  includeLettuceCount: number;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    height: "80%",
  },
};

function getCurrentDateFormatted() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(2);
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return year + month + day;
}

const Webgl: React.FC<{ burgerConfig: BurgerConfig }> = ({ burgerConfig }) => {
  const unityContext = new UnityContext({
    loaderUrl: "unity/hamberger.loader.js",
    dataUrl: "unity/hamberger.data",
    frameworkUrl: "unity/hamberger.framework.js",
    codeUrl: "unity/hamberger.wasm",
  });

  useEffect(() => {
    unityContext.on("loaded", () => {
      unityContext.send(
        "Scripts",
        "ConfigureBurger",
        JSON.stringify(burgerConfig)
      );
    });
    return () => {
      unityContext.removeAllEventListeners();
    };
  }, [burgerConfig]);

  const handleScreenshot = () => {
    // unityContext.takeScreenshot("image/png", 1.0).then((screenshot) => {
    //   const link = document.createElement("a");
    //   link.href = screenshot;
    //   link.download = "burger_screenshot.png";
    //   link.click();
    // });
  };

  return (
    <div>
      <Unity unityContext={unityContext} style={{ width: "100%", height: "100%" }} />
      <button onClick={handleScreenshot}>スクリーンショットを保存</button>
    </div>
  );
};

const GenerateBurger: React.FC = () => {
  const [completedEvents, setCompletedEvents] = useState<ScheduleEvent[]>([]);
  const [burgerConfig, setBurgerConfig] = useState<BurgerConfig | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userid, setUserid] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const today = getCurrentDateFormatted();

  // Firebaseから完了したスケジュールを取得
  const fetchCompletedEvents = async (userId: string) => {
    try {
      
      const scheduleDocRef = doc(db, "Users_Schedule", userId, "schedule", today);
      const scheduleDocSnap = await getDoc(scheduleDocRef);

      if (scheduleDocSnap.exists()) {
        const fetchedEvents = scheduleDocSnap.data()?.scheduleEvents || [];
        const filteredEvents = fetchedEvents.filter(
          (event: ScheduleEvent) => event.done
        );
        setCompletedEvents(filteredEvents);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching schedule events:", error);
    }
  };
  // Firebaseにハンバーガー構成を保存
  const saveBurgerConfigToDB = async (config: BurgerConfig) => {
    try {
      const burgerDocRef = doc(db, "Users_Burger", user.uid, "BurgerData", today);
      await setDoc(burgerDocRef, config);
      console.log("Burger configuration saved to Firestore.");
    } catch (error) {
      console.error("Error saving burger configuration to Firestore:", error);
    }
  };
  
  // Firebaseにハンバーガー構成を取得する。
  const fetchBurgerConfigFromDB = async () => {
    try {
      const burgerDocRef = doc(db, "Users_Burger", user.uid, "BurgerData",today);
      const burgerDocSnap = await getDoc(burgerDocRef);
      if (burgerDocSnap.exists()) {
        const savedConfig = burgerDocSnap.data() as BurgerConfig;
        console.log("Fetched burger configuration from Firestore:", savedConfig);
        return savedConfig;
      } else {
        console.log("No burger configuration found in Firestore.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching burger configuration from Firestore:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserid(currentUser.uid);
        setUser(currentUser);
        fetchCompletedEvents(userid);

      } else {
        setUserid("");
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (userid) {
      fetchCompletedEvents(userid);
    }
  }, [userid]); 


  //生成ボタンを押した時に呼び出される関数
  //ハンバーガー構成がすでにある場合は、それを取得してモーダルを開く
  //ハンバーガー構成がない場合は、OpenAI APIを使用して新しい構成を生成し、Firestoreに保存する
  const generateBurgerConfig = async () => {
    setLoading(true);

    // Firebaseから既存のハンバーガー構成を取得
    const existingConfig = await fetchBurgerConfigFromDB();
    if (existingConfig) {
      setBurgerConfig(existingConfig);
      setModalIsOpen(true); // モーダルを開く
      setLoading(false);
      return;
    }

    const completedTasks = completedEvents.map((event) => event.title);

    try {
      const prompt = `
        ${completedEvents
          .map((ScheduledTask) => `Title: ${ScheduledTask.title}`)
          .join("\n")}
        Please categorize these schedule(if done is True) into:
        1. Work/School/Studies
        2. Personal Appointments
        3. Entertainment
        4. Exercise
        And count how many items fall into each category. 
        Output the results in an array format representing the count for each category.
        for example [1, 2, 3, 4] means 1 item in category 1, 2 items in category 2, 3 items in category 3, 4 items in category 4.
      `;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const classification = response.data.choices[0].message.content.trim();
      const parsedClassification = JSON.parse(classification);
      //OpenAI APIからのレスポンスをハンバーガー構成として保存
      if (Array.isArray(parsedClassification) && parsedClassification.length === 4) {
        const newConfig: BurgerConfig = {
          includeMeatCount: parsedClassification[0],
          includeCheeseCount: parsedClassification[1],
          includeTomatoCount: parsedClassification[2],
          includeLettuceCount: parsedClassification[3],
        };
        setBurgerConfig(newConfig);
        setModalIsOpen(true); // モーダルを開く
        // 新しいハンバーガー構成をFirestoreに保存
        await saveBurgerConfigToDB(newConfig);
      } else {
        console.error("Unexpected response format:", classification);
      }
    } catch (error) {
      console.error("Error fetching from OpenAI API:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div>
      
      <button onClick={generateBurgerConfig} disabled={loading}>
        {loading ? "Generating..." : "ハンバーガー生成"}
      </button>

      {/* モーダルの表示 */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Burger Configuration Modal"
      >
        <button onClick={closeModal}>閉じる</button>
        {burgerConfig && (
          <div>
            <p>Meat Count: {burgerConfig.includeMeatCount}</p>
            <p>Cheese Count: {burgerConfig.includeCheeseCount}</p>
            <p>Tomato Count: {burgerConfig.includeTomatoCount}</p>
            <p>Lettuce Count: {burgerConfig.includeLettuceCount}</p>

            {/* Webgl コンポーネントの表示 */}
            <Webgl burgerConfig={burgerConfig} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GenerateBurger;
