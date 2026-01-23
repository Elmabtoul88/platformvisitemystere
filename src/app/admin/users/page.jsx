"use client";

import React, { useState, useMemo, useTransition, use, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Edit,
  Eye,
  UserX,
  CheckCircle,
  Clock,
  Loader2,
  UserCheck,
} from "lucide-react"; // Added UserCheck
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUsers } from "./users-mock.js"; // Use the shared mock data
import { format } from "date-fns"; // To format dates if needed
import { useRouter } from "next/navigation"; // Import useRouter
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { toggleUserStatusAction } from "../../actions/admin-actions.js"; // Import the server action
import { fetchMissions } from "@/services/fetchData.js";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function AdminUsersPage() {
  const router = useRouter(); // Initialize useRouter
  const { toast } = useToast(); // Initialize useToast
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]); // Replace with API call
  const [isToggling, setIsToggling] = useState(null); // Track which user status is being toggled
  const [isTransitioning, startTransition] = useTransition(); // For optimistic updates

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetchMissions("users", API_BASE_URL + "users");
        console.log("uuusers", response);
        response ? setUsers(response) : [];
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    // Ensure users is an array before filtering
    const usersArray = Array.isArray(users) ? users : [];
    return usersArray.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleViewUser = (userId) => {
    console.log(`Admin: Navigating to view user ${userId}`);
    router.push(`/admin/users/${userId}`); // Navigate to the detail page
  };

  const handleEditUser = (userId) => {
    console.log(`Admin: Navigating to edit user ${userId}`);
    router.push(`/admin/users/${userId}/edit`); // Navigate to the edit page
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setIsToggling(userId);
    console.log(
      `Admin: Toggling status for user ${userId} from ${currentStatus}`
    );

    try {
      // Call server action
      const result = await toggleUserStatusAction(userId, currentStatus);

      if (result.success) {
        // Optimistically update the UI
        startTransition(() => {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId ? { ...user, status: result.newStatus } : user
            )
          );
          // Update the mock data directly (for simulation persistence across navigations)
          const userIndex = mockUsers.findIndex((u) => u.id === userId);
          if (userIndex !== -1) {
            mockUsers[userIndex].status = result.newStatus;
          }
        });
        toast({
          title: "Status Updated",
          description: result.message,
        });
      } else {
        throw new Error(result.message || "Failed to toggle user status.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsToggling(null); // Stop loading indicator
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        Manage Users
      </h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            View, edit, and manage all user accounts.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users (name, email, ID, role, status)..."
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
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Missions Done</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className={isToggling === user.id ? "opacity-50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage
                            src={user.profile_pic_url}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "destructive" : "secondary"
                        }
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "outline"
                        }
                        className={`capitalize ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {user.status === "active" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(user.registration_date, "PP")}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.role === "shopper"
                        ? user.completed_missions_count ?? 0
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={isToggling === user.id}
                          >
                            {isToggling === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {/* View Details Action */}
                          <DropdownMenuItem
                            onClick={() => handleViewUser(user.id)}
                            disabled={isToggling === user.id}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {/* Edit User Action */}
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user.id)}
                            disabled={
                              isToggling === user.id ||
                              user.role ===
                                "admin" /* Optional: Prevent editing admins */
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                          </DropdownMenuItem>
                          {/* Separator */}
                          <DropdownMenuSeparator />
                          {/* Toggle Status Action - Conditional */}
                          {user.role !== "admin" ? ( // Only allow toggling for non-admins
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(user.id, user.status)
                              }
                              disabled={isToggling === user.id}
                              className={
                                user.status === "active"
                                  ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                                  : "text-green-600 focus:text-green-700 focus:bg-green-100/50"
                              }
                            >
                              {user.status === "active" ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" /> Deactivate
                                  User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />{" "}
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                          ) : (
                            // Optional: Show a disabled item for admins
                            <DropdownMenuItem disabled>
                              <UserX className="mr-2 h-4 w-4 opacity-50" />
                              <span className="opacity-50">
                                (Cannot change status)
                              </span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found matching your search criteria.
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
