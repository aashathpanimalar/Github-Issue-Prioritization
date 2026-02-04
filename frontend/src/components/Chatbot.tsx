"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Minimize2, Maximize2 } from "lucide-react";
import api from "@/lib/api";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "👋 Hi! I'm your AI assistant for GitHub issues. I can help you analyze issues, suggest solutions, and answer questions about your repositories. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            const response = await api.post("/chatbot/message", {
                message: inputMessage,
                userToken: localStorage.getItem("token") || "",
                repo: "",
                issueContext: null,
            });

            const assistantMessage: Message = {
                role: "assistant",
                content: response.data.response || "I'm sorry, I couldn't process that request.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 group"
            >
                <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className="font-semibold">AI Assistant</span>
            </button>
        );
    }

    return (
        <div
            className={`fixed ${isMinimized ? "bottom-6 right-6" : "bottom-6 right-6"
                } z-50 transition-all duration-300`}
        >
            <div
                className={`bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden ${isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
                    } transition-all duration-300`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">AI Assistant</h3>
                            <p className="text-xs text-white/70">Powered by Groq & LangGraph</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isMinimized ? (
                                <Maximize2 className="w-5 h-5 text-white" />
                            ) : (
                                <Minimize2 className="w-5 h-5 text-white" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                            : "bg-white/10 backdrop-blur-xl border border-white/20 text-white"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything about GitHub issues..."
                                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading || !inputMessage.trim()}
                                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
