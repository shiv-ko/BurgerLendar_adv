import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import useViewportHeight from "../../hooks/useViewportHeight"; 
import styles from './CommonStyles';

const FoodAki: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [showCheckmark, setShowCheckmark] = useState<boolean>(false);
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

  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((opt) => opt !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("ユーザーがログインしていません");
      return;
    }
    if (selectedOptions.length === 0) {
      console.error("オプションを選択してください");
    }

    try {
      const userAkiRef = doc(db, "Users_Aki", user.uid);
      await setDoc(
        userAkiRef,
        {
          food: selectedOptions,
          created_at: serverTimestamp(),
        },
        { merge: true }
      );
      console.log("Selected options saved successfully.");
      setShowCheckmark(true);
      setTimeout(() => {
        setShowCheckmark(false);
        navigate("/sleep");
      }, 500);
    } catch (error) {
      console.error("Error saving selected options: ", error);
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
              <img src="/image/akinator.png" alt="Akinator" 
              style={styles.akinatorImage}
              />
              
              <h2 style={styles.question}>質問2/4:</h2>
              <p style={styles.subQuestion}>
                食事をいつしますか？（複数選択可）
              </p>
            </div>
            <div style={styles.optionsContainer}>
              {["朝", "昼", "夜"].map((option) => (
                <button
                  key={option}
                  style={{
                    ...styles.optionButton,
                    backgroundColor: selectedOptions.includes(option)
                      ? "#f4a261"
                      : "#f1faee",
                  }}
                  onClick={() => handleOptionToggle(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button style={styles.submitButton} onClick={handleSubmit}>
              決定
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default FoodAki;
