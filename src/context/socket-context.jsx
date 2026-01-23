"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./auth-context"; // Use auth context to get user info

const SocketContext = createContext(null);

// Use environment variable for API URL, fallback to localhost
// Ensure the variable name matches exactly what's defined (e.g., NEXT_PUBLIC_API_URL)
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;
// Log the initial value ONLY during client-side execution
if (typeof window !== "undefined") {
  console.log(
    "SocketProvider: Initial SOCKET_URL from env:",
    process.env.NEXT_PUBLIC_API_URL
  );
  console.log(
    "SocketProvider: Using SOCKET_URL:",
    SOCKET_URL || "http://localhost:5001"
  ); // Log fallback if used
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated, token } = useAuth(); // Get auth state

  const connectSocket = useCallback(() => {
    // Prevent connection if not authenticated or already connected/connecting
    if (!isAuthenticated) {
      console.log(
        "SocketProvider: User not authenticated, skipping socket connection."
      );
      return;
    }
    // Check if socket exists and is connected or connecting
    if (socket && (socket.connected || socket.connecting)) {
      console.log(
        `SocketProvider: Socket already ${
          socket.connected ? "connected" : "connecting"
        }. State:`,
        socket?.readyState
      ); // Add null check for readyState
      return;
    }

    // **Critical Check:** Verify SOCKET_URL right before connection attempt
    const effectiveSocketUrl = SOCKET_URL || "http://localhost:5001"; // Use fallback if env var is missing
    console.log(
      `SocketProvider: Preparing to connect. Effective URL: ${effectiveSocketUrl}`
    );

    // **** ADDED CHECK ****
    if (!effectiveSocketUrl || typeof effectiveSocketUrl !== "string") {
      console.error(
        "SocketProvider CRITICAL: Effective SOCKET_URL is invalid or missing right before io() call. Cannot connect.",
        { url: effectiveSocketUrl }
      );
      setIsConnected(false); // Ensure state reflects no connection
      setSocket(null);
      return; // Stop connection attempt
    }

    console.log(
      `SocketProvider: Attempting to connect socket to URL: ${effectiveSocketUrl}`
    );

    let newSocket;
    try {
      // Ensure the URL is valid before passing to io()
      newSocket = io(effectiveSocketUrl, {
        // auth: { token: token }, // Uncomment if backend requires token for socket auth
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5, // Limit reconnection attempts
        reconnectionDelay: 3000, // Wait 3s between attempts
        // Removed explicit namespace, use default '/' unless specified otherwise by backend
      });
      console.log("SocketProvider: Socket instance created.");
      // Set the socket state immediately to prevent multiple connection attempts
      setSocket(newSocket);
    } catch (error) {
      console.error("SocketProvider: Error creating socket instance.", error, {
        url: effectiveSocketUrl,
      });
      setIsConnected(false); // Ensure state reflects no connection
      setSocket(null); // Clear socket state on creation error
      return; // Stop if instance creation fails
    }

    newSocket.on("connect", () => {
      console.log(
        "SocketProvider: Socket connected successfully:",
        newSocket.id
      );
      setIsConnected(true);
      // No need to setSocket(newSocket) here, already set above
      if (user) {
        console.log(
          `SocketProvider: Emitting 'join' event for user: ${user.id}, role: ${user.role}`
        );
        newSocket.emit("join", { userId: user.id, role: user.role });
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("SocketProvider: Socket disconnected:", reason);
      setIsConnected(false);
      setSocket(null); // Clear socket state on disconnect
      // Optional: Implement reconnection logic here if needed
    });

    newSocket.on("connect_error", (error) => {
      // Log the full error object for more details
      console.error(
        "SocketProvider: Socket connection error:",
        error.message,
        error
      );
      setIsConnected(false);
      // Don't nullify the socket immediately on connect_error if reconnection is enabled
      // setSocket(null); // Consider removing this line if using reconnection
      // If reconnection fails permanently, the 'disconnect' event might handle cleanup
    });

    // Return cleanup function
    return () => {
      if (newSocket && newSocket.connected) {
        console.log("SocketProvider: Cleaning up socket connection.");
        newSocket.disconnect();
        setSocket(null); // Clear socket state on cleanup
        setIsConnected(false);
      } else if (newSocket) {
        console.log(
          "SocketProvider: Cleaning up potentially connecting socket."
        );
        newSocket.disconnect(); // Attempt disconnect even if not fully connected
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, user, token, socket]); // socket dependency prevents re-running connectSocket if already connected

  useEffect(() => {
    let cleanupFunction;
    if (isAuthenticated && !socket) {
      console.log("SocketProvider: Auth state valid, attempting connection...");
      // Run connectSocket and store the returned cleanup function
      cleanupFunction = connectSocket();
    } else if (!isAuthenticated && socket) {
      console.log(
        "SocketProvider: Auth state invalid, disconnecting existing socket."
      );
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    // Ensure cleanup runs when the component unmounts or dependencies change significantly
    return () => {
      if (typeof cleanupFunction === "function") {
        console.log("SocketProvider: Running connection cleanup function.");
        cleanupFunction();
      }
    };
    // Ensure connectSocket is stable due to useCallback, only run effect when isAuthenticated or socket state changes
  }, [isAuthenticated, socket, connectSocket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
