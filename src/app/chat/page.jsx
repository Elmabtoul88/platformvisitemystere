"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, Loader2, UserCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuth } from "@/context/auth-context";
import { fetchMissions, postMissions } from "@/services/fetchData";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const user_id = user?.id;
      user_id ? setCurrentUserId(user_id) : setCurrentUserId(null);
      if (currentUserId) {
        const foundUser = await fetchMissions(
          "messages" + currentUserId,
          API_BASE_URL + "chat_messages/message/" + 2 + "/" + currentUserId,
        );

        foundUser ? setMessages(foundUser) : setMessages([]);
      }
    };
    fetchHistory();
  }, [currentUserId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    const optimisticMessage = {
      ...messages,
      sender_id: currentUserId,
      receiver_id: 2,
      message_text: inputValue,
      created_at: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      is_read: false,
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    setInputValue("");
    const baseUrl = API_BASE_URL + "chat_messages";
    const result = await postMissions(
      baseUrl,
      optimisticMessage,
      "messages" + currentUserId,
      baseUrl + "/" + "message/" + 2 + "/" + currentUserId,
    );
    result.success
      ? console.log("Message sent successfully")
      : console.error("Failed to send message");
    setIsSending(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto flex flex-col space-y-4">
        {/* En-tête Executive Chat */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#041F40] via-[#093568] to-[#041F40] text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6C799]/15 border border-[#D6C799]/30 flex items-center justify-center text-[#D6C799]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
                Assistance & Support Dédié
              </h1>
              <p className="text-xs text-slate-300">
                Échangez en direct avec l'équipe de coordination Emberton
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Équipe active
          </div>
        </div>

        {/* Boîte de messagerie */}
        <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl h-[calc(100vh-14rem)] min-h-[500px] flex flex-col overflow-hidden">
          <CardContent className="flex-grow p-0 overflow-hidden bg-slate-50/40">
            <ScrollArea className="h-full p-4 sm:p-6" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      Aucun message pour le moment
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Une question sur une mission ou un dédommagement ? Écrivez-nous ci-dessous.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div
                        key={index}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-sm ${
                            isMe
                              ? "bg-[#041F40] text-white rounded-tr-xs"
                              : "bg-white text-slate-900 border border-slate-200 rounded-tl-xs"
                          }`}
                        >
                          {!isMe && (
                            <p className="text-xs font-bold mb-1 text-[#041F40] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {msg.sender_name || "Coordinateur Emberton"}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.message_text}
                          </p>
                          <p
                            className={`text-[10px] mt-1.5 ${
                              isMe ? "text-slate-300 text-right" : "text-slate-400"
                            }`}
                          >
                            {msg.created_at}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl rounded-tl-xs max-w-[75%] bg-white text-slate-700 border border-slate-200 text-xs flex items-center gap-2 shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#041F40]" />
                      <span className="text-slate-500 font-medium">L'administrateur est en train d'écrire...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
            <Input
              type="text"
              placeholder="Écrivez votre message..."
              className="flex-grow bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40] h-11 rounded-xl text-sm"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isSending}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={isSending || !inputValue.trim()}
              className="h-11 w-11 shrink-0 rounded-xl bg-[#041F40] hover:bg-[#082a52] text-[#D6C799] shadow-sm transition-all"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="sr-only">Envoyer</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
