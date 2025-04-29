
export const mockMissions = [
  {
    id: 'mission-1',
    title: 'Dinner Service Evaluation at Gourmet Place',
    description: 'Evaluate the dinner service quality, food presentation, and overall ambiance. Order a main course and a drink. Submit report within 24 hours.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    reward: 50,
    location: '123 Main St, Anytown',
    category: 'Restaurant',
    status: 'submitted', // Keep as submitted since reports are pending
    // Assign multiple users to simulate multiple reports for the same mission
    assignedTo: ['user-shopper-1', 'user-shopper-2', 'user-shopper-3', 'user-shopper-4', 'user-shopper-5'],
    businessName: 'Gourmet Place Inc.',
  },
  {
    id: 'mission-2', // Has survey questions defined below
    title: 'Retail Store Cleanliness Check',
    description: 'Visit the downtown branch and assess store cleanliness, staff helpfulness, and product availability. Purchase a small item.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    reward: 35,
    location: '456 Oak Ave, Anytown',
    category: 'Retail',
    status: 'submitted', // Report exists for user-shopper-1
    assignedTo: 'user-shopper-1', // Only assigned to one user
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
    status: 'assigned',
    assignedTo: 'user-shopper-6', // Assign to a different user
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
    status: 'approved', // Approved mission
    assignedTo: 'user-shopper-1', // Completed by user 1
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
    status: 'available', // Still available
    businessName: 'Burger Bonanza',
  },
    {
    id: 'mission-6', // Has survey questions defined below
    title: 'Grocery Store Checkout Efficiency',
    description: 'Evaluate the checkout speed and friendliness of the cashier during evening hours (5-7 PM). Purchase 5-10 items.',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    reward: 30,
    location: '333 Market St, Anytown',
    category: 'Retail',
    status: 'submitted', // Report exists for user-shopper-1
    assignedTo: 'user-shopper-1',
    businessName: 'SuperMart Foods',
  },
   {
    id: 'mission-7',
    title: 'Refused: Library Ambiance Check',
    description: 'Assess the noise level and general ambiance of the main reading room.',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    reward: 15,
    location: '444 Bookworm Way, Anytown',
    category: 'Service',
    status: 'refused', // Mission status is refused
    assignedTo: 'user-shopper-7',
    businessName: 'City Library System',
  },
];

