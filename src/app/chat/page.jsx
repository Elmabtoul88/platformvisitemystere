'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Loader2 } from 'lucide-react'; // Added Loader2
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Notification key should match the one used in admin chat and profile menu
const CHAT_NOTIFICATION_KEY = 'chatNotificationCount';

// Initial messages for the chat
const initialMessages = [
  { id: 1, sender: 'Admin', text: 'Hello! How can I help you today?', time: '10:30 AM' },
  { id: 2, sender: 'You', text: 'I have a question about mission #mission-2.', time: '10:31 AM' },
  { id: 3, sender: 'Admin', text: 'Sure, what is your question?', time: '10:32 AM' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure scrolling happens after DOM update
    requestAnimationFrame(() => {
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

   // Simulate receiving an admin message after a delay (for notification testing)
   useEffect(() => {
    const timer = setTimeout(() => {
       const adminMessage = {
         id: Date.now(),
         sender: 'Admin',
         text: "Just checking in - is there anything else I can help with? (Simulated proactive message)",
         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
       };

       setMessages(prevMessages => [...prevMessages, adminMessage]);

       // --- Notification Logic for receiving message ---
       try {
           const currentCount = parseInt(localStorage.getItem(CHAT_NOTIFICATION_KEY) || '0', 10);
           const newCount = currentCount + 1;
           localStorage.setItem(CHAT_NOTIFICATION_KEY, newCount.toString());
           console.log(`Shopper Chat: Incremented notification count to ${newCount} due to received message`);
           // Manually dispatch event for ProfileMenu
           window.dispatchEvent(new StorageEvent('storage', {
               key: CHAT_NOTIFICATION_KEY,
               newValue: newCount.toString(),
               oldValue: currentCount.toString(),
               storageArea: localStorage,
           }));
       } catch (error) {
           console.error("Shopper Chat: Failed to update notification count:", error);
       }
       // --- End Notification Logic ---

     }, 15000); // Send a message after 15 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
   }, []); // Runs once on mount

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isSending) return; // Prevent sending empty messages or while already sending

    setIsSending(true);

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: Date.now(), // Simple unique ID using timestamp
      sender: 'You',
      text: text,
      time: currentTime,
    };

    // Add user's message optimistically
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputValue(''); // Clear input field

    // --- Simulate sending and receiving a reply ---
    console.log("Simulating message send:", newMessage);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Simulate a reply from the Admin
    const adminReply = {
      id: Date.now() + 1,
      sender: 'Admin',
      text: "Thanks for your message! This is a simulated reply as the chat feature is not fully functional yet.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prevMessages => [...prevMessages, adminReply]);
    // --- End Simulation ---

     // --- Notification Logic for receiving reply ---
     try {
         const currentCount = parseInt(localStorage.getItem(CHAT_NOTIFICATION_KEY) || '0', 10);
         const newCount = currentCount + 1;
         localStorage.setItem(CHAT_NOTIFICATION_KEY, newCount.toString());
         console.log(`Shopper Chat: Incremented notification count to ${newCount} due to received reply`);
         // Manually dispatch event for ProfileMenu
         window.dispatchEvent(new StorageEvent('storage', {
             key: CHAT_NOTIFICATION_KEY,
             newValue: newCount.toString(),
             oldValue: currentCount.toString(),
             storageArea: localStorage,
         }));
     } catch (error) {
         console.error("Shopper Chat: Failed to update notification count:", error);
     }
     // --- End Notification Logic ---


    setIsSending(false);

    toast({
      title: "Message Sent (Simulated)",
      description: "The admin will respond shortly (simulated reply).",
    });
  };

  // Handle Enter key press in the input field
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default Enter behavior (like adding a new line)
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
          <CardDescription>Ask questions about missions or report issues.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
           <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
             <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[75%] ${
                        msg.sender === 'You'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p> {/* Added whitespace-pre-wrap */}
                      <p className={`text-xs mt-1 ${msg.sender === 'You' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                 {isSending && ( // Show typing indicator for user message sending
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
            placeholder="Type your message..."
            className="flex-grow"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress} // Add key press handler
            disabled={isSending} // Disable input while sending
          />
          <Button size="icon" onClick={handleSendMessage} disabled={isSending || !inputValue.trim()}>
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
