import React from "react";
import "./App.css";
import Authun from "./components/Firebase/Authun";
import Login from "./components/Firebase/Login";
import TaskManager from "./components/TaskManager";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Bath from "./components/Akinator/Bath_aki";
import FoodAki from "./components/Akinator/Food_Aki";
import LaunAki from "./components/Akinator/Laun_Aki";
import Aki_Sleep from "./components/Akinator//Sleep_Aki";
import Aki_Smoke from "./components/Akinator/Smoke_Aki";
import Homme from "./components/Home_on";
import Header from "./components/Header";
import Footer from "./components/Footer";
import EventCalendar from "./components/calendar";
import ToDo from "./components/todo";
import Memories from "./components/memories";
import Loading from "./components/Home/loading/welcometoBurger";
import Profile from "./components/Profile";
import ModeSelector from "./components/Home/ModeSelector";
import GPT from "./components/Home/Control_Home";
import ForgetPassword from "./components/Firebase/password_forget";
import ScheduleList from "./components/Home/ScheduleList";
import GenerateBurger from "./components/Home/GenerateBurger";

function App() {
  return (
    <Router>
      <Header />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/modeselector" element={<ModeSelector />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Authun />} />
          <Route path="/task" element={<TaskManager />} />
          <Route path="/bath" element={<Bath />} />
          <Route path="/food" element={<FoodAki />} />
          <Route path="/laun" element={<LaunAki />} />
          <Route path="/sleep" element={<Aki_Sleep />} />
          <Route path="/smoke" element={<Aki_Smoke />} />
          <Route path="/calendar" element={<EventCalendar />} />
          <Route path="/todo" element={<ToDo />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/loading" element={<Loading mode="relax" />} />
          <Route path="/home" element={<GPT mode="relax" />} />
          <Route path="/homme" element={<Homme />} />
          <Route path="/forgetpass" element={<ForgetPassword />} />
          <Route path="/ScheduleList" element={<ScheduleList/>} />
          <Route path="/dev2" element={<GenerateBurger/>} />
        </Routes>
      </div>
      <ConditionalFooter />
    </Router>
  );
}

function ConditionalFooter() {
  const location = useLocation();
  const footerPaths = [
    "/home",
    "/homme",
    "/calendar",
    "/todo",
    "/memories",
    "/profile",
    "/modeselector",
  ]; // Paths where the footer should be displayed

  if (!footerPaths.includes(location.pathname)) {
    return null;
  }

  return <Footer />;
}

export default App;