export const mockReports = [
  {
    id: 'report-1',
    missionId: 'mission-4', // Linked to the approved mission
    userId: 'user-shopper-1',
    answers: {
        'q_hotel_1_rating': { type: 'rating', value: 4 },
        'q_hotel_2_text': { type: 'text', value: 'Check-in was smooth, staff were polite. Lobby was clean but a bit dated.' },
        'q_hotel_3_image_upload': { type: 'image_upload', value: ['https://picsum.photos/400/300?random=1'] }
    },
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Submitted 1 day ago
    status: 'approved',
    refusalReason: null,
  },
   {
    id: 'report-2',
    missionId: 'mission-2', // Linked to an assigned mission with survey questions
    userId: 'user-shopper-1',
    answers: {
        'q_1700000000001_rating': { type: 'rating', value: 5 }, // Overall Store Rating
        'q_1700000000002_multiple_choice': { type: 'multiple_choice', value: 'Very Helpful' }, // Staff Helpfulness
        'q_1700000000003_text': { type: 'text', value: 'Store was very clean and well-organized. Staff member Sarah was extremely helpful in finding the item I needed. Quick checkout.' }, // Comments
        'q_1700000000004_image_upload': { type: 'image_upload', value: ['https://picsum.photos/400/300?random=2'] } // Storefront Photo
    },
    submittedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // Submitted 12 hours ago
    status: 'submitted', // Report is submitted but not yet approved by business
    refusalReason: null,
  },
   { // Report 1 for mission-1 (pending)
    id: 'report-3',
    missionId: 'mission-1',
    userId: 'user-shopper-1',
    answers: {
        'gourmet_1': { type: 'rating', value: 3 },
        'gourmet_2': { type: 'text', value: 'Service was a bit slow, but the food (steak) was cooked perfectly. Ambiance was nice.'},
        'gourmet_3': { type: 'image_upload', value: ['https://picsum.photos/400/300?random=11'] }
    },
    submittedAt: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000),
    status: 'submitted',
    refusalReason: null,
  },
   { // Report 2 for mission-1 (pending)
    id: 'report-5',
    missionId: 'mission-1',
    userId: 'user-shopper-2',
    answers: {
        'gourmet_1': { type: 'rating', value: 5 },
        'gourmet_2': { type: 'text', value: 'Excellent service, very attentive staff. Food was delicious.'},
        'gourmet_3': { type: 'image_upload', value: ['https://picsum.photos/400/300?random=12'] }
    },
    submittedAt: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000),
    status: 'submitted',
    refusalReason: null,
  },
    { // Report 3 for mission-1 (pending)
    id: 'report-6',
    missionId: 'mission-1',
    userId: 'user-shopper-3',
    answers: {
        'gourmet_1': { type: 'rating', value: 4 },
        'gourmet_2': { type: 'text', value: 'Good experience overall. The waiter seemed a bit rushed.'},
        'gourmet_3': { type: 'image_upload', value: null } // No image submitted
    },
    submittedAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000),
    status: 'submitted',
    refusalReason: null,
  },
     { // Report 4 for mission-1 (pending)
    id: 'report-7',
    missionId: 'mission-1',
    userId: 'user-shopper-4',
    answers: {
        'gourmet_1': { type: 'rating', value: 4 },
        'gourmet_2': { type: 'text', value: 'Food was great, service was acceptable.'},
        'gourmet_3': { type: 'image_upload', value: ['https://picsum.photos/400/300?random=14'] }
    },
    submittedAt: new Date(Date.now() - 0.4 * 24 * 60 * 60 * 1000),
    status: 'submitted',
    refusalReason: null,
  },
     { // Report 5 for mission-1 (pending)
    id: 'report-8',
    missionId: 'mission-1',
    userId: 'user-shopper-5',
    answers: {
        'gourmet_1': { type: 'rating', value: 2 },
        'gourmet_2': { type: 'text', value: 'Waited a long time for food, and it was cold.'},
        'gourmet_3': { type: 'image_upload', value: ['https://picsum.photos/400/300?random=15'] }
    },
    submittedAt: new Date(Date.now() - 0.25 * 24 * 60 * 60 * 1000),
    status: 'submitted',
    refusalReason: null,
  },
   { // Report for mission-6 (pending)
    id: 'report-4',
    missionId: 'mission-6',
    userId: 'user-shopper-1',
    answers: {
        'q_1700000000010_rating': { type: 'rating', value: 4 },
        'q_1700000000011_rating': { type: 'rating', value: 5 },
        'q_1700000000012_checkboxes': { type: 'checkboxes', value: { '1': true, '2': true, '3': false, '4': false } },
        'q_1700000000013_gps_capture': { type: 'gps_capture', value: { lat: 34.0522, lng: -118.2437 } },
        'q_1700000000015_image_upload': { type: 'image_upload', value: ['https://picsum.photos/400/300?random=61', 'https://picsum.photos/400/300?random=62'] },
        'q_1700000000016_text': { type: 'text', value: 'Checkout line moved quickly. Cashier was very friendly and efficient.'}
    },
    submittedAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000), // Submitted very recently
    status: 'submitted',
    refusalReason: null,
  },
   { // Report for mission-7 (refused)
    id: 'report-9',
    missionId: 'mission-7',
    userId: 'user-shopper-7',
    answers: {
        // Add mock answers if needed
    },
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Submitted 4 days ago
    status: 'refused',
    refusalReason: "Report was too brief and lacked sufficient detail about the ambiance.",
  },
];

// Mock user for context (replace with actual authentication data later)
export const mockUser = {
  id: 'user-shopper-1',
  name: 'Alex Shopper', // This might be the full name
  role: 'shopper',
  profilePicUrl: null, // Set to null initially, or provide a default URL like 'https://picsum.photos/seed/user-shopper-1/100/100'
  city: 'Anytown', // Added city
  motivation: 'Passionate about improving customer experiences and providing detailed feedback.', // Added motivation
  cvUrl: null, // Added cvUrl, initially null
  birthYear: 1992, // Added birth year
  gender: 'female', // Added gender ('male', 'female', 'other', 'prefer_not_say')
};


