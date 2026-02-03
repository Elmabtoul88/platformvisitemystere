"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchMissions } from "@/services/fetchData.js";
import { useMessage } from "@/context/message-context";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export default function AdminChatListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [shoppers, setShoppers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const { setMessageCount, decrementMessageCount } = useMessage();

  useEffect(() => {
    const getUsersMessages = async () => {
      try {
        setIsLoading(true);
        const currentUsers = localStorage.getItem("missionViewAuth");
        const parsedUsers = JSON.parse(currentUsers);
        parsedUsers ? setUserId(parsedUsers.user.id) : setUserId(null);

        if (userId) {
          const response = await fetchMissions(
            "messages",
            API_BASE_URL + "chat_messages/" + userId
          );

          if (response) {
            const totalUnread = response.reduce((sum, shopper) => {
              const unreadCount = shopper.is_read || 0;
              return sum + unreadCount;
            }, 0);

            setMessageCount(totalUnread);
            setShoppers(response);
          } else {
            setShoppers([]);
          }

          setIsLoading(false);
        }
      } catch (err) {
        console.error("Erreur chargement messages:", err);
        setIsLoading(false);
      }
    };

    getUsersMessages();
  }, [userId, setMessageCount]);

  const filteredShoppers = useMemo(() => {
    return shoppers.filter(
      (shopper) =>
        shopper.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shopper.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shopper.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shoppers, searchTerm]);

  const handleChatClick = (shopperId) => {
    const shopper = shoppers.find((s) => s.id === shopperId);
    const unreadCount = shopper?.is_read || 0;

    if (unreadCount > 0) {
      decrementMessageCount(unreadCount);
      setShoppers((prev) =>
        prev.map((s) => (s.id === shopperId ? { ...s, is_read: 0 } : s))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading shoppers...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <Users className="w-6 h-6" /> Select Shopper to Chat With
      </h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Shopper List</CardTitle>
          <CardDescription>
            Select a shopper to start a conversation.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shoppers (name, email, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full md:w-1/2 lg:w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShoppers.length > 0 ? (
                filteredShoppers.map((shopper, index) => (
                  <TableRow key={`shopper-${shopper.id}-${index}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage
                            src={shopper.profile_pic_url}
                            alt={shopper.name}
                          />
                          <AvatarFallback>
                            {shopper.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex items-center gap-1.5">
                          <span>{shopper.name}</span>
                          {shopper.is_read > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-4 min-w-[1rem] px-1.5 flex items-center justify-center rounded-full text-[10px]"
                            >
                              {shopper.is_read}
                            </Badge>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{shopper.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          shopper.status === "active" ? "default" : "outline"
                        }
                        className={`capitalize ${
                          shopper.status === "active"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {shopper.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="default" size="sm">
                        <Link
                          href={`/admin/chat/${shopper.id}`}
                          className="inline-flex items-center gap-1"
                          onClick={() => handleChatClick(shopper.id)}
                        >
                          <MessageSquare className="w-4 h-4" /> Chat
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No shoppers found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
