

// IMPORTANT: This file maintains the mock data for the application.
// When a server action modifies data (e.g., assigns a mission, approves a report),
// it should directly mutate these arrays. This ensures consistency across the
// client-side simulation.

// Use `let` for arrays that will be modified by server actions
export let mockMissions = [
  {
    id: 'mission-1',
    title: 'Dinner Service Evaluation at Gourmet Place',
    description: 'Evaluate the dinner service quality, food presentation, and overall ambiance. Order a main course and a drink. Submit report within 24 hours.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    reward: 50,
    location: '34.0550,-118.2450', // Lat,Lng format near LA
    category: 'Restaurant',
    status: 'submitted', // User-shopper-1's report is 'approved', others might be 'submitted'
    assignedTo: ['user-shopper-1', 'user-shopper-2', 'user-shopper-3', 'user-shopper-4', 'user-shopper-5'],
    appliedBy: [], // Assume all initial applications for this mission were processed
    businessName: 'Gourmet Place Inc.',
    clientId: 'client-1', // Link to client
  },
  {
    id: 'mission-2',
    title: 'Retail Store Cleanliness Check',
    description: 'Visit the downtown branch and assess store cleanliness, staff helpfulness, and product availability. Purchase a small item.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    reward: 35,
    location: '34.0500,-118.2500',
    category: 'Retail',
    status: 'pending_approval', // Application exists from user-shopper-2
    assignedTo: [],
    appliedBy: ['user-shopper-2'], // user-shopper-2 has applied
    businessName: 'Fashion Forward Ltd.',
    clientId: 'client-2', // Link to client
  },
  {
    id: 'mission-3',
    title: 'Coffee Shop Speed of Service',
    description: 'Order a standard latte during peak morning hours (8-9 AM) and time the service from order to receiving the drink.',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    reward: 20,
    location: '34.0480,-118.2400',
    category: 'Service',
    status: 'pending_approval', // Application exists from user-shopper-3
    assignedTo: [],
    appliedBy: ['user-shopper-3'],
    businessName: 'Quick Coffee Co.',
    clientId: 'client-1',
  },
  {
    id: 'mission-4',
    title: 'Completed: Hotel Check-in Experience',
    description: 'Assess the check-in process, staff friendliness, and lobby atmosphere.',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reward: 70,
    location: '34.0600,-118.2600',
    category: 'Service',
    status: 'approved', // Report from user-shopper-1 is approved
    assignedTo: ['user-shopper-1'],
    appliedBy: [],
    businessName: 'Grand Hotel Group',
    clientId: 'client-3',
  },
   {
    id: 'mission-5',
    title: 'Fast Food Drive-Thru Accuracy',
    description: 'Order a specific meal combo via drive-thru and verify order accuracy and speed.',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    reward: 25,
    location: '34.0580,-118.2350',
    category: 'Restaurant',
    status: 'assigned', // User-shopper-1 was approved & assigned
    assignedTo: ['user-shopper-1'],
    appliedBy: [], // Application was processed
    businessName: 'Burger Bonanza',
    clientId: 'client-1',
  },
    {
    id: 'mission-6',
    title: 'Grocery Store Checkout Efficiency',
    description: 'Evaluate the checkout speed and friendliness of the cashier during evening hours (5-7 PM). Purchase 5-10 items.',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    reward: 30,
    location: '34.0450,-118.2550',
    category: 'Retail',
    status: 'submitted', // Report from user-shopper-1 is submitted
    assignedTo: ['user-shopper-1'],
    appliedBy: [],
    businessName: 'SuperMart Foods',
    clientId: 'client-2',
  },
   {
    id: 'mission-7',
    title: 'Refused: Library Ambiance Check',
    description: 'Assess the noise level and general ambiance of the main reading room.',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reward: 15,
    location: '34.0650,-118.2480',
    category: 'Service',
    status: 'refused', // Report from user-shopper-7 was refused
    assignedTo: ['user-shopper-7'],
    appliedBy: [],
    businessName: 'City Library System',
    clientId: null, // No client
  },
   {
    id: 'mission-8',
    title: 'Electronics Store Demo Station',
    description: 'Interact with the new VR demo station and report on staff assistance and equipment functionality.',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    reward: 45,
    location: '34.0520,-118.2700',
    category: 'Retail',
    status: 'pending_approval', // Application from user-shopper-4
    assignedTo: [],
    appliedBy: ['user-shopper-4'],
    businessName: 'Tech World',
    clientId: 'client-3',
  },
  {
    id: 'mission-9',
    title: 'Bank Customer Service Interaction',
    description: 'Visit a bank branch to inquire about opening a new account. Evaluate the staff knowledge and friendliness.',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    reward: 40,
    location: '34.0700,-118.2800',
    category: 'Service',
    status: 'available',
    assignedTo: [],
    appliedBy: [],
    businessName: 'Community Bank',
    clientId: 'client-3',
  },
  {
    id: 'mission-10',
    title: 'Cinema Experience Review',
    description: 'Watch a newly released movie and report on the cleanliness of the theater, sound/picture quality, and staff service.',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    reward: 60,
    location: '34.0300,-118.2200',
    category: 'Entertainment',
    status: 'available',
    assignedTo: [],
    appliedBy: [],
    businessName: 'Cineplex Central',
    clientId: 'client-1',
  },
   {
    id: 'mission-11',
    title: 'Online Shopping Checkout Process',
    description: 'Evaluate the ease of use of an e-commerce website, from product selection to checkout. No purchase necessary.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    reward: 20,
    location: 'Online',
    category: 'Retail',
    status: 'pending_approval', // user-shopper-5 applied
    assignedTo: [],
    appliedBy: ['user-shopper-5'],
    businessName: 'ShopEasy Online',
    clientId: 'client-2',
  },
  {
    id: 'mission-12',
    title: 'Public Park Maintenance Check',
    description: 'Visit a local park and report on cleanliness, availability of amenities, and overall maintenance.',
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    reward: 15,
    location: '34.0400,-118.2900',
    category: 'Public Service',
    status: 'pending_approval', // Application from user-shopper-6
    assignedTo: [],
    appliedBy: ['user-shopper-6'],
    businessName: 'City Parks Dept.',
    clientId: null,
  },
   {
    id: 'mission-13',
    title: 'New App User Experience Feedback',
    description: 'Download and test a new mobile application. Provide feedback on usability, design, and features.',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    reward: 55,
    location: 'Remote/Online',
    category: 'Technology',
    status: 'available',
    assignedTo: [],
    appliedBy: [],
    businessName: 'Innovate App Co.',
    clientId: 'client-3',
  },
  {
    id: 'mission-14',
    title: 'Museum Exhibit Evaluation',
    description: 'Visit a specific museum exhibit and provide feedback on the presentation, information, and overall experience.',
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    reward: 30,
    location: '34.0620,-118.2300',
    category: 'Entertainment',
    status: 'available',
    assignedTo: [],
    appliedBy: [],
    businessName: 'City Art Museum',
    clientId: null,
  },
  {
    id: 'mission-15',
    title: 'Assigned: Gas Station Attendant Interaction',
    description: 'Evaluate the friendliness and efficiency of the gas station attendant during refueling.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    reward: 18,
    location: '34.0750,-118.2650',
    category: 'Service',
    status: 'assigned', // Assigned to user-shopper-2
    assignedTo: ['user-shopper-2'],
    appliedBy: [],
    businessName: 'FuelUp Stations',
    clientId: 'client-1',
  },
   {
    id: 'mission-16',
    title: 'Completed: Bookstore Staff Recommendation',
    description: 'Ask for a book recommendation in a specific genre and evaluate the staff\'s knowledge and helpfulness.',
    deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    reward: 22,
    location: '34.0510,-118.2750',
    category: 'Retail',
    status: 'approved', // Report from user-shopper-3 approved
    assignedTo: ['user-shopper-3'],
    appliedBy: [],
    businessName: 'The Reading Nook',
    clientId: 'client-2',
  },
  {
    id: 'mission-17',
    title: 'Assigned & Submitted: Car Wash Quality Check',
    description: 'Get a standard car wash and evaluate the thoroughness and quality of the wash.',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    reward: 28,
    location: '34.0250,-118.2150',
    category: 'Service',
    status: 'submitted', // Report from user-shopper-4 submitted
    assignedTo: ['user-shopper-4'],
    appliedBy: [],
    businessName: 'Sparkle Car Wash',
    clientId: 'client-1',
  },
   {
    id: 'mission-18',
    title: 'Another Pending Application Mission',
    description: 'This mission has a pending application from user-shopper-1 and user-shopper-7.',
    deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    reward: 33,
    location: '34.0100,-118.2000',
    category: 'Service',
    status: 'pending_approval',
    assignedTo: [],
    appliedBy: ['user-shopper-1', 'user-shopper-7'],
    businessName: 'Service Check Inc.',
    clientId: 'client-3',
  }
];

