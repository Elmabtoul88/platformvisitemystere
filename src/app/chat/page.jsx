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
import { Send, MessageSquare, Loader2, UserCircle } from "lucide-react"; // Added Loader2, UserCircle
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuth } from "@/context/auth-context"; // Import auth context
import { fetchMissions, postMissions } from "@/services/fetchData";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChatPage() {
  const { user } = useAuth(); // Get current user
  const [messages, setMessages] = useState([]); // Start with empty messages, load history later
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // State for admin typing indicator
  const [currentUserId, setCurrentUserId] = useState(null);
  const scrollAreaRef = useRef(null);

  // TODO: Fetch chat history with admin from backend API on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      //const currentuser = localStorage.getItem("missionViewAuth");
      //const parsedUser = JSON.parse(currentuser);
      const user_id = user.id; //parsedUser.user.id;
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

  // Function to scroll to the bottom of the chat
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

  // Scroll to bottom when messages change or typing indicator shown/hidden
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    // Add user's message optimistically
    const optimisticMessage = {
      ...messages,
      sender_id: currentUserId,
      receiver_id: 2,
      message_text: inputValue,
      created_at: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }), // Add time immediately for UI
      is_read: false,
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    setInputValue(""); // Clear input immediately
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
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card className="shadow-lg h-[calc(100vh-12rem)] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Chat with Admin
          </CardTitle>
          <CardDescription>
            Ask questions about missions or report issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {/* Display fetched/real-time messages */}
              {messages.map((msg, index) => (
                <div
                  key={index} // Use message ID as key
                  className={`flex ${
                    msg.sender_id === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[75%] ${
                      msg.sender_id === user?.id
                        ? "bg-primary text-primary-foreground" // User's messages
                        : "bg-secondary text-secondary-foreground" // Admin's messages
                    }`}
                  >
                    {/* Optional: Display sender name if not the current user */}
                    {msg.sender_id !== user?.id && msg.sender_name && (
                      <p className="text-xs font-semibold mb-1 text-muted-foreground">
                        {msg.sender_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.message_text}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_id === user?.id
                          ? "text-primary-foreground/70 text-right"
                          : "text-muted-foreground"
                      }`}
                    >
                      {msg.created_at}
                    </p>
                  </div>
                </div>
              ))}
              {/* Typing Indicator for Admin */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg max-w-[75%] bg-secondary text-secondary-foreground italic text-sm flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Admin is typing...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t flex items-center gap-2 bg-background">
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-grow"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress} // Add key press handler
            disabled={isSending} // Disable input while sending or disconnected
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={isSending || !inputValue.trim()}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="sr-only">Send Message</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
