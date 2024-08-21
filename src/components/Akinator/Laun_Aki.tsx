import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import useViewportHeight from "../../hooks/useViewportHeight"; 
import styles from './CommonStyles';

const LaunAki: React.FC = () => {
  const [launPerWeek, setLaunPerWeek] = useState<number | "">("");
  const [user, setUser] = useState<any>(null);
  const [showCheckmark, setShowCheckmark] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);
  const navigate = useNavigate();
  const viewportHeight = useViewportHeight();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const V = Number(value.replace(/\D/g, ""));
    if (V >= 0 && V <= 21) {
      setLaunPerWeek(value === "" ? "" : Number(value.replace(/\D/g, "")));
    } else {
      alert("0から21の数字を入力してください");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("ユーザーがログインしていません");
      return;
    }

    if (launPerWeek !== "") {
      try {
        const userSleepRef = doc(db, "Users_Aki", user.uid);
        await setDoc(
          userSleepRef,
          {
            laundry: launPerWeek,
            created_at: serverTimestamp(),
          },
          { merge: true }
        );
        setShowCheckmark(true);
        setTimeout(() => {
          setShowCheckmark(false);
          navigate("/smoke");
        }, 500);
      } catch (error) {
        console.error("Error saving selected option: ", error);
        alert("Error saving selected option.");
      }
    } else {
      alert("数字を入力してください。");
    }
  };

  return (
    <div style={{ ...styles.container, height: viewportHeight - 60 }}>
      <header style={styles.header}>
        <h1 style={styles.title}>BurgerNator</h1>
      </header>
      <main style={styles.main}>
        {showCheckmark ? (
          <CheckCircleOutlineIcon style={styles.checkmark} />
        ) : (
          <>
            <div style={styles.questionContainer}>
              <img 
                src="/image/akinator.png" 
                alt="Akinator" 
                style={styles.akinatorImage}
              />
              <h2 style={styles.question}>質問4/5:</h2>
              <p style={styles.subQuestion}>洗濯を週何回の頻度でしますか？</p>
            </div>
            <div style={styles.optionsContainer}>
              <input
                type="text"
                id="cigarettes"
                value={launPerWeek}
                onChange={handleChange}
              />
              <p style={styles.subQuestion}>回/週</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={launPerWeek === ""}
              style={{
                ...styles.submitButton,
                backgroundColor: launPerWeek === "" ? "#ccc" : "#f4a261",
                cursor: launPerWeek === "" ? "not-allowed" : "pointer",
              }}
              onMouseEnter={() => {
                setHovered(true);
              }}
              onMouseLeave={() => {
                setHovered(false);
              }}
            >
              決定
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default LaunAki;
