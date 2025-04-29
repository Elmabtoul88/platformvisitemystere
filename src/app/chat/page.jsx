'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatPage() {
  // Placeholder chat messages
  const messages = [
    { id: 1, sender: 'Admin', text: 'Hello! How can I help you today?', time: '10:30 AM' },
    { id: 2, sender: 'You', text: 'I have a question about mission #mission-2.', time: '10:31 AM' },
    { id: 3, sender: 'Admin', text: 'Sure, what is your question?', time: '10:32 AM' },
    // Add more placeholder messages as needed
  ];

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
           <ScrollArea className="h-full p-4">
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
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'You' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
           </ScrollArea>
        </CardContent>
        <div className="p-4 border-t flex items-center gap-2 bg-background">
          <Input type="text" placeholder="Type your message..." className="flex-grow" />
          <Button size="icon">
            <Send className="w-4 h-4" />
            <span className="sr-only">Send Message</span>
          </Button>
        </div>
      </Card>
      {/* Placeholder notice */}
      <p className="text-center text-xs text-muted-foreground mt-4">
         Note: Chat functionality is currently a placeholder. Messages are not sent.
      </p>
    </div>
  );
}
