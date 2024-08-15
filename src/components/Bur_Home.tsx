import React, { useState, useEffect } from "react";
import Edu from "./Home/education";
import Home from "./Home/home";

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
