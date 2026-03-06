import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { Brain, Send, User, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { googleAIService, AIMessage } from "@/services/googleAIService";
import { useAuth } from "@/hooks/useAuth";

type Message = { role: "user" | "model"; content: string };

const suggestedQuestions = [
  "How can I reduce production costs?",
  "What government schemes are available for MSMEs?",
  "How to improve my business efficiency?",
  "What are the best practices for scaling my business?",
  "How can I get funding for my MSME?",
];

const AIAdvisor = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hello! I'm your AI Business Advisor powered by Google Gemini. I can help with production optimization, government schemes, cost reduction, growth strategies, and more. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const chatHistory: AIMessage[] = messages.map(m => ({
      role: m.role,
      text: m.content
    }));
    chatHistory.push({ role: 'user', text });

    const { text: response, error } = await googleAIService.chat(chatHistory);
    
    setTyping(false);
    
    if (error) {
      setMessages((prev) => [...prev, { 
        role: "model", 
        content: `Sorry, I encountered an error: ${error}. Please check your API key configuration.` 
      }]);
    } else if (response) {
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)] flex-col">
        <div className="mb-4">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-secondary" /> AI Business Advisor
          </h1>
          <p className="text-sm text-muted-foreground">Ask anything about your business — powered by Google Gemini AI</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-card space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === "user" ? "gradient-primary" : "bg-secondary/20"
              }`}>
                {msg.role === "user" ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-secondary" />}
              </div>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user" ? "gradient-primary text-primary-foreground" : "bg-accent text-accent-foreground"
              }`}>
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
                <Bot className="h-4 w-4 text-secondary" />
              </div>
              <div className="rounded-xl bg-accent px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <Sparkles className="h-3 w-3" /> {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your business..."
            onKeyDown={(e) => e.key === "Enter" && !typing && sendMessage(input)}
            className="flex-1"
            disabled={typing}
          />
          <Button onClick={() => sendMessage(input)} className="gradient-primary text-primary-foreground border-0" disabled={typing || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAdvisor;
