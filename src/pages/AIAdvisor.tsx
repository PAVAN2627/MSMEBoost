import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect, useRef } from "react";
import { Brain, Send, User, Bot, Sparkles, History, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { googleAIService, AIMessage } from "@/services/googleAIService";
import { useAuth } from "@/hooks/useAuth";
import { productionService } from "@/services/productionService";
import { analyticsService } from "@/services/analyticsService";
import { infrastructureService } from "@/services/infrastructureService";
import { innovationService } from "@/services/innovationService";
import { sustainabilityService } from "@/services/sustainabilityService";
import { userProfileService } from "@/services/userProfileService";
import { chatHistoryService, ChatSession } from "@/services/chatHistoryService";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hello! I'm your AI Business Advisor powered by Google Gemini. I'm analyzing your business data to provide personalized advice. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [userDataContext, setUserDataContext] = useState<string>("");
  const [loadingData, setLoadingData] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all user data for context
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Fetch user profile first
        const { profile } = await userProfileService.getProfile(user.uid);
        
        // Fetch all business data
        const [ordersData, analyticsData, machinesData, equipmentData, projectsData, sustainabilityData] = await Promise.all([
          productionService.getOrders(user.uid),
          analyticsService.getAnalytics(user.uid, 'daily', 30),
          analyticsService.getMachines(user.uid),
          infrastructureService.getEquipment(user.uid),
          innovationService.getProjects(user.uid),
          sustainabilityService.getData(user.uid)
        ]);

        // Build context string
        let context = "USER'S BUSINESS PROFILE & DATA:\n\n";

        // User Profile Information
        if (profile) {
          context += `BUSINESS PROFILE:\n`;
          context += `Owner: ${profile.firstName} ${profile.lastName}\n`;
          context += `Company: ${profile.companyName || 'Not specified'}\n`;
          context += `Business Type: ${profile.businessType}\n`;
          context += `Industry: ${profile.industry}\n`;
          context += `Company Size: ${profile.companySize} employees\n`;
          context += `Location: ${profile.location}\n`;
          context += `Role: ${profile.role}\n\n`;
        }

        // Orders summary
        if (ordersData.orders && ordersData.orders.length > 0) {
          const activeOrders = ordersData.orders.filter(o => o.status !== 'completed').length;
          const completedOrders = ordersData.orders.filter(o => o.status === 'completed').length;
          context += `ORDERS: ${ordersData.orders.length} total (${activeOrders} active, ${completedOrders} completed)\n`;
          context += `Recent orders: ${ordersData.orders.slice(0, 3).map(o => `${o.product} (${o.quantity} units, ${o.status})`).join(', ')}\n\n`;
        }

        // Analytics summary
        if (analyticsData.data && analyticsData.data.length > 0) {
          const totalRevenue = analyticsData.data.reduce((sum, d) => sum + d.revenue, 0);
          const totalCosts = analyticsData.data.reduce((sum, d) => sum + d.costs, 0);
          const avgEfficiency = analyticsData.data.reduce((sum, d) => sum + d.efficiency, 0) / analyticsData.data.length;
          context += `ANALYTICS: ${analyticsData.data.length} data points\n`;
          context += `Total Revenue: ₹${totalRevenue.toLocaleString()}\n`;
          context += `Total Costs: ₹${totalCosts.toLocaleString()}\n`;
          context += `Profit: ₹${(totalRevenue - totalCosts).toLocaleString()}\n`;
          context += `Average Efficiency: ${avgEfficiency.toFixed(1)}%\n\n`;
        }

        // Machines summary
        if (machinesData.machines && machinesData.machines.length > 0) {
          const operational = machinesData.machines.filter(m => m.status === 'operational').length;
          context += `MACHINES: ${machinesData.machines.length} total (${operational} operational)\n`;
          context += `Machines: ${machinesData.machines.map(m => `${m.machineName} (${m.efficiency}% efficiency)`).join(', ')}\n\n`;
        }

        // Equipment summary
        if (equipmentData.equipment && equipmentData.equipment.length > 0) {
          const operational = equipmentData.equipment.filter(e => e.status === 'operational').length;
          const avgEfficiency = equipmentData.equipment.reduce((sum, e) => sum + e.efficiency, 0) / equipmentData.equipment.length;
          context += `EQUIPMENT: ${equipmentData.equipment.length} total (${operational} operational)\n`;
          context += `Average Equipment Efficiency: ${avgEfficiency.toFixed(1)}%\n`;
          context += `Equipment: ${equipmentData.equipment.map(e => `${e.name} (${e.condition}, ${e.efficiency}%)`).join(', ')}\n\n`;
        }

        // Innovation projects summary
        if (projectsData.projects && projectsData.projects.length > 0) {
          const active = projectsData.projects.filter(p => p.status === 'in-progress').length;
          context += `INNOVATION: ${projectsData.projects.length} projects (${active} active)\n`;
          context += `Projects: ${projectsData.projects.map(p => `${p.name} (${p.progress}% complete)`).join(', ')}\n\n`;
        }

        // Sustainability summary
        if (sustainabilityData.data && sustainabilityData.data.length > 0) {
          const totalEnergy = sustainabilityData.data.reduce((sum, d) => sum + d.energyConsumption, 0);
          const totalCarbon = sustainabilityData.data.reduce((sum, d) => sum + d.carbonFootprint, 0);
          const avgRenewable = sustainabilityData.data.reduce((sum, d) => sum + d.renewableEnergy, 0) / sustainabilityData.data.length;
          context += `SUSTAINABILITY: ${sustainabilityData.data.length} data points\n`;
          context += `Total Energy: ${totalEnergy.toFixed(1)} kWh\n`;
          context += `Carbon Footprint: ${totalCarbon.toFixed(1)} kg CO2\n`;
          context += `Renewable Energy: ${avgRenewable.toFixed(1)}%\n\n`;
        }

        if (context === "USER'S BUSINESS PROFILE & DATA:\n\n") {
          context += "No data available yet. User is just getting started.\n\n";
        }

        context += "Based on this complete business profile and operational data, provide personalized, actionable advice specific to this user's business type, size, industry, and current situation.";
        
        setUserDataContext(context);
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserDataContext("Unable to load user data. Providing general advice.");
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Load chat history
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      const { sessions } = await chatHistoryService.getSessions(user.uid, 10);
      if (sessions) setChatHistory(sessions);
      setLoadingHistory(false);
    };

    loadHistory();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save current conversation
  const saveConversation = async () => {
    if (!user || messages.length <= 1) return;

    // Generate title from first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg 
      ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '')
      : 'New Conversation';

    const session: Omit<ChatSession, 'id'> = {
      userId: user.uid,
      messages: messages.map(m => ({
        ...m,
        timestamp: new Date()
      })),
      title,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { error } = await chatHistoryService.saveSession(session);
    
    if (!error) {
      // Reload history
      const { sessions } = await chatHistoryService.getSessions(user.uid, 10);
      if (sessions) setChatHistory(sessions);
      
      toast({
        title: "Conversation Saved",
        description: "Your chat has been saved to history.",
      });
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Build chat history with user data context
    const chatHistory: AIMessage[] = [];
    
    // Add system context as first message if we have user data
    if (userDataContext) {
      chatHistory.push({
        role: 'user',
        text: userDataContext
      });
      chatHistory.push({
        role: 'model',
        text: 'I understand your business data. I will provide personalized advice based on your actual performance, orders, equipment, and sustainability metrics.'
      });
    }
    
    // Add conversation history
    messages.forEach(m => {
      chatHistory.push({ role: m.role, text: m.content });
    });
    
    // Add current user message
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
      <div className="flex h-[calc(100vh-6rem)] gap-6">
        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Brain className="h-6 w-6 text-secondary" /> AI Business Advisor
              </h1>
              <p className="text-sm text-muted-foreground">
                {loadingData ? "Loading your business data..." : "Personalized advice based on your actual business data"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveConversation}
                disabled={messages.length <= 1}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Save Chat
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
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
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-line">{msg.content}</div>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
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
            <div ref={chatEndRef} />
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

        {/* Chat History Sidebar */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex flex-col"
          >
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <History className="h-5 w-5 text-info" /> Chat History
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Your past conversations</p>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card shadow-card">
              {loadingHistory ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading history...
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No saved conversations yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {chatHistory.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setMessages(session.messages.map(m => ({
                          role: m.role,
                          content: m.content
                        })));
                      }}
                      className="w-full p-4 text-left hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-4 w-4 text-info mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.messages.length} messages
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.updatedAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIAdvisor;
