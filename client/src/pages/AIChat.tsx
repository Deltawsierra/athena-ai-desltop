import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Paperclip, Image, FileText, Copy, Check, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { AIChatMessage } from "@shared/schema";
import AnimatedContainer from "@/components/AnimatedContainer";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AIChat() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading } = useQuery<AIChatMessage[]>({
    queryKey: ["/api/chat"],
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { message: string; sender: string; attachments?: any }) => {
      return await apiRequest("/api/chat", "POST", {
        userId: "current-user",
        message: data.message,
        sender: data.sender,
        attachments: data.attachments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setMessage("");
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const responses = [
          "I'm analyzing the security data you provided. I've identified several critical vulnerabilities.",
          "Based on the test results, I recommend prioritizing the high-severity findings first.",
          "The penetration test has been scheduled. I'll monitor the progress and alert you of any issues.",
          "I've compiled the security report. Would you like me to send it to the client?",
          "System scan complete. I found 3 critical issues that need immediate attention.",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        sendMutation.mutate({
          message: randomResponse,
          sender: "ai",
        });
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Send Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMutation.mutate({
      message: message.trim(),
      sender: "user",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({
        title: "File Selected",
        description: `${files[0].name} ready to upload`,
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <AnimatedContainer direction="up" delay={0}>
          <div className="space-y-2">
            <motion.h1
              className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <MessageSquare className="w-10 h-10 text-primary" />
              AI <span className="bg-gradient-to-r from-primary via-blue-500 to-purple bg-clip-text text-transparent">Assistant</span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              Communicate with Athena AI for security analysis and system control
            </motion.p>
          </div>
        </AnimatedContainer>

        {/* Chat Container */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Athena AI Assistant
                </CardTitle>
                <Badge variant="default" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages Area */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, index) => {
                    const isUser = msg.sender === "user";
                    const isCopied = copiedId === msg.id;

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        data-testid={`message-${msg.id}`}
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isUser ? "bg-primary/20" : "bg-blue-500/20"
                        }`}>
                          {isUser ? (
                            <User className="w-5 h-5 text-primary" />
                          ) : (
                            <Bot className="w-5 h-5 text-blue-500" />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex-1 max-w-[70%] space-y-1`}>
                          <div className={`flex items-center gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                            <span className="text-sm font-semibold">
                              {isUser ? "You" : "Athena AI"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.timestamp), "h:mm a")}
                            </span>
                          </div>
                          
                          <div className={`relative group ${isUser ? "text-right" : "text-left"}`}>
                            <div className={`inline-block p-3 rounded-lg ${
                              isUser 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}>
                              <p className="whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`absolute top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                                isUser ? "left-0" : "right-0"
                              }`}
                              onClick={() => handleCopy(msg.message, msg.id)}
                              data-testid={`button-copy-${msg.id}`}
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <Bot className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-muted-foreground">
                        No messages yet. Start a conversation with Athena AI
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4 bg-background/50 backdrop-blur">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.txt,.doc,.docx"
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFileSelect}
                    data-testid="button-attach-file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  <div className="flex-1 relative">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      className="resize-none pr-12 min-h-[60px]"
                      data-testid="input-message"
                    />
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending}
                    size="icon"
                    className="self-end"
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  <span>Supports text, images, and documents</span>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </AnimatedContainer>

        {/* Chat Info */}
        <AnimatedContainer direction="up" delay={0.3}>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold" data-testid="text-total-messages">
                    {messages.length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">AI Responses</p>
                  <p className="text-2xl font-bold" data-testid="text-ai-responses">
                    {messages.filter(m => m.sender === "ai").length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Your Messages</p>
                  <p className="text-2xl font-bold" data-testid="text-user-messages">
                    {messages.filter(m => m.sender === "user").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
