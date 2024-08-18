import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useViewportHeight from "../../hooks/useViewportHeight"; // Import the custom hook

const LaunAki: React.FC = () => {
  const [launPerWeek, setlaunPerWeek] = useState<number | "">("");
  const [user, setUser] = useState<any>(null);
  const [showCheckmark, setShowCheckmark] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);
  const navigate = useNavigate();
  const viewportHeight = useViewportHeight(); // Use the custom hook

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
    // 数字以外の文字を削除してセット
    const V = Number(value.replace(/\D/g, ""));
    if (V >= 0 && V <= 21) {
      setlaunPerWeek(value === "" ? "" : Number(value.replace(/\D/g, "")));
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
        }, 500); // 0.5秒後に次のページに遷移
      } catch (error) {
        console.error("Error saving selected option: ", error);
        alert("Error saving selected option.");
      }
    } else {
      alert("数字を入力してください。");
    }
  };

  return (
    <div style={{ ...styles.container, height: viewportHeight-60 }}>
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 60px)',
    backgroundColor: '#1d3557',
    color: '#f4a261',
  },
  header: {
    width: '100%',
    textAlign: 'center' as 'center',
    backgroundColor: '#1d3557',
    padding: '10px 0',
  },
  title: {
    fontSize: '2.5em',
    margin: '0',
  },
  main: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    backgroundColor: '#f1faee',
    padding: '20px',
    borderRadius: '10px',
  },
  questionContainer: {
    textAlign: 'center' as 'center',
    marginBottom: '20px',
  },
  question: {
    fontSize: '1.5em',
    margin: '0',
    color: '#000',
  },
  subQuestion: {
    fontSize: '1em',
    margin: '0',
    color: '#000',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    width: '80%',
    padding: '10px 0',
    margin: '10px 0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
  },
  submitButton: {
    backgroundColor: '#f4a261',
    color: '#1d3557',
    border: 'none',
    padding: '10px 20px',
    margin: '20px 0 0 0',
    fontSize: '1em',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  checkmark: {
    fontSize: '4em',
    color: '#f4a261',
  },
};

export default LaunAki;
