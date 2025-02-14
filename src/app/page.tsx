"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { ThreeDots } from "react-loading-icons";
import Image from "next/image";
import Typed from "typed.js";

interface Message {
  text: string;
  sender: "user" | "bot";
  img: string;
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello, I’m ClickyBot! 👋 I’m your personal chatbot assistant. How can I help you?",
      sender: "bot",
      img: "/assets/botlogo.png",
    },
  ]);
  const [input, setInput] = useState("");
  const latestMessageRef = useRef<HTMLSpanElement | null>(null);

  // Function to send a message

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user", img: "/assets/userLogo.png" };
    setMessages((prev) => [...prev, userMessage]);

    // Show a temporary bot message with loading
    const tempBotMessage = {
      text: "...",
      sender: "bot",
      img: "/assets/botlogo.png",
    };
    setMessages((prev) => [...prev, tempBotMessage]);

    try {
      const response = await axios.post("http://localhost:8000/query", { query: input });

      // Replace the last bot message with actual response
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          text: response.data.results,
          sender: "bot",
          img: "/assets/botlogo.png",
        };
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          text: "The server is busy, please try again.",
          sender: "bot",
          img: "/assets/error.png",
        };
        return updatedMessages;
      });
    }

    setInput(""); // Clear input field
  };

  // Effect to run Typed.js animation on the latest bot message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (latestMessageRef.current && lastMessage.sender === "bot" && lastMessage.text !== "...") {
      const typed = new Typed(latestMessageRef.current, {
        strings: [lastMessage.text],
        typeSpeed: 10,
        showCursor: false,
      });
      return () => typed.destroy();
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-[400px] h-[600px] mx-auto border rounded-lg shadow-lg bg-white  fixed bottom-10 right-24">

       <button
        onClick={toggleChatbot}
        className="fixed bottom-5 right-5 bg-blue-500 p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all"
      >
        <Image src="/assets/chatbubble.png" alt="Chat" width={40} height={40} />
      </button>
      


      <div className="bg-blue-100 p-4 text-blue-600 font-bold text-lg">ClickyBot</div>



      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => {
          const isLatestBotMessage = msg.sender === "bot" && index === messages.length - 1;

          return (
            <div
              key={index}
              className={`flex items-center space-x-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Image
                className="w-10 h-10 rounded-full ml-1"
                src={msg.img}
                alt={msg.sender === "user" ? "User Avatar" : "Bot Logo"}
                width={40}
                height={40}
              />

              {/* Message Bubble */}
              <div
                className={`p-3 max-w-xs rounded-lg break-words whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 text-blue-900"
                }`}
              >
                {isLatestBotMessage && msg.text === "..." ? (
                  <ThreeDots width="30" height="10" fill="gray" />
                ) : isLatestBotMessage ? (
                  <span ref={latestMessageRef}></span>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          );


        })}

      </div>

      {/* Input Field */}

      <div className="p-3 border-t flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 border rounded-lg outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 text-white p-2 rounded-full"
        >
          <PaperPlaneIcon className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