// Base mockUser, still used for the currently "logged-in" shopper simulation
export const mockUser = {
  id: 'user-shopper-1',
  name: 'Alex Shopper',
  email: 'alex@example.com',
  role: 'shopper',
  profilePicUrl: `https://picsum.photos/seed/user-shopper-1/100/100`,
  city: 'Anytown',
  motivation: 'Passionate about improving customer experiences and providing detailed feedback.',
  cvUrl: '/mock-cv/alex_shopper_cv.pdf',
  birthYear: 1992,
  gender: 'female',
  // Simulate a hashed password - in a real app, never store plain text passwords
  password: '$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa', // example: "password123"
  registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Registered 30 days ago
  completedMissions: 1, // Example: User has completed 1 mission
  status: 'active',
  telephone: '+1-555-123-4567',
  unreadMessages: 0,
};

// Export all mock users together, including the primary mockUser for context
export const allMockUsers = [
    mockUser, // Alex Shopper (the "logged-in" user for shopper view)
    {
        id: 'user-admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        profilePicUrl: null, // No pic for admin
        status: 'active',
        city: 'HQ',
        telephone: '+1-800-ADMIN-0',
        motivation: 'System Administrator.',
        cvUrl: null,
        birthYear: null,
        gender: 'prefer_not_say',
        password: '$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa', // example: "password123"
        registrationDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
        completedMissions: 0,
        unreadMessages: 0,
    },
    ...generateMockUsers(25).filter(u => u.id !== 'user-shopper-1'), // Generate more shoppers and ensure no duplicates
];


