'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { mockUsers } from '../../users/users-mock.js'; // Import mock users
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


// Initial mock messages for a specific user chat
const getInitialMessages = (userName) => [
  { id: 1, sender: 'Admin', text: `Hello ${userName}! How can I assist you?`, time: '10:30 AM' },
  // Add more mock history if needed
];

const CHAT_NOTIFICATION_KEY = 'chatNotificationCount';

export default function AdminChatPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    // Find the user from mock data
    const foundUser = mockUsers.find(u => u.id === userId && u.role === 'shopper');
    if (foundUser) {
      setUser(foundUser);
      setMessages(getInitialMessages(foundUser.name)); // Initialize messages for this user
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Shopper not found.' });
      router.push('/admin/chat'); // Redirect if user not found
    }
    setIsLoading(false);
  }, [userId, router, toast]);


  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
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

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isSending || !user) return;

    setIsSending(true);

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: Date.now(),
      sender: 'Admin', // Admin is sending the message
      text: text,
      time: currentTime,
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputValue('');

    console.log(`Admin sending message to ${user.name}:`, newMessage);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Simulate a reply FROM the shopper (for demonstration)
    const shopperReply = {
      id: Date.now() + 1,
      sender: user.name, // Shopper's name as sender
      text: "Okay, thanks for the information! (Simulated reply)",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add shopper reply and increment notification count
    setMessages(prevMessages => [...prevMessages, shopperReply]);

    // --- Notification Logic ---
    try {
        const currentCount = parseInt(localStorage.getItem(CHAT_NOTIFICATION_KEY) || '0', 10);
        const newCount = currentCount + 1;
        localStorage.setItem(CHAT_NOTIFICATION_KEY, newCount.toString());
        console.log(`Incremented notification count to ${newCount}`);
        // Manually dispatch a storage event so the ProfileMenu updates
        window.dispatchEvent(new StorageEvent('storage', {
            key: CHAT_NOTIFICATION_KEY,
            newValue: newCount.toString(),
            oldValue: currentCount.toString(),
            storageArea: localStorage,
        }));
    } catch (error) {
        console.error("Failed to update notification count in localStorage:", error);
    }
    // --- End Notification Logic ---


    setIsSending(false);

    toast({
      title: "Message Sent (Simulated)",
      description: `Your message to ${user.name} was sent.`,
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
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
     // Handled by redirect in useEffect, but good fallback
      return (
         <div className="container mx-auto py-8 px-4 flex justify-center">
            <p>Shopper not found.</p>
              <Button asChild variant="link" className="mt-4">
                 <Link href="/admin/chat"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Chat List</Link>
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
                <AvatarImage src={user.profilePicUrl} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'S'}</AvatarFallback>
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
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[75%] ${
                        msg.sender === 'Admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'Admin' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                        {msg.time}
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
