import React, { useState, useEffect, useRef } from "react";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am Achyutam's AI Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [limit, setLimit] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    document.documentElement.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || limit >= 10) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLimit((prev) => prev + 1);

    setTimeout(() => {
      const userText = userMessage.content.toLowerCase();

      let reply = "";

      if (
        userText.includes("hello") ||
        userText.includes("hi") ||
        userText.includes("hey")
      ) {
        reply = "Hello! Welcome to Achyutam's portfolio.";
      } else if (userText.includes("skills")) {
        reply =
          "Achyutam works with React, Python, Node.js, JavaScript, REST APIs, and Data Analytics tools.";
      } else if (userText.includes("projects")) {
        reply =
          "You can explore projects like Plant Disease Detection, Portfolio, and Diwali Sales Analysis — Exploratory Data Analysis.";
      } else if (userText.includes("contact")) {
        reply = "You can connect using the Contact section on this portfolio.";
      } else if (userText.includes("education")) {
        reply = "Achyutam is currently Complete studies in Masters in Computer Application.";
      } else if (userText.includes("github")) {
        reply =
          "GitHub project links are available inside the Projects section.";
      } else if (userText.includes("experience")) {
        reply =
          "Achyutam has experience in Full Stack Development and AI projects.";
      } else if (userText.includes("resume")) {
        reply = "You can download the resume from the Hero section.";
      } else if (userText.includes("location")) {
        reply = "Achyutam is based in India.";
      } else {
        reply = "Sorry, I only support basic portfolio questions right now.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 md:right-8 z-50 font-mono">
      {/* Floating Trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="glow-button w-16 h-16 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 flex items-center justify-center shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:scale-110"
        >
          <span className="text-3xl">🤖</span>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className="relative animate-chat-scale border border-cyan-500/20 bg-[#050816]/95 backdrop-blur-xl rounded-2xl flex flex-col shadow-[0_40px_80px_-24px_rgba(8,145,178,0.7)] overflow-hidden"
          style={{
            width: "min(24rem, calc(100vw - 2rem))",
            maxWidth: "30rem",
            height: "60vh",
            maxHeight: "600px",
            minHeight: "420px",
          }}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-900 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-3.5 w-3.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                AI Assistant
              </span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className="text-[11px] text-gray-500">
                {limit}/10 queries
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className=" text-white text-2xl font-bold hover:text-cyan-400 transition-colors z-50"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/60"
            style={{ overscrollBehavior: "contain" }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] p-4 text-sm leading-relaxed rounded-xl ${
                    m.role === "user"
                      ? "bg-cyan-500 text-gray-950 font-semibold shadow-lg shadow-cyan-500/10"
                      : "border border-gray-800 bg-gray-900/70 text-gray-300"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Form input */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-gray-900 bg-gray-900/30 flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={limit >= 10}
              placeholder={limit >= 10 ? "Limit reached" : "Type query..."}
              className="flex-1 bg-black/40 border border-cyan-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={limit >= 10}
              className="glow-button px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all duration-300"
            >
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
