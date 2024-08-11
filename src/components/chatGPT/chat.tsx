import React, { useState } from "react";
import axios from "axios";

interface Message {
  role: "user" | "ai";
  content: string;
}
//just chat with GPT-3
function Chat() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userMessage: Message = {
      role: "user",
      content: input,
    };

    // ユーザーのメッセージを追加
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    axios
      .post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      )
      .then((response) => {
        // APIからの返答を取得してステートに追加
        const aiMessage: Message = {
          role: "ai",
          content: response.data.choices[0].message.content,
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      })
      .catch((error) => {
        console.error("Error fetching response:", error);
      });

    // 入力フィールドをクリア
    setInput("");
  };

  return (
    <div>
      <h1>Chat with GPT-3</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message"
        />
        <button type="submit">Send</button>
      </form>
      <div>
        {messages.map((msg, index) => (
          <p
            key={index}
            className={msg.role === "ai" ? "ai-message" : "user-message"}
          >
            {msg.content}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Chat;
