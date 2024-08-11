// components/chatGPT/loading/welcometoBurger.tsx
import React, { useState, useEffect } from "react";
import { Quote, MotivationQuotes, NonMotivationQuotes, DefoMotivationQuotes } from "./data";
import { auth } from "../../../firebase/firebase"; // Import the initialized Firestore instance
import { onAuthStateChanged } from "firebase/auth";
import useViewportHeight from "../../../hooks/useViewportHeight"; // Import the custom hook

const Loading: React.FC<{ mode: string }> = ({ mode }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const viewportHeight = useViewportHeight(); // Get the current viewport height


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ? currentUser.displayName : null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let randomQuote: Quote;
    switch (mode) {
      case "relax":
        randomQuote = NonMotivationQuotes[
          Math.floor(Math.random() * NonMotivationQuotes.length)
        ];
        break;
      case "normal":
        randomQuote = DefoMotivationQuotes[
          Math.floor(Math.random() * DefoMotivationQuotes.length)
        ];
        break;
      case "hard":
        randomQuote = MotivationQuotes[
          Math.floor(Math.random() * MotivationQuotes.length)
        ];
        break;
      default:
        randomQuote = { text: "No quote available", author: "Unknown" };
    }
    setQuote(randomQuote);
  }, [mode]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to</h1>
        <h1 style={styles.mainTitle}>BurgerLendar</h1>
      </header>
      <main style={styles.main}>
        <img
          src="https://thumb.ac-illust.com/36/36ac3e42b8ed38dce15bc0ad7c5e9a1c_t.jpeg"
          alt="burger"
          style={styles.burgerImage}
        />
        <div style={styles.username}>{user}</div>
        <div style={styles.quote}>
          {quote ? (
            <div
              style={{
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "1.5em", fontStyle: "italic" }}>
                {quote.text}
              </p>
              <p style={{ fontSize: "1.2em", marginTop: "10px" }}>
                — {quote.author}
              </p>
            </div>
          ) : (
            <p>Loading quote...</p>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003366",
    color: "#F9ECCB",
    textAlign: "center" as "center",
    height: "100px", // Ensure the container takes full viewport height
  },
  header: {
    marginBottom: "20px",
    flex: "0 1 auto", // Ensure the header does not grow or shrink
  },
  title: {
    fontSize: "1.5em",
    margin: "0",
    color: "#F9ECCB",
  },
  mainTitle: {
    fontSize: "2.5em",
    margin: "0",
    color: "#F9ECCB",
  },
  main: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003366",
    padding: "20px",
    borderRadius: "10px",
    height: "100px", // Ensure main takes full remaining height
    width: "100px", // Ensure main takes full width
  },
  burgerImage: {
    width: "150px",
    height: "150px",
  },
  username: {
    marginTop: "20px",
    fontSize: "1.2em",
    color: "#F9ECCB",
  },
  quote: {
    marginTop: "10px",
    fontSize: "1em",
    color: "#F9ECCB",
  },
};

export default Loading;