// Mock Survey Questions for specific missions
export const mockSurveyQuestions = {
  // Questions for mission-2: Retail Store Cleanliness Check
  'mission-2': [
    { id: 'q_1700000000001_rating', type: 'rating', text: 'Rate the overall cleanliness of the store.', isRequired: true, maxRating: 5, minLabel: 'Dirty', maxLabel: 'Spotless' },
    { id: 'q_1700000000002_multiple_choice', type: 'multiple_choice', text: 'How helpful were the staff members?', isRequired: true, options: [{id: 1, text: 'Very Helpful'}, {id: 2, text: 'Somewhat Helpful'}, {id: 3, text: 'Not Helpful'}, {id: 4, text: 'Did not interact'}] },
    { id: 'q_1700000000003_text', type: 'text', text: 'Provide any additional comments about your experience.', isRequired: false },
    { id: 'q_1700000000004_image_upload', type: 'image_upload', text: 'Upload a photo of the storefront.', isRequired: true, allowMultiple: false, maxImages: 1 },
  ],
  // Questions for mission-6: Grocery Store Checkout Efficiency
  'mission-6': [
    { id: 'q_1700000000010_rating', type: 'rating', text: 'Rate the speed of the checkout process.', isRequired: true, maxRating: 5, minLabel: 'Very Slow', maxLabel: 'Very Fast' },
    { id: 'q_1700000000011_rating', type: 'rating', text: 'Rate the friendliness of the cashier.', isRequired: true, maxRating: 5, minLabel: 'Unfriendly', maxLabel: 'Very Friendly' },
    { id: 'q_1700000000012_checkboxes', type: 'checkboxes', text: 'Which payment methods were clearly available?', isRequired: false, options: [{id: 1, text: 'Cash'}, {id: 2, text: 'Credit/Debit Card'}, {id: 3, text: 'Mobile Pay (Apple/Google Pay)'}, {id: 4, text: 'Store App'}] },
    { id: 'q_1700000000013_gps_capture', type: 'gps_capture', text: 'Capture your location upon leaving the store.', isRequired: true },
    { id: 'q_1700000000014_audio_recording', type: 'audio_recording', text: 'Record a brief audio comment about the checkout noise level (optional).', isRequired: false, maxDurationSeconds: 30 },
    { id: 'q_1700000000015_image_upload', type: 'image_upload', text: 'Upload photos of your receipt and purchased items (up to 3 images).', isRequired: true, allowMultiple: true, maxImages: 3 },
    { id: 'q_1700000000016_text', type: 'text', text: 'Any suggestions for improvement?', isRequired: false },
  ],
   // Minimal questions for mission-1: Gourmet Place
   'mission-1': [
       { id: 'gourmet_1', type: 'rating', text: 'Rate the overall service quality.', isRequired: true, maxRating: 5, minLabel: 'Poor', maxLabel: 'Excellent' },
       { id: 'gourmet_2', type: 'text', text: 'Comments on food and ambiance.', isRequired: true },
       { id: 'gourmet_3', type: 'image_upload', text: 'Upload a photo of your main course.', isRequired: false, allowMultiple: false, maxImages: 1 },
   ],
   // Add questions for mission-4 if needed for viewing completed reports
    'mission-4': [
        { id: 'q_hotel_1_rating', type: 'rating', text: 'Rate the check-in efficiency.', isRequired: true, maxRating: 5 },
        { id: 'q_hotel_2_text', type: 'text', text: 'Comments on staff friendliness and lobby atmosphere.', isRequired: true },
        { id: 'q_hotel_3_image_upload', type: 'image_upload', text: 'Upload a photo of the lobby.', isRequired: false, allowMultiple: false },
    ],
   // No specific questions needed for mission-3, mission-5, or mission-7 for now
};
