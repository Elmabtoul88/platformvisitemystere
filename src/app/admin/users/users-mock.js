// Shared mock user data to ensure consistency across admin pages during simulation
import { mockUser as mockSingleUser } from "@/lib/mock-data";

// Generate more mock users for the list
const generateMockUsers = (count) => {
  const users = [];
  const usedIds = new Set(); // Keep track of used IDs

  // Generate shoppers
  for (let i = 1; i <= count; i++) {
    const userId = `user-shopper-${i}`;
    if (usedIds.has(userId)) continue; // Skip if ID already used
    users.push({
      id: userId,
      name: `Shopper ${i}`,
      email: `shopper${i}@example.com`,
      role: "shopper",
      profilePicUrl: `https://picsum.photos/seed/${userId}/40/40`,
      status: i % 3 !== 0 ? "active" : "inactive", // Make roughly 2/3 active
      city: ["Anytown", "Otherville", "Metroburg", "Smalltown"][i % 4], // Cycle through cities
      telephone: `+1-555-00${String(i).padStart(2, "0")}`, // Example phone
      motivation: `Interested shopper #${i} looking for opportunities.`,
      cvUrl: i % 6 === 0 ? `/mock-cv/cv_${userId}.pdf` : null, // More CVs
      birthYear: 1980 + (i % 25), // Wider age range
      gender: ["female", "male", "other", "prefer_not_say"][i % 4], // Cycle genders
      // Simulate varied registration dates over the last year (approx)
      registrationDate: new Date(
        Date.now() - Math.floor(Math.random() * 365 + 1) * 24 * 60 * 60 * 1000
      ),
      completedMissions: Math.floor(Math.random() * 35), // Wider mission count range
      unreadMessages: i % 5 === 0 ? Math.floor(Math.random() * 5) + 1 : 0, // Add simulated unread messages for some users
    });
    usedIds.add(userId);
  }

  // Add the original mock user (Alex Shopper) if ID is unique
  const alexUserId = mockSingleUser.id;
  if (!usedIds.has(alexUserId)) {
    users.push({
      ...mockSingleUser,
      id: alexUserId,
      name: "Alex Shopper (Original)", // Distinguish if needed
      email: "alex@example.com", // Ensure email is set
      status: "active",
      telephone: "+1-555-123-4567", // Example phone for Alex
      // Make Alex's registration date more recent for variety
      registrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completedMissions: 7,
      unreadMessages: Math.floor(Math.random() * 3), // Give Alex some random unread messages too
    });
    usedIds.add(alexUserId);
  } else {
    console.warn(
      `Mock user ID conflict for ${alexUserId}. Alex might not be included.`
    );
  }

  // Add a mock admin user
  const adminUserId = "admin-1";
  if (!usedIds.has(adminUserId)) {
    users.push({
      id: adminUserId,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      profilePicUrl: null,
      status: "active",
      city: "HQ",
      telephone: "+1-800-ADMIN-0",
      motivation: "System Administrator.",
      cvUrl: null,
      birthYear: null,
      gender: "prefer_not_say",
      registrationDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
      completedMissions: 0,
      unreadMessages: 0, // Admins don't have unread messages in this context
    });
    usedIds.add(adminUserId);
  }
  return users;
};

// Export the generated list
// Increase the number of generated users to 25
export let mockUsers = generateMockUsers(25);

// Function to clear unread messages for a user (for simulation)
export function clearUserUnreadMessages(userId) {
  const userIndex = mockUsers.findIndex((u) => u.id === userId);
  if (userIndex > -1) {
    mockUsers[userIndex].unreadMessages = 0;
    console.log(`Cleared unread messages for user ${userId} in mock data.`);
    return true;
  }
  return false;
}