export let mockReports = [
  {
    id: 'report-1',
    missionId: 'mission-4', // Hotel Check-in
    userId: 'user-shopper-1',
    answers: {
        'hotel_checkin_efficiency_rating': { type: 'rating', value: 4 },
        'hotel_staff_friendliness_text': { type: 'text', value: 'Check-in was smooth, staff were polite. Lobby was clean but a bit dated.' },
        'hotel_lobby_photo_image_upload': { type: 'image_upload', value: ['https://picsum.photos/seed/report1img/400/300'] }
    },
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'approved', // Approved
    refusalReason: null,
  },
   {
    id: 'report-2',
    missionId: 'mission-1', // Gourmet Place
    userId: 'user-shopper-1',
    answers: {
        'q_gourmet_1_rating': { type: 'rating', value: 5 },
        'q_gourmet_2_rating': { type: 'rating', value: 4 },
        'q_gourmet_3_text': { type: 'text', value: 'Service was excellent, food was delicious.' },
    },
    submittedAt: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
    status: 'approved', // User-shopper-1's report for mission-1 is approved
    refusalReason: null,
  },
  {
    id: 'report-3',
    missionId: 'mission-1', // Gourmet Place
    userId: 'user-shopper-2',
    answers: {
        'q_gourmet_1_rating': { type: 'rating', value: 4 },
        'q_gourmet_2_rating': { type: 'rating', value: 3 },
        'q_gourmet_3_text': { type: 'text', value: 'Good, but the waiter was a bit slow.' },
    },
    submittedAt: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
    status: 'approved',
    refusalReason: null,
  },
    {
    id: 'report-5',
    missionId: 'mission-1', // Gourmet Place
    userId: 'user-shopper-2',
    answers: {
        'gourmet_service': { type: 'rating', value: 4 },
        'gourmet_food_ambiance': { type: 'text', value: 'Good experience overall. The waiter seemed a bit rushed.'},
        'gourmet_main_course_photo': { type: 'image_upload', value: ['https://picsum.photos/seed/report5img/400/300'] }
    },
    submittedAt: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000),
    status: 'submitted', // Submitted, awaiting review
    refusalReason: null,
  },
    {
    id: 'report-6',
    missionId: 'mission-1', // Gourmet Place
    userId: 'user-shopper-3',
    answers: {
        'gourmet_service': { type: 'rating', value: 3 },
        'gourmet_food_ambiance': { type: 'text', value: 'Food was okay, service could be faster.'},
        'gourmet_main_course_photo': { type: 'image_upload', value: null }
    },
    submittedAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000),
    status: 'submitted', // Submitted, awaiting review
    refusalReason: null,
  },
     {
    id: 'report-7',
    missionId: 'mission-1', // Gourmet Place
    userId: 'user-shopper-4',
    answers: {
        'gourmet_service': { type: 'rating', value: 4 },
        'gourmet_food_ambiance': { type: 'text', value: 'Food was great, service was acceptable.'},
        'gourmet_main_course_photo': { type: 'image_upload', value: ['https://picsum.photos/seed/report7img/400/300'] }
    },
    submittedAt: new Date(Date.now() - 0.4 * 24 * 60 * 60 * 1000),
    status: 'submitted', // Submitted, awaiting review
    refusalReason: null,
  },
     {
    id: 'report-8',
    missionId: 'mission-1', // Gourmet Place
    userId: 'user-shopper-5',
    answers: {
        'gourmet_service': { type: 'rating', value: 2 },
        'gourmet_food_ambiance': { type: 'text', value: 'Waited a long time for food, and it was cold.'},
        'gourmet_main_course_photo': { type: 'image_upload', value: ['https://picsum.photos/seed/report8img/400/300'] }
    },
    submittedAt: new Date(Date.now() - 0.25 * 24 * 60 * 60 * 1000),
    status: 'submitted', // Submitted, awaiting review
    refusalReason: null,
  },
   {
    id: 'report-4',
    missionId: 'mission-6', // Grocery Store
    userId: 'user-shopper-1',
    answers: {
        'q_grocery_1_rating': { type: 'rating', value: 4 },
        'q_grocery_2_rating': { type: 'rating', value: 5 },
        'q_grocery_3_checkboxes': { type: 'checkboxes', value: { 'opt_cash': true, 'opt_card': true, 'opt_mobile': false, 'opt_app': false } }, // Using actual option IDs
        'q_grocery_4_gps_capture': { type: 'gps_capture', value: { lat: 34.0450, lng: -118.2550 } },
        'q_grocery_6_image_upload': { type: 'image_upload', value: ['https://picsum.photos/seed/report4img1/400/300', 'https://picsum.photos/seed/report4img2/400/300'] },
        'q_grocery_7_text': { type: 'text', value: 'Checkout line moved quickly. Cashier was very friendly and efficient.'}
    },
    submittedAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000),
    status: 'submitted', // Submitted, awaiting review
    refusalReason: null,
  },
   {
    id: 'report-9',
    missionId: 'mission-7', // Library Ambiance
    userId: 'user-shopper-7',
    answers: {
        'library_ambiance_text': {type: 'text', value: 'It was quiet.'}
    },
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'refused', // Refused
    refusalReason: "Report was too brief and lacked sufficient detail about the ambiance.",
  },
  {
    id: 'report-10',
    missionId: 'mission-16', // Bookstore
    userId: 'user-shopper-3',
    answers: {
        'bookstore_recommendation_rating': { type: 'rating', value: 5 },
        'bookstore_staff_knowledge_text': { type: 'text', value: 'Staff was very knowledgeable and gave an excellent recommendation.' },
    },
    submittedAt: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000),
    status: 'approved', // Approved
    refusalReason: null,
  },
  {
    id: 'report-11',
    missionId: 'mission-17', // Car Wash
    userId: 'user-shopper-4',
    answers: {
        'carwash_quality_rating': { type: 'rating', value: 3 },
        'carwash_missed_areas_text': { type: 'text', value: 'The car wash was okay, but some spots were missed on the wheels.' },
        'carwash_photo_image_upload': { type: 'image_upload', value: ['https://picsum.photos/seed/report11img/400/300'] },
    },
    submittedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
    status: 'submitted', // Submitted, awaiting review
    refusalReason: null,
  },
  {
    id: 'report-12',
    missionId: 'mission-1',
    userId: 'user-shopper-3',
    answers: {
      'q_gourmet_1_rating': { type: 'rating', value: 3 },
      'q_gourmet_2_rating': { type: 'rating', value: 4 },
      'q_gourmet_3_text': { type: 'text', value: 'Average experience. Nothing special.' },
    },
    submittedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)), // Two months ago
    status: 'approved',
    refusalReason: null,
  },
  {
    id: 'report-13',
    missionId: 'mission-1',
    userId: 'user-shopper-4',
    answers: {
      'q_gourmet_1_rating': { type: 'rating', value: 5 },
      'q_gourmet_2_rating': { type: 'rating', value: 5 },
      'q_gourmet_3_text': { type: 'text', value: 'Absolutely fantastic! Will come again.' },
    },
    submittedAt: new Date(), // This month
    status: 'approved',
    refusalReason: null,
  },
];

