import React from "react";
import "./App.css";
import Authun from "./components/Authun";
import Login from "./components/Login";
import AddTabacco from "./components/AddTabacco";
import TaskManager from "./components/TaskManager";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Bath from "./components/Bath_aki";
import FoodAki from "./components/Food_Aki";
import LaunAki from "./components/Laun_Aki";
import Aki_Sleep from "./components/Sleep_Aki";
import Aki_Smoke from "./components/Smoke_Aki";
import Bur_Home from "./components/Bur_Home";
import Homme from "./components/Home_on";
import Header from "./components/Header";
import Footer from "./components/Footer";
import EventCalendar from "./components/calendar";
import ToDo from "./components/todo";
import Memories from "./components/memories";
import Loading from "./components/chatGPT/loading/welcometoBurger";
import Profile from "./components/Profile";
import ModeSelector from "./components/ModeSelector";
import GPT from "./components/Bur_Home";
import WebglApp from "./components/webGL/page";
import ScheduleToBurger from "./components/chatGPT/scheduleToBurger";
import ForgetPassword from "./components/password_forget";

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
          <Route path="/admin" element={<AddTabacco />} />
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
          <Route path="/webgl" element={<WebglApp />} />
          <Route path="/schedule" element={<ScheduleToBurger />} />
          <Route path="/home" element={<GPT mode="relax" />} />
          <Route path="/homme" element={<Homme />} />
          <Route path="/forgetpass" element={<ForgetPassword />} />
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
