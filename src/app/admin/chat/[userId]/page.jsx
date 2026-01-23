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
import { Send, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { mockUsers } from "../../users/users-mock.js"; // Import mock users
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  fetchMissions,
  patchMissions,
  postMissions,
} from "@/services/fetchData.js";
import { useMessage } from "@/context/message-context";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function AdminChatPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef(null);

  const { decrementMessageCount } = useMessage();

  useEffect(() => {
    const fetchShoppersDetails = async () => {
      try {
        const currentuser = localStorage.getItem("missionViewAuth");
        const parsedUser = JSON.parse(currentuser);
        const user_id = parsedUser.user.id;
        setCurrentUserId(user_id);
        const foundUser = await fetchMissions(
          "messages" + userId,
          API_BASE_URL + "chat_messages/message/" + user_id + "/" + userId
        );
        if (foundUser) {
          const userObject = foundUser.filter(
            (user) => user.sender_name !== parsedUser.user.name
          );

          setUser(userObject[0] || {});
          setMessages(foundUser); // Initialize messages for this user
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Shopper not found.",
          });
          router.push("/admin/chat"); // Redirect if user not found
        }
        setIsLoading(false);
      } catch (err) {
        console.log("error", err);
      }
    };
    if (userId) {
      fetchShoppersDetails();
    }
  }, [userId, router, toast]);

  useEffect(() => {
    const updateIsRead = async () => {
      const toMarkRead = messages.filter(
        (msg) => msg.is_read === 0 && msg.sender_id !== parseInt(currentUserId)
      );

      if (toMarkRead.length === 0) return;

      const ids = toMarkRead.map((msg) => msg.id);
      const updated = messages.map((msg) =>
        ids.includes(msg.id) ? { ...msg, is_read: 1 } : msg
      );
      setMessages(updated);

      const baseUrl = API_BASE_URL + "chat_messages";
      try {
        const result = await patchMissions(
          baseUrl,
          { ids },
          "messages" + userId,
          API_BASE_URL + "chat_messages/message/" + currentUserId + "/" + userId
        );

        if (result.status === 200) {
          decrementMessageCount(ids.length);

          // Clear cache
          ids.forEach((id) => {
            localStorage.removeItem("cache_messages" + id);
          });
          localStorage.removeItem("cache_messages");
        } else {
          console.log("Erreur:", result.message);
        }
      } catch (error) {
        console.error("Erreur lors du marquage:", error);
      }
    };

    if (messages.length > 0 && currentUserId && userId) {
      updateIsRead();
    }
  }, [messages, currentUserId, userId, decrementMessageCount]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isSending || !user) return;

    setIsSending(true);

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      sender_id: currentUserId,
      receiver_id: userId,
      message_text: text,
      created_at: currentTime,
      is_read: false,
    };

    // Ajouter le message à l'état local
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue("");

    try {
      // Envoyer le message à l'API
      const baseUrl = API_BASE_URL + "chat_messages";
      const result = await postMissions(
        baseUrl,
        newMessage,
        "messages" + userId,
        baseUrl + "/" + "message/" + currentUserId + "/" + userId
      );

      if (result.success) {
        toast({
          title: "Message envoyé",
          description: `Votre message a été envoyé avec succès.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Échec de l'envoi du message.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'envoi du message.",
      });
    }

    setIsSending(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Chat...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <p>Shopper not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin/chat">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Chat List
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="outline" size="sm" className="mb-4">
        <Link href="/admin/chat">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shopper List
        </Link>
      </Button>
      <Card className="shadow-lg h-[calc(100vh-14rem)] flex flex-col">
        <CardHeader className="border-b flex flex-row items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={user.profile_pic_url} alt={user.name} />
            <AvatarFallback>
              {user.name?.charAt(0)?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Chat with {user.name}
            </CardTitle>
            <CardDescription className="text-xs">{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={msg.id || `msg-${index}`}
                  className={`flex ${
                    msg.sender_id === parseInt(currentUserId)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[75%] ${
                      msg.sender_id === parseInt(currentUserId)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.message_text}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_id === parseInt(currentUserId)
                          ? "text-primary-foreground/70 text-right"
                          : "text-muted-foreground"
                      }`}
                    >
                      {msg.created_at}
                    </p>
                  </div>
                </div>
              ))}
              {isSending && ( // Show typing indicator for admin message sending
                <div className="flex justify-end">
                  <div className="p-3 rounded-lg max-w-[75%] bg-primary/50 text-primary-foreground/80 italic text-sm">
                    Sending...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t flex items-center gap-2 bg-background">
          <Input
            type="text"
            placeholder={`Message ${user.name}...`}
            className="flex-grow"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isSending}
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
      <p className="text-center text-xs text-muted-foreground mt-4">
        Note: Chat functionality is simulated. Messages are not persisted.
      </p>
    </div>
  );
}
