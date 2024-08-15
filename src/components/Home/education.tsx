import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
} from "firebase/firestore";
import { parseSchedule, ScheduleEvent } from "../ScheduleParser";
import {
  Quote,
  MotivationQuotes,
  NonMotivationQuotes,
  DefoMotivationQuotes,
} from "./loading/data";
import { auth, db } from "../../firebase/firebase"; // Import the initialized Firestore instance
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "./loading/welcometoBurger"; // Import the Loading component
import './education.css';


interface EduProps {
  setOutput: (output: string) => void;
  mode: string; // Add mode to the props interface
}

interface ScheduledTask {
  Title: string;
  deadline: string;
}

interface Event {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface aki {
  bath: string[];
  food: string[];
  laun: number;
  laundry: number;
  sleep: number;
  smoke: number;
}

const Edu: React.FC<EduProps> = ({ setOutput, mode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduledTask[]>([]);
  const [Aki, setAki] = useState<aki>({
    bath: [],
    food: [],
    laun: 0,
    laundry: 0,
    sleep: 0,
    smoke: 0,
  });
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<any>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [today, setToday] = useState<string>("");
  const [countdata, setcountdata] = useState<number>(0);
  const [scheduleText, setScheduleText] = useState<string>(""); // State to hold the generated schedule text
  const [isLoading, setIsLoading] = useState<boolean>(true); // State to manage loading status
  const navigate = useNavigate(); // Use the useNavigate hook from React Router

  function getCurrentDateFormatted() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(2); // 年の下2桁を取得
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // 月を2桁で取得
    const day = today.getDate().toString().padStart(2, "0"); // 日を2桁で取得
    return year + month + day; // 結合して文字列を返す
  }

  useEffect(() => {
    if (mode === "relax") {
      const randomQuote =
        NonMotivationQuotes[
          Math.floor(Math.random() * NonMotivationQuotes.length)
        ];
      setQuote(randomQuote);
      return;
    }
    if (mode === "normal") {
      const randomQuote =
        DefoMotivationQuotes[
          Math.floor(Math.random() * DefoMotivationQuotes.length)
        ];
      setQuote(randomQuote);
      return;
    }
    if (mode === "hard") {
      const randomQuote =
        MotivationQuotes[Math.floor(Math.random() * MotivationQuotes.length)];
      setQuote(randomQuote);
      return;
    }
    throw new Error("No such document!");
  }, [mode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchEvents(currentUser.uid);
        fetchtodos(currentUser.uid);
        fetchUserName(currentUser.uid);
        fetchUserAki(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  /////////////////////////////////////////////////////////
  async function fetchUserAki(userId: string) {
    try {
      const docRef = doc(db, "Users_Aki", userId);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data() as aki;
      console.log("aki", data);
      setAki(data);
      setcountdata(countdata + 1);
      if (docSnap.exists()) {
      } else {
        console.log("No such document!");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }

  const fetchEvents = async (userId: string) => {
    try {
      const eventsRef = query(collection(db, "users", userId, "events"));
      const querySnapshot = await getDocs(eventsRef);
      const fetchedEvents = querySnapshot.docs.map((doc) => ({
        date: doc.data().date,
        name: doc.data().title,
        endTime: doc.data().endTime,
        startTime: doc.data().startTime,
      }));
      console.log("event", fetchedEvents);
      setEvents(fetchedEvents);
    } catch (err) {
      throw new Error("Error fetching user data:");
    }
  };

  const fetchtodos = async (userId: string) => {
    try {
      const eventsRef = query(collection(db, "users", userId, "todos"));
      const querySnapshot = await getDocs(eventsRef);
      const fetchedTodos = querySnapshot.docs.map((doc) => ({
        Title: doc.data().text,
        deadline: doc.data().dueDate,
      }));
      console.log("todos", fetchedTodos);
      setScheduleTasks(fetchedTodos);
      setcountdata(countdata + 1);
    } catch (err) {
      throw new Error("Error fetching user data:");
    }
  };

  const fetchUserName = async (userId: string) => {
    try {
      const docRef = doc(db, "Users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("username", data?.displayName);
        setUserName(data?.displayName);
        setcountdata(countdata + 1);
      } else {
        console.log("No such document in Users!");
      }
    } catch (error) {
      console.error("Error fetching user profile: ", error);
    }
  };

  useEffect(() => {
    if (countdata < 1) {
      return;
    }
    handleSubmit();
  }, [countdata]);

  const handleSubmit = async () => {
    console.log("aki in handlesubmit", Aki);
    console.log("mode in handlesubmit", mode);
    console.log("scheduledtask in handlesubmit", scheduleTasks);
    console.log("events in handlesubmit", events);
    console.log("username in handlesubmit", userName);
    setToday(getCurrentDateFormatted());
    const prompt = `
    Generate schedule considering the motivation level for the day (${mode}) usign given data.
    if (mode) is relax, you can not need to include any other tasks.
    if (mode) is normal, please put in one task that is closest to the due date.
    if (mode) is hard, put in as many tasks as possible in order of due date.
    But if you have a task that is deadline is today, you need to put it in the schedule.
    organize a schedule in the specified format and today's date is (${today}) .

    Schedule Items(To be done at a specific time during the day and make sure the today's date is ${today},so you can
    only put in event that Date is today.):
    ${events
      .map(
        (item) =>
          `EventName: ${item.name}, Date: ${item.date},startTime: ${item.startTime}, endTime: ${item.endTime}`
      )
      .join("\n")}

    Scheduled Tasks (You need to finish it by the deadline and each task take 30 minutes to complete and 
    you can't put in tasks that are Dealine is overdue.):
    ${scheduleTasks
      .map(
        (ScheduleTasks) =>
          `Title: ${ScheduleTasks.Title}, Deadline: ${ScheduleTasks.deadline}`
      )
      .join("\n")}

  
    And you have to add the following tasks in the schedule.
    you have to take a bath in ${Aki.bath.map((item, index) => item).join(",")} and each time takes 30 minutes.
    you have to eat in ${Aki.food.map((item, index) => item).join(",")} and each time takes 45 minutes.
    you have to smoke ${Aki.smoke} times per day and each time take 10 minutes.
    you have to wake up at 7AM and sleep at 10PM.
    And you can add free time when event are not scheduled.
    
    Please organize the schedule, followed by a short description if available and Schedule title in one word. 
    Use the format:
    hh:mm - Schedule Title

    If there is no task, do not write anything about the task.
    Dont't put in schedule other than the given data. 

    Generate a schedule considering the best times to fit the tasks around the fixed schedule items, optimizing productivity based on the motivation level.
        `;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          //gpt-4o
          model: "gpt-4o",
          messages: [{ role: "system", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );
      console.log(response.data.choices[0].message.content);
      setOutput(response.data.choices[0].message.content);
      setScheduleText(response.data.choices[0].message.content); // Set the generated schedule text to state

      // Save the schedule to Firestore
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        const formattedDate = today.replace(/-/g, "").slice(2);
        const docRef = doc(db, "users", user.uid, "schedule", formattedDate);
        await setDoc(docRef, {
          text: response.data.choices[0].message.content,
        });

        // Parse the schedule text and save the events
        const parsedEvents = parseSchedule(
          response.data.choices[0].message.content
        ).map((event) => ({
          ...event,
          done: false,
        }));
        const eventsCollectionRef = collection(
          db,
          "schedule",
          user.uid,
          "schedule",
          formattedDate,
          "events"
        );
        parsedEvents.forEach(async (event, index) => {
          const eventDocRef = doc(eventsCollectionRef, index.toString());
          await setDoc(eventDocRef, event);
        });

        console.log("Schedule saved to Firestore!");
        setTimeout(() => {
          navigate("/homme"); // Navigate to /homme after saving
        }, 0); // Delay navigation by 100 milliseconds
      }
    } catch (error) {
      console.error("Error in generating or saving schedule:", error);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Welcome to</h1>
        <h1 className="mainTitle">BurgerLendar</h1>
      </header>
      <main className="main">
        <img
          src="https://thumb.ac-illust.com/36/36ac3e42b8ed38dce15bc0ad7c5e9a1c_t.jpeg"
          alt="burgerImage"
          className="burgerImage"
        />
        <div className="username">{userName}</div>
        <div className="quote">
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



export default Edu;
