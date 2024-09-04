import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadString } from "firebase/storage";
import Unity, { UnityContext } from "react-unity-webgl";
import html2canvas from "html2canvas";
import ScreenShot from './Shot/ScreenShot';

interface UnityInstanceUrls {
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  loaderUrl: string;
}

interface BurgerConfig {
  includeMeatCount: number;
  includeCheeseCount: number;
  includeTomatoCount: number;
  includeLettuceCount: number;
}

const Memories: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [unityInstanceUrl, setUnityInstanceUrl] = useState<UnityInstanceUrls | null>({
    loaderUrl: "/unity/hamberger.loader.js",
    dataUrl: "/unity/hamberger.data",
    frameworkUrl: "/unity/hamberger.framework.js",
    codeUrl: "/unity/hamberger.wasm",
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [burgerConfig, setBurgerConfig] = useState<BurgerConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [isUnityVisible, setIsUnityVisible] = useState(true); // Unity表示の制御用

  // UnityContextを初期化して、再利用するためのuseRef
  const unityContextRef = useRef<UnityContext | null>(null);
  const unityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userEventsRef = collection(db, "Users_Burger", currentUser.uid, "BurgerData");
          const snapshot = await getDocs(userEventsRef);
          const datesWithEvents = snapshot.docs.map((doc) => doc.id);
          setEvents(datesWithEvents);
        } catch (error) {
          setError("Failed to load event data.");
          console.error("Error loading event data: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
  }, []);

  const handleMonthChange = (direction: "prev" | "next") => {
    setIsUnityVisible(false); // WebGLを非表示にする
    if (direction === "prev") {
      setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
      if (currentMonth === 0) {
        setCurrentYear((prev) => prev - 1);
      }
    } else {
      setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
      if (currentMonth === 11) {
        setCurrentYear((prev) => prev + 1);
      }
    }
    setTimeout(() => setIsUnityVisible(true), 1000); // 1秒後にWebGLを再表示
  };

  const handleDateClick = async (date: number) => {
    const yymmdd = formatDate(new Date(currentYear, currentMonth, date));

    // 新しい日付が選択された場合にのみ処理を実行する
    if (yymmdd !== selectedDate) {
      setSelectedDate(yymmdd);
      const selectedDateObj = new Date(currentYear, currentMonth, date);
      const isBeforeToday = selectedDateObj < today;
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);

      if (isBeforeToday && selectedDateObj <= twoDaysAgo) {
        try {
          const db = getFirestore();
          const currentUser = getAuth().currentUser;

          if (currentUser) {
            const docRef = doc(db, "Users_Burger", currentUser.uid, "BurgerData", yymmdd);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              setShowGenerateButton(true);
            } else {
              setShowGenerateButton(false);
            }
          } else {
            setShowGenerateButton(false);
          }
        } catch (error) {
          console.error("Error retrieving data:", error);
          setShowGenerateButton(false);
        }
      } else {
        setShowGenerateButton(false);
      }

      setBurgerConfig(null); // WebGL表示をリセット
    }
  };

  const handleGenerateBurgerClick = async () => {
    setShowGenerateButton(false);

    const db = getFirestore();
    const currentUser = getAuth().currentUser;

    if (currentUser && selectedDate) {
      try {
        const docRef = doc(db, "Users_Burger", currentUser.uid, "BurgerData", selectedDate);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const parsedData: BurgerConfig = {
            includeMeatCount: parseInt(data.includeMeatCount, 10),
            includeCheeseCount: parseInt(data.includeCheeseCount, 10),
            includeTomatoCount: parseInt(data.includeTomatoCount, 10),
            includeLettuceCount: parseInt(data.includeLettuceCount, 10),
          };
          setBurgerConfig(parsedData);
        } else {
          setBurgerConfig(null);
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    }
  };

  const handleCaptureScreenshot = async () => {
    if (!unityRef.current || !user || !selectedDate) return;

    try {
      const canvas = await html2canvas(unityRef.current, { useCORS: true });
      const squareCanvas = document.createElement('canvas');
      const squareSize = Math.max(canvas.width, canvas.height);
      squareCanvas.width = squareSize;
      squareCanvas.height = squareSize;
      const context = squareCanvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, squareSize, squareSize);
        context.drawImage(canvas, (squareSize - canvas.width) / 2, (squareSize - canvas.height) / 2);
      }
      const imageData = squareCanvas.toDataURL("image/png");

      const storage = getStorage();
      const storagePath = `User_Collection/${user.uid}/${selectedDate}.png`;
      const imageRef = storageRef(storage, storagePath);

      await uploadString(imageRef, imageData, "data_url");
      setShowSuccessMessage(true);
      setIsModalOpen(false);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error saving screenshot: ", error);
    }
  };

  const UnityInstance: React.FC<{ files: UnityInstanceUrls }> = ({ files }) => {
    if (!unityContextRef.current) {
      unityContextRef.current = new UnityContext({
        loaderUrl: files.loaderUrl,
        dataUrl: files.dataUrl,
        frameworkUrl: files.frameworkUrl,
        codeUrl: files.codeUrl,
        webglContextAttributes: {
          preserveDrawingBuffer: true,
        },
      });
    }

    useEffect(() => {
      if (burgerConfig) {
        unityContextRef.current?.on("loaded", () => {
          unityContextRef.current?.send("Scripts", "ConfigureBurger", JSON.stringify(burgerConfig));
        });
      }
    }, [burgerConfig]);

    useEffect(() => {
      return () => {
        unityContextRef.current?.removeAllEventListeners();
      };
    }, []);

    return (
      <Unity
        unityContext={unityContextRef.current}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          width: "100%",
          height: `${viewportHeight - 480}px`,
        }}
      />
    );
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  return (
    <div className="w-full flex flex-col items-start justify-start" style={{ height: `${viewportHeight - 120}px`, backgroundColor: "#F9ECCB" }}>
      {showSuccessMessage && <div className="popup">Screenshot saved successfully!</div>}
      <div className="header w-full shadow-md rounded-lg overflow-hidden bg-white">
        <div className="flex items-center justify-between p-4" style={{ backgroundColor: "#1a237e" }}>
          <button className="text-gray-500" onClick={() => handleMonthChange("prev")}>
            &lt;
          </button>
          <h2 className="text-lg font-bold text-white cursor-pointer">{`${currentYear}年${currentMonth + 1}月`}</h2>
          <button className="text-gray-500" onClick={() => handleMonthChange("next")}>
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 text-center border-t border-b bg-white">
          {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
            <div key={index} className="py-2 text-sm text-gray-700">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center bg-white">
          {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, index) => (
            <div key={index} className="py-2"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, dateIndex) => {
            const date = dateIndex + 1;
            const yymmdd = formatDate(new Date(currentYear, currentMonth, date));
            const hasEvent = events.includes(yymmdd);
            const isToday = date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            return (
              <div
                key={dateIndex}
                className={`py-2 relative cursor-pointer ${selectedDate === yymmdd ? "bg-blue-500 text-white" : "text-gray-900"} ${
                  isToday && selectedDate !== yymmdd ? "text-red-500" : ""
                } ${hasEvent ? "bg-red-500 text-white" : ""}`}
                onClick={() => handleDateClick(date)}
              >
                {date}
              </div>
            );
          })}
        </div>
      </div>

      {showGenerateButton && (
        <div className="absolute left-0 right-0 flex items-center justify-center" style={{ top: "50%", transform: "translateY(-50%)" }}>
          <button
            onClick={handleGenerateBurgerClick}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ハンバーガー生成
          </button>
        </div>
      )}

      {isUnityVisible && unityInstanceUrl && burgerConfig && (
        <div className="relative" style={{ width: "100%" }}>
          <div
            ref={unityRef}
            style={{
              position: "relative",
              width: "100%",
              height: `${viewportHeight - 480}px`,
            }}
            onClick={() => setIsModalOpen(true)}
            onTouchStart={() => setIsModalOpen(true)} 
          >
            <UnityInstance files={unityInstanceUrl} />
          </div>
        </div>
      )}

      <ScreenShot 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCapture={handleCaptureScreenshot} 
      />

      <style>{`
        .calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          margin-top: 20px;
        }
        .day {
          padding: 10px;
          text-align: center;
          cursor: pointer;
          border: 1px solid #ccc;
        }
        .day.has-event {
          background-color: red;
          color: white;
        }
        .day.today {
          border: 2px solid blue;
        }
        .popup {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #4caf50;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Memories;
