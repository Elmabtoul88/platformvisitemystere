import type { z } from "zod";
import type { reportSchema } from "@/lib/validators";

export interface Mission {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  reward: number;
  location: string;
  category: string; // e.g., 'Restaurant', 'Retail', 'Service'
  status: 'available' | 'assigned' | 'completed' | 'submitted' | 'approved'; // Added more statuses
  businessName: string; // Added for context
  assignedTo?: string; // User ID of the assigned shopper
}

export type ReportInput = z.infer<typeof reportSchema>;

export interface Report extends ReportInput {
  id: string;
  missionId: string;
  userId: string; // Assuming user context is available
  submittedAt: Date;
  status: 'submitted' | 'approved' | 'rejected';
}

// Example User type (replace with actual user context if available)
export interface User {
  id: string;
  name: string;
  role: 'shopper' | 'business' | 'admin';
}