// Mock survey questions
export let mockSurveyQuestions = {
  'mission-1': [ // Gourmet Place
       { id: 'gourmet_1', type: 'rating', text: 'Rate the overall service quality.', isRequired: true, maxRating: 5, minLabel: 'Poor', maxLabel: 'Excellent' },
       { id: 'gourmet_2', type: 'rating', text: 'Rate the food quality.', isRequired: true, maxRating: 5, minLabel: 'Poor', maxLabel: 'Excellent' },
       { id: 'gourmet_3', type: 'text', text: 'Comments on food and ambiance.', isRequired: true },
       { id: 'gourmet_4', type: 'image_upload', text: 'Upload a photo of your main course.', isRequired: false, allowMultiple: false, maxImages: 1 },
   ],
  'mission-2': [ // Retail Store Cleanliness
    { id: 'retail_cleanliness_rating', type: 'rating', text: 'Rate the overall cleanliness of the store.', isRequired: true, maxRating: 5, minLabel: 'Dirty', maxLabel: 'Spotless' },
    { id: 'retail_staff_helpfulness_mc', type: 'multiple_choice', text: 'How helpful were the staff members?', isRequired: true, options: [{id: 'very_helpful', text: 'Very Helpful'}, {id: 'somewhat_helpful', text: 'Somewhat Helpful'}, {id: 'not_helpful', text: 'Not Helpful'}, {id: 'no_interaction', text: 'Did not interact'}] },
    { id: 'retail_comments_text', type: 'text', text: 'Provide any additional comments about your experience.', isRequired: false },
    { id: 'retail_storefront_photo_image_upload', type: 'image_upload', text: 'Upload a photo of the storefront.', isRequired: true, allowMultiple: false, maxImages: 1 },
  ],
  'mission-6': [ // Grocery Store Checkout
    { id: 'q_grocery_1_rating', type: 'rating', text: 'Rate the speed of the checkout process.', isRequired: true, maxRating: 5, minLabel: 'Very Slow', maxLabel: 'Very Fast' },
    { id: 'q_grocery_2_rating', type: 'rating', text: 'Rate the friendliness of the cashier.', isRequired: true, maxRating: 5, minLabel: 'Unfriendly', maxLabel: 'Very Friendly' },
    { id: 'q_grocery_3_checkboxes', type: 'checkboxes', text: 'Which payment methods were clearly available?', isRequired: false, options: [{id: 'opt_cash', text: 'Cash'}, {id: 'opt_card', text: 'Credit/Debit Card'}, {id: 'opt_mobile', text: 'Mobile Pay (Apple/Google Pay)'}, {id: 'opt_app', text: 'Store App'}] },
    { id: 'q_grocery_4_gps_capture', type: 'gps_capture', text: 'Capture your location upon leaving the store.', isRequired: true },
    { id: 'q_grocery_5_audio_recording', type: 'audio_recording', text: 'Record a brief audio comment about the checkout noise level (optional).', isRequired: false, maxDurationSeconds: 30 },
    { id: 'q_grocery_6_image_upload', type: 'image_upload', text: 'Upload photos of your receipt and purchased items (up to 3 images).', isRequired: true, allowMultiple: true, maxImages: 3 },
    { id: 'q_grocery_7_text', type: 'text', text: 'Any suggestions for improvement?', isRequired: false },
  ],
  'mission-4': [ // Hotel Check-in
        { id: 'hotel_checkin_efficiency_rating', type: 'rating', text: 'Rate the check-in efficiency.', isRequired: true, maxRating: 5 },
        { id: 'hotel_staff_friendliness_text', type: 'text', text: 'Comments on staff friendliness and lobby atmosphere.', isRequired: true },
        { id: 'hotel_lobby_photo_image_upload', type: 'image_upload', text: 'Upload a photo of the lobby.', isRequired: false, allowMultiple: false, maxImages: 1 },
    ],
  'mission-7': [ // Library Ambiance (minimal questions for the refused report)
        { id: 'library_ambiance_text', type: 'text', text: 'Describe the ambiance of the main reading room.', isRequired: true },
    ],
  'mission-16': [ // Bookstore
        { id: 'bookstore_recommendation_rating', type: 'rating', text: 'Rate the quality of the book recommendation received.', isRequired: true, maxRating: 5 },
        { id: 'bookstore_staff_knowledge_text', type: 'text', text: 'Comments on the staff\'s knowledge and helpfulness.', isRequired: true },
    ],
  'mission-17': [ // Car Wash
        { id: 'carwash_quality_rating', type: 'rating', text: 'Rate the quality of the car wash.', isRequired: true, maxRating: 5, minLabel: 'Poor', maxLabel: 'Excellent' },
        { id: 'carwash_missed_areas_text', type: 'text', text: 'Any specific areas missed or comments on the service?', isRequired: true },
        { id: 'carwash_photo_image_upload', type: 'image_upload', text: 'Upload a photo of the washed car (optional).', isRequired: false, allowMultiple: true, maxImages: 2 },
    ],
};


