import React, { useState, useEffect } from "react";
import Chat from "./chatGPT/chat";
import Edu from "./chatGPT/education";
import Home from "./chatGPT/home";

interface AppProps {
  mode: string;
}
const GPT: React.FC<AppProps> = ({ mode }) => {
  const [output, setOutput] = useState<string>("");

  return (
    <div>
      {output === "" && <Edu setOutput={setOutput} mode={mode} />}
      {output !== "" && <Home output={output} />}
    </div>
  );
};

export default GPT;
