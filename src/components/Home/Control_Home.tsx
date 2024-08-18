import React, { useState, useEffect } from "react";
import Edu from "./GPT";
import ScheduleList from "./ScheduleList";
import { useNavigate } from "react-router-dom";

interface AppProps {
  mode: string;
}
const GPT: React.FC<AppProps> = ({ mode }) => {
  const [output, setOutput] = useState<string>("");
  const navigate = useNavigate();

  return (
    <div>
      {output === "" && <Edu setOutput={setOutput} mode={mode} />}
      {output !== "" && (
        <>
          {navigate("/ScheduleList")}
        </>
      )}
    </div>
  );
};

export default GPT;
