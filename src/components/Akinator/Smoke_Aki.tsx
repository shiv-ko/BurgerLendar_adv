import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import useViewportHeight from "../../hooks/useViewportHeight"; 
import styles from './CommonStyles';

const Aki_Smoke: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showCheckmark, setShowCheckmark] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);
  const navigate = useNavigate();
  const [cigarettesPerDay, setCigarettesPerDay] = useState<number | "">("");
  const viewportHeight = useViewportHeight();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCigarettesPerDay(value === "" ? "" : Number(value.replace(/\D/g, "")));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("ユーザーがログインしていません");
      return;
    }

    if (cigarettesPerDay !== "") {
      try {
        const userSmokeRef = doc(db, "Users_Aki", user.uid);
        await setDoc(
          userSmokeRef,
          {
            smoke: cigarettesPerDay,
            created_at: serverTimestamp(),
          },
          { merge: true }
        );
        setShowCheckmark(true);
        setTimeout(() => {
          setShowCheckmark(false);
          navigate("/modeselector");
        }, 500);
      } catch (error) {
        console.error("Error saving selected option: ", error);
        alert("Error saving selected option.");
      }
    } else {
      alert("オプションを選択してください");
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
              <h2 style={styles.question}>質問4/4:</h2>
              <p style={styles.subQuestion}>タバコ1日に何本吸いますか？</p>
            </div>
            <div style={styles.optionsContainer}>
              <input
                type="text"
                id="cigarettes"
                value={cigarettesPerDay}
                onChange={handleChange}
              />
              <p style={styles.subQuestion}>本/日</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={cigarettesPerDay === ""}
              style={{
                ...styles.submitButton,
                backgroundColor:
                  cigarettesPerDay === "" ? "#ccc" : "#f4a261",
                cursor: cigarettesPerDay === "" ? "not-allowed" : "pointer",
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

export default Aki_Smoke;