// Mock applications data
export let mockApplications = [
  { id: 'app-1', mission_id: 'mission-2', user_id: 'user-shopper-2', status: 'pending', applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), refusal_reason: null },
  { id: 'app-2', mission_id: 'mission-3', user_id: 'user-shopper-3', status: 'pending', applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), refusal_reason: null },
  { id: 'app-3', mission_id: 'mission-5', user_id: 'user-shopper-1', status: 'approved', applied_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), refusal_reason: null }, // This one was approved, mission-5 is 'assigned'
  { id: 'app-4', mission_id: 'mission-8', user_id: 'user-shopper-4', status: 'pending', applied_at: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000), refusal_reason: null },
  { id: 'app-5', mission_id: 'mission-11', user_id: 'user-shopper-5', status: 'pending', applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), refusal_reason: null },
  { id: 'app-6', mission_id: 'mission-12', user_id: 'user-shopper-6', status: 'pending', applied_at: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000), refusal_reason: null },
  { id: 'app-7', mission_id: 'mission-18', user_id: 'user-shopper-1', status: 'pending', applied_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), refusal_reason: null },
  { id: 'app-8', mission_id: 'mission-18', user_id: 'user-shopper-7', status: 'pending', applied_at: new Date(Date.now() - 0.4 * 24 * 60 * 60 * 1000), refusal_reason: null },
];

