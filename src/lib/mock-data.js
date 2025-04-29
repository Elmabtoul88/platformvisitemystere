export const mockMissions = [
  {
    id: 'mission-1',
    title: 'Dinner Service Evaluation at Gourmet Place',
    description: 'Evaluate the dinner service quality, food presentation, and overall ambiance. Order a main course and a drink. Submit report within 24 hours.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    reward: 50,
    location: '123 Main St, Anytown',
    category: 'Restaurant',
    status: 'available',
    businessName: 'Gourmet Place Inc.',
  },
  {
    id: 'mission-2',
    title: 'Retail Store Cleanliness Check',
    description: 'Visit the downtown branch and assess store cleanliness, staff helpfulness, and product availability. Purchase a small item.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    reward: 35,
    location: '456 Oak Ave, Anytown',
    category: 'Retail',
    status: 'assigned',
    assignedTo: 'user-shopper-1',
    businessName: 'Fashion Forward Ltd.',
  },
  {
    id: 'mission-3',
    title: 'Coffee Shop Speed of Service',
    description: 'Order a standard latte during peak morning hours (8-9 AM) and time the service from order to receiving the drink.',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    reward: 20,
    location: '789 Pine Ln, Anytown',
    category: 'Service',
    status: 'available',
    businessName: 'Quick Coffee Co.',
  },
  {
    id: 'mission-4',
    title: 'Completed: Hotel Check-in Experience',
    description: 'Assess the check-in process, staff friendliness, and lobby atmosphere.',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (deadline passed)
    reward: 70,
    location: '101 River Rd, Anytown',
    category: 'Service',
    status: 'completed', // Report submitted and approved
    assignedTo: 'user-shopper-1',
    businessName: 'Grand Hotel Group',
  },
   {
    id: 'mission-5',
    title: 'Fast Food Drive-Thru Accuracy',
    description: 'Order a specific meal combo via drive-thru and verify order accuracy and speed.',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    reward: 25,
    location: '222 Burger Blvd, Anytown',
    category: 'Restaurant',
    status: 'available',
    businessName: 'Burger Bonanza',
  },
];

export const mockReports = [
  {
    id: 'report-1',
    missionId: 'mission-4', // Linked to the completed mission
    userId: 'user-shopper-1',
    rating: 4,
    comments: 'Check-in was smooth, staff were polite. Lobby was clean but a bit dated.',
    photoUrl: 'https://picsum.photos/400/300?random=1',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Submitted 1 day ago
    status: 'approved',
  },
  // Add more reports if needed for testing different states
];

// Mock user for context (replace with actual authentication data later)
export const mockUser = {
  id: 'user-shopper-1',
  name: 'Alex Shopper',
  role: 'shopper',
};
