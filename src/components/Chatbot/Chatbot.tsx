import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Spinner, Form } from "react-bootstrap";
import { MessageCircle, Send, X } from "lucide-react";
import "./chat.css"

export default function SkinCareChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "bot", text: "👋 Hi there! I'm your skincare assistant. Tell me your skin type (oily , dry , sensitive , combination ) !" },
  ]);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<{ type?: string; concern?: string }>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    processChat(input.toLowerCase());
    setInput("");
  };

  const processChat = (msg: string) => {
    setLoading(true);
    setTimeout(() => {
      if (step === 1) {
        setAnswers({ ...answers, type: msg });
        setStep(2);
        botReply("Got it 💕 Now tell me your main skin concern (acne, wrinkles, dryness...)");
      } else if (step === 2) {
        const newAnswers = { ...answers, concern: msg };
        setAnswers(newAnswers);
        setStep(3);
        botReply("✨ Here's your personalized skincare routine:");
        setTimeout(() => botReply(generateRoutine(newAnswers.type || "", newAnswers.concern || "")), 700);
        setTimeout(() => {
        botReply("🙏 Thanks for using our skincare assistant! Take care 💖");
    }, 1500); 
      } else {
        botReply("Type 'restart' to start again 💬");
        if (msg.includes("restart")) {
          setStep(1);
          setAnswers({});
          botReply("Let's start again 🌸 What’s your skin type? (oily , dry , sensitive , combination ) ");
        }
      }
      setLoading(false);
    }, 800);
  };

  const botReply = (text: string) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text }]);
    }, 400);
  };

  const generateRoutine = (type: string, concern: string): string => {
    let routine = "";

    if (type.includes("oily"))
      routine += "🌿 Oily Skin: Use gel cleansers and niacinamide serum.\n";
    else if (type.includes("dry"))
      routine += "💧 Dry Skin: Use creamy cleansers and rich moisturizers.\n";
    else if (type.includes("sensitive"))
      routine += "🌸 Sensitive Skin: Choose fragrance-free, soothing products.\n";
    else if (type.includes("combination"))
      routine += "🤍 Combination Skin: Use gentle cleansers and light hydrating creams.\n";
    else
      routine += "✨ Normal Skin: Keep it simple — mild cleanser + hydrating cream.\n";

    if (concern.includes("acne"))
      routine += "• Add salicylic acid or tea tree products 🌿";
    if (concern.includes("wrinkle") || concern.includes("aging"))
      routine += "• Use retinol and daily SPF 💆‍♀️";
    if (concern.includes("dark") || concern.includes("spot"))
      routine += "• Brighten with vitamin C serum ✨";
    if (concern.includes("dry"))
      routine += "• Add hyaluronic acid serum 💧";

    return routine || "Keep your routine balanced — cleanse, hydrate, and protect ☀️";
  };

  return (
    <>
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="text-white d-flex justify-content-center align-items-center rounded-circle shadow-lg"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          cursor: "pointer",
          fontSize: 28,
          zIndex: 1000,
          backgroundColor:"#7c6f63"
        }}
        whileHover={{ scale: 1.1 }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="p-3 bg-white rounded-4 shadow-lg"
            style={{
              position: "fixed",
              bottom: 90,
              right: 20,
              width: 380,
              height: 400,
              display: "flex",
              flexDirection: "column",
              zIndex: 999,
            }}
          >
            <div
              style={{
                overflowY: "auto",
                flex: 1,
                paddingRight: "5px",
                scrollbarWidth: "thin",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 my-2 rounded-3 ${
                    msg.sender === "user"
                      ? "text-white ms-auto userColor"
                      : "bg-light text-dark me-auto"
                  }`}
                  style={{ maxWidth: "80%" }}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                </div>
              )}
            </div>

            <div className="mt-2 d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button style={{backgroundColor:"#856b53ff"}} onClick={handleSend} disabled={loading}>
                <Send size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