/**
 * NEW: mockAssignments
 * This array stores specific details for a mission assigned to a user.
 * It's created when an admin approves an application and provides specific details.
 */
export let mockAssignments = [
    // This assignment is created when app-3 for mission-5 was approved for user-shopper-1
    {
        id: 'asg-1',
        mission_id: 'mission-5',
        user_id: 'user-shopper-1',
        assigned_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
        specificStoreAddress: '123 Burger Lane, Anytown', // Admin could override the mission's general location
        specificScenario: 'Order the "Mega Burger" combo with a vanilla shake.' // Admin could provide a more specific scenario
    },
    // Other initial assignments for pre-assigned missions
    { id: 'asg-2', mission_id: 'mission-1', user_id: 'user-shopper-1', assigned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: 'asg-3', mission_id: 'mission-4', user_id: 'user-shopper-1', assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { id: 'asg-4', mission_id: 'mission-6', user_id: 'user-shopper-1', assigned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: 'asg-5', mission_id: 'mission-7', user_id: 'user-shopper-7', assigned_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    { id: 'asg-6', mission_id: 'mission-15', user_id: 'user-shopper-2', assigned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: 'asg-7', mission_id: 'mission-16', user_id: 'user-shopper-3', assigned_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    { id: 'asg-8', mission_id: 'mission-17', user_id: 'user-shopper-4', assigned_at: new Date(Date.now() - 0.8 * 24 * 60 * 60 * 1000) },
];



// Helper function to generate mock users - NOT exported
function generateMockUsers(count) {
    const users = [];
    const usedIds = new Set(); // Keep track of used IDs

    // Add mock clients
    users.push({
        id: 'client-1', name: 'Gourmet Place Client', email: 'client@gourmet.com', role: 'client', password: '$2b$10$clientPasswordHash1', status: 'active', registrationDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), unreadMessages: 1, profilePicUrl: 'https://picsum.photos/seed/client-1/40/40',
    });
    usedIds.add('client-1');
    users.push({
        id: 'client-2', name: 'Fashion Forward Client', email: 'client@fashion.com', role: 'client', password: '$2b$10$clientPasswordHash2', status: 'active', registrationDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000), unreadMessages: 0, profilePicUrl: 'https://picsum.photos/seed/client-2/40/40',
    });
    usedIds.add('client-2');
     users.push({
        id: 'client-3', name: 'General Services Client', email: 'client@services.com', role: 'client', password: '$2b$10$clientPasswordHash3', status: 'active', registrationDate: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000), unreadMessages: 0, profilePicUrl: 'https://picsum.photos/seed/client-3/40/40',
    });
    usedIds.add('client-3');


    // Generate shoppers
    for (let i = 1; i <= count; i++) {
        const userId = `user-shopper-${i}`;
        if (usedIds.has(userId)) continue; // Skip if ID already used
        users.push({
            id: userId,
            name: `Shopper ${i}`,
            email: `shopper${i}@example.com`,
            role: 'shopper',
            profilePicUrl: `https://picsum.photos/seed/${userId}/40/40`,
            status: i % 3 !== 0 ? 'active' : 'inactive', // Make roughly 2/3 active
            city: ['Anytown', 'Otherville', 'Metroburg', 'Smalltown'][i % 4], // Cycle through cities
            telephone: `+1-555-00${String(i).padStart(2, '0')}`, // Example phone
            motivation: `Interested shopper #${i} looking for opportunities.`,
            cvUrl: i % 6 === 0 ? `/mock-cv/cv_${userId}.pdf` : null, // More CVs
            birthYear: 1980 + (i % 25), // Wider age range
            gender: ['female', 'male', 'other', 'prefer_not_say'][i % 4], // Cycle genders
             // Simulate varied registration dates over the last year (approx)
             registrationDate: new Date(Date.now() - Math.floor(Math.random() * 365 + 1) * 24 * 60 * 60 * 1000),
            completedMissions: Math.floor(Math.random() * 35), // Wider mission count range
            unreadMessages: i % 5 === 0 ? Math.floor(Math.random() * 5) + 1 : 0, // Add simulated unread messages for some users
            password: `$2b$10$shopperPasswordHash${i}`
        });
        usedIds.add(userId);
    }
    return users;
};
