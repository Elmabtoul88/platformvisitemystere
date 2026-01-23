export const mockMissions = [
  {
    id: "mission-1",
    title: "Dinner Service Evaluation at Gourmet Place",
    description:
      "Evaluate the dinner service quality, food presentation, and overall ambiance. Order a main course and a drink. Submit report within 24 hours.",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    reward: 50,
    location: "34.0550,-118.2450", // Lat,Lng format near LA
    category: "Restaurant",
    status: "submitted", // User-shopper-1's report is 'approved', others might be 'submitted'
    assignedTo: [
      "user-shopper-1",
      "user-shopper-2",
      "user-shopper-3",
      "user-shopper-4",
      "user-shopper-5",
    ],
    appliedBy: [], // Shoppers who have applied
    businessName: "Gourmet Place Inc.",
  },
  {
    id: "mission-2", // Has survey questions defined below
    title: "Retail Store Cleanliness Check",
    description:
      "Visit the downtown branch and assess store cleanliness, staff helpfulness, and product availability. Purchase a small item.",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    reward: 35,
    location: "34.0500,-118.2500", // Lat,Lng format near LA
    category: "Retail",
    status: "pending_approval", // Changed to pending_approval as an application exists
    assignedTo: null, // Not assigned yet
    appliedBy: ["user-shopper-2"], // user-shopper-2 has applied
    businessName: "Fashion Forward Ltd.",
  },
  {
    id: "mission-3",
    title: "Coffee Shop Speed of Service",
    description:
      "Order a standard latte during peak morning hours (8-9 AM) and time the service from order to receiving the drink.",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    reward: 20,
    location: "34.0480,-118.2400", // Lat,Lng format near LA
    category: "Service",
    status: "pending_approval", // Changed to pending_approval
    assignedTo: null, // Not assigned yet
    appliedBy: ["user-shopper-3"], // user-shopper-3 has applied
    businessName: "Quick Coffee Co.",
  },
  {
    id: "mission-4",
    title: "Completed: Hotel Check-in Experience",
    description:
      "Assess the check-in process, staff friendliness, and lobby atmosphere.",
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (deadline passed)
    reward: 70,
    location: "34.0600,-118.2600", // Lat,Lng format near LA
    category: "Service",
    status: "approved", // Approved mission
    assignedTo: ["user-shopper-1"], // Completed by user 1
    appliedBy: [],
    businessName: "Grand Hotel Group",
  },
  {
    id: "mission-5",
    title: "Fast Food Drive-Thru Accuracy",
    description:
      "Order a specific meal combo via drive-thru and verify order accuracy and speed.",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    reward: 25,
    location: "34.0580,-118.2350", // Lat,Lng format near LA
    category: "Restaurant",
    status: "assigned", // user-shopper-1 was approved for this
    assignedTo: ["user-shopper-1"],
    appliedBy: [],
    businessName: "Burger Bonanza",
  },
  {
    id: "mission-6", // Has survey questions defined below
    title: "Grocery Store Checkout Efficiency",
    description:
      "Evaluate the checkout speed and friendliness of the cashier during evening hours (5-7 PM). Purchase 5-10 items.",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    reward: 30,
    location: "34.0450,-118.2550", // Lat,Lng format near LA
    category: "Retail",
    status: "submitted", // Report exists for user-shopper-1
    assignedTo: ["user-shopper-1"],
    appliedBy: [],
    businessName: "SuperMart Foods",
  },
  {
    id: "mission-7",
    title: "Refused: Library Ambiance Check",
    description:
      "Assess the noise level and general ambiance of the main reading room.",
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    reward: 15,
    location: "34.0650,-118.2480", // Lat,Lng format near LA
    category: "Service",
    status: "refused", // Mission status is refused
    assignedTo: ["user-shopper-7"], // Was assigned, then report refused
    appliedBy: [],
    businessName: "City Library System",
  },
  {
    id: "mission-8",
    title: "Electronics Store Demo Station",
    description:
      "Interact with the new VR demo station and report on staff assistance and equipment functionality.",
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    reward: 45,
    location: "34.0520,-118.2700", // Lat,Lng format near LA
    category: "Retail",
    status: "available", // Still available
    assignedTo: null,
    appliedBy: ["user-shopper-4"], // user-shopper-4 has applied
    businessName: "Tech World",
  },
  // Additional Missions for Variety
  {
    id: "mission-9",
    title: "Bank Customer Service Interaction",
    description:
      "Visit a bank branch to inquire about opening a new account. Evaluate the staff knowledge and friendliness.",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    reward: 40,
    location: "34.0700,-118.2800",
    category: "Service",
    status: "available",
    assignedTo: null,
    appliedBy: [],
    businessName: "Community Bank",
  },
  {
    id: "mission-10",
    title: "Cinema Experience Review",
    description:
      "Watch a newly released movie and report on the cleanliness of the theater, sound/picture quality, and staff service.",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    reward: 60,
    location: "34.0300,-118.2200",
    category: "Entertainment",
    status: "available",
    assignedTo: null,
    appliedBy: [],
    businessName: "Cineplex Central",
  },
  {
    id: "mission-11",
    title: "Online Shopping Checkout Process",
    description:
      "Evaluate the ease of use of an e-commerce website, from product selection to checkout. No purchase necessary.",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    reward: 20,
    location: "Online",
    category: "Retail",
    status: "available", // Was 'refused' in applications, but mission itself is available
    assignedTo: null,
    appliedBy: [], // user-shopper-5 application was refused
    businessName: "ShopEasy Online",
  },
  {
    id: "mission-12",
    title: "Public Park Maintenance Check",
    description:
      "Visit a local park and report on cleanliness, availability of amenities, and overall maintenance.",
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    reward: 15,
    location: "34.0400,-118.2900",
    category: "Public Service",
    status: "pending_approval",
    assignedTo: null,
    appliedBy: ["user-shopper-6"],
    businessName: "City Parks Dept.",
  },
  {
    id: "mission-13",
    title: "New App User Experience Feedback",
    description:
      "Download and test a new mobile application. Provide feedback on usability, design, and features.",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    reward: 55,
    location: "Remote/Online",
    category: "Technology",
    status: "available",
    assignedTo: null,
    appliedBy: [],
    businessName: "Innovate App Co.",
  },
  {
    id: "mission-14",
    title: "Museum Exhibit Evaluation",
    description:
      "Visit a specific museum exhibit and provide feedback on the presentation, information, and overall experience.",
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    reward: 30,
    location: "34.0620,-118.2300",
    category: "Entertainment",
    status: "available",
    assignedTo: null,
    appliedBy: [],
    businessName: "City Art Museum",
  },
  {
    id: "mission-15",
    title: "Assigned: Gas Station Attendant Interaction",
    description:
      "Evaluate the friendliness and efficiency of the gas station attendant during refueling.",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    reward: 18,
    location: "34.0750,-118.2650",
    category: "Service",
    status: "assigned",
    assignedTo: ["user-shopper-2"],
    appliedBy: [],
    businessName: "FuelUp Stations",
  },
  {
    id: "mission-16",
    title: "Completed: Bookstore Staff Recommendation",
    description:
      "Ask for a book recommendation in a specific genre and evaluate the staff's knowledge and helpfulness.",
    deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    reward: 22,
    location: "34.0510,-118.2750",
    category: "Retail",
    status: "approved",
    assignedTo: ["user-shopper-3"],
    appliedBy: [],
    businessName: "The Reading Nook",
  },
  {
    id: "mission-17",
    title: "Assigned & Submitted: Car Wash Quality Check",
    description:
      "Get a standard car wash and evaluate the thoroughness and quality of the wash.",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    reward: 28,
    location: "34.0250,-118.2150",
    category: "Service",
    status: "submitted",
    assignedTo: ["user-shopper-4"],
    appliedBy: [],
    businessName: "Sparkle Car Wash",
  },
];

export const mockReports = [
  {
    id: "report-1",
    missionId: "mission-4", // Linked to the approved mission
    userId: "user-shopper-1",
    answers: {
      q_hotel_1_rating: { type: "rating", value: 4 },
      q_hotel_2_text: {
        type: "text",
        value:
          "Check-in was smooth, staff were polite. Lobby was clean but a bit dated.",
      },
      q_hotel_3_image_upload: {
        type: "image_upload",
        value: ["https://picsum.photos/seed/report1img/400/300"],
      },
    },
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Submitted 1 day ago
    status: "approved", // Report is approved
    refusalReason: null,
  },
  {
    id: "report-2",
    missionId: "mission-1", // Linked to mission-1
    userId: "user-shopper-1", // Submitted by user-shopper-1
    answers: {
      q_gourmet_1_rating: { type: "rating", value: 5 },
      q_gourmet_2_text: {
        type: "text",
        value: "Service was excellent, food was delicious.",
      },
      q_gourmet_3_image_upload: {
        type: "image_upload",
        value: ["https://picsum.photos/seed/report2img/400/300"],
      },
    },
    submittedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // Submitted 12 hours ago
    status: "approved", // Report is approved for this user for mission-1
    refusalReason: null,
  },
  {
    // Report 2 for mission-1 (user-shopper-2)
    id: "report-5",
    missionId: "mission-1",
    userId: "user-shopper-2",
    answers: {
      q_gourmet_1_rating: { type: "rating", value: 4 },
      q_gourmet_2_text: {
        type: "text",
        value: "Good experience overall. The waiter seemed a bit rushed.",
      },
      q_gourmet_3_image_upload: {
        type: "image_upload",
        value: ["https://picsum.photos/seed/report5img/400/300"],
      },
    },
    submittedAt: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000),
    status: "submitted",
    refusalReason: null,
  },
  {
    // Report 3 for mission-1 (user-shopper-3)
    id: "report-6",
    missionId: "mission-1",
    userId: "user-shopper-3",
    answers: {
      q_gourmet_1_rating: { type: "rating", value: 3 },
      q_gourmet_2_text: {
        type: "text",
        value: "Food was okay, service could be faster.",
      },
      q_gourmet_3_image_upload: { type: "image_upload", value: null }, // No image submitted
    },
    submittedAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000),
    status: "submitted",
    refusalReason: null,
  },
  {
    // Report 4 for mission-1 (user-shopper-4)
    id: "report-7",
    missionId: "mission-1",
    userId: "user-shopper-4",
    answers: {
      q_gourmet_1_rating: { type: "rating", value: 4 },
      q_gourmet_2_text: {
        type: "text",
        value: "Food was great, service was acceptable.",
      },
      q_gourmet_3_image_upload: {
        type: "image_upload",
        value: ["https://picsum.photos/seed/report7img/400/300"],
      },
    },
    submittedAt: new Date(Date.now() - 0.4 * 24 * 60 * 60 * 1000),
    status: "submitted",
    refusalReason: null,
  },
  {
    // Report 5 for mission-1 (user-shopper-5)
    id: "report-8",
    missionId: "mission-1",
    userId: "user-shopper-5",
    answers: {
      q_gourmet_1_rating: { type: "rating", value: 2 },
      q_gourmet_2_text: {
        type: "text",
        value: "Waited a long time for food, and it was cold.",
      },
      q_gourmet_3_image_upload: {
        type: "image_upload",
        value: ["https://picsum.photos/seed/report8img/400/300"],
      },
    },
    submittedAt: new Date(Date.now() - 0.25 * 24 * 60 * 60 * 1000),
    status: "submitted",
    refusalReason: null,
  },
  {
    // Report for mission-6 (pending)
    id: "report-4",
    missionId: "mission-6",
    userId: "user-shopper-1",
    answers: {
      q_grocery_1_rating: { type: "rating", value: 4 },
      q_grocery_2_rating: { type: "rating", value: 5 },
      q_grocery_3_checkboxes: {
        type: "checkboxes",
        value: { opt1: true, opt2: true, opt3: false, opt4: false },
      },
      q_grocery_4_gps: {
        type: "gps_capture",
        value: { lat: 34.045, lng: -118.255 },
      },
      q_grocery_6_image: {
        type: "image_upload",
        value: [
          "https://picsum.photos/seed/report4img1/400/300",
          "https://picsum.photos/seed/report4img2/400/300",
        ],
      },
      q_grocery_7_text: {
        type: "text",
        value:
          "Checkout line moved quickly. Cashier was very friendly and efficient.",
      },
    },
    submittedAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000), // Submitted very recently
    status: "submitted",
    refusalReason: null,
  },
  {
    // Report for mission-7 (refused)
    id: "report-9",
    missionId: "mission-7",
    userId: "user-shopper-7",
    answers: {
      q_library_1_text: { type: "text", value: "It was quiet." },
    },
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Submitted 4 days ago
    status: "refused",
    refusalReason:
      "Report was too brief and lacked sufficient detail about the ambiance.",
  },
  {
    // Report for mission-16 (Completed: Bookstore Staff Recommendation)
    id: "report-10",
    missionId: "mission-16",
    userId: "user-shopper-3",
    answers: {
      q_bookstore_1_rating: { type: "rating", value: 5 },
      q_bookstore_2_text: {
        type: "text",
        value:
          "Staff was very knowledgeable and gave an excellent recommendation.",
      },
    },
    submittedAt: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000),
    status: "approved",
    refusalReason: null,
  },
  {
    // Report for mission-17 (Assigned & Submitted: Car Wash Quality Check)
    id: "report-11",
    missionId: "mission-17",
    userId: "user-shopper-4",
    answers: {
      q_carwash_1_rating: { type: "rating", value: 3 },
      q_carwash_2_text: {
        type: "text",
        value:
          "The car wash was okay, but some spots were missed on the wheels.",
      },
      q_carwash_3_image: {
        type: "image_upload",
        value: ["https://picsum.photos/seed/report11img/400/300"],
      },
    },
    submittedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
    status: "submitted",
    refusalReason: null,
  },
];

// Mock user for context (replace with actual authentication data later)
export const mockUser = {
  id: "user-shopper-1",
  name: "Alex Shopper", // This might be the full name
  email: "alex@example.com", // Keep original email
  role: "shopper",
  profilePicUrl: "https://picsum.photos/seed/user-shopper-1/100/100",
  city: "Anytown",
  motivation:
    "Passionate about improving customer experiences and providing detailed feedback.",
  cvUrl: "/mock-cv/alex_shopper_cv.pdf",
  birthYear: 1992,
  gender: "female",
  password: "$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa", // Example hashed password
  registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Registered 30 days ago
  completedMissions: 1, // Updated based on approved reports
  status: "active",
  telephone: "+1-555-123-4567",
  unreadMessages: 0,
};

// Mock Survey Questions for specific missions
export const mockSurveyQuestions = {
  // Questions for mission-1: Gourmet Place (same as before)
  "mission-1": [
    {
      id: "q_gourmet_1_rating",
      type: "rating",
      text: "Rate the overall service quality.",
      isRequired: true,
      maxRating: 5,
      minLabel: "Poor",
      maxLabel: "Excellent",
    },
    {
      id: "q_gourmet_2_text",
      type: "text",
      text: "Comments on food and ambiance.",
      isRequired: true,
    },
    {
      id: "q_gourmet_3_image_upload",
      type: "image_upload",
      text: "Upload a photo of your main course.",
      isRequired: false,
      allowMultiple: false,
      maxImages: 1,
    },
  ],
  // Questions for mission-2: Retail Store Cleanliness Check
  "mission-2": [
    {
      id: "q_retail_1_rating",
      type: "rating",
      text: "Rate the overall cleanliness of the store.",
      isRequired: true,
      maxRating: 5,
      minLabel: "Dirty",
      maxLabel: "Spotless",
    },
    {
      id: "q_retail_2_mc",
      type: "multiple_choice",
      text: "How helpful were the staff members?",
      isRequired: true,
      options: [
        { id: "opt1", text: "Very Helpful" },
        { id: "opt2", text: "Somewhat Helpful" },
        { id: "opt3", text: "Not Helpful" },
        { id: "opt4", text: "Did not interact" },
      ],
    },
    {
      id: "q_retail_3_text",
      type: "text",
      text: "Provide any additional comments about your experience.",
      isRequired: false,
    },
    {
      id: "q_retail_4_img",
      type: "image_upload",
      text: "Upload a photo of the storefront.",
      isRequired: true,
      allowMultiple: false,
      maxImages: 1,
    },
  ],
  // Questions for mission-6: Grocery Store Checkout Efficiency
  "mission-6": [
    {
      id: "q_grocery_1_rating",
      type: "rating",
      text: "Rate the speed of the checkout process.",
      isRequired: true,
      maxRating: 5,
      minLabel: "Very Slow",
      maxLabel: "Very Fast",
    },
    {
      id: "q_grocery_2_rating",
      type: "rating",
      text: "Rate the friendliness of the cashier.",
      isRequired: true,
      maxRating: 5,
      minLabel: "Unfriendly",
      maxLabel: "Very Friendly",
    },
    {
      id: "q_grocery_3_checkboxes",
      type: "checkboxes",
      text: "Which payment methods were clearly available?",
      isRequired: false,
      options: [
        { id: "opt1", text: "Cash" },
        { id: "opt2", text: "Credit/Debit Card" },
        { id: "opt3", text: "Mobile Pay (Apple/Google Pay)" },
        { id: "opt4", text: "Store App" },
      ],
    },
    {
      id: "q_grocery_4_gps",
      type: "gps_capture",
      text: "Capture your location upon leaving the store.",
      isRequired: true,
    },
    {
      id: "q_grocery_5_audio",
      type: "audio_recording",
      text: "Record a brief audio comment about the checkout noise level (optional).",
      isRequired: false,
      maxDurationSeconds: 30,
    },
    {
      id: "q_grocery_6_image",
      type: "image_upload",
      text: "Upload photos of your receipt and purchased items (up to 3 images).",
      isRequired: true,
      allowMultiple: true,
      maxImages: 3,
    },
    {
      id: "q_grocery_7_text",
      type: "text",
      text: "Any suggestions for improvement?",
      isRequired: false,
    },
  ],
  // Add questions for mission-4 if needed for viewing completed reports
  "mission-4": [
    {
      id: "q_hotel_1_rating",
      type: "rating",
      text: "Rate the check-in efficiency.",
      isRequired: true,
      maxRating: 5,
    },
    {
      id: "q_hotel_2_text",
      type: "text",
      text: "Comments on staff friendliness and lobby atmosphere.",
      isRequired: true,
    },
    {
      id: "q_hotel_3_image_upload",
      type: "image_upload",
      text: "Upload a photo of the lobby.",
      isRequired: false,
      allowMultiple: false,
      maxImages: 1,
    },
  ],
  "mission-17": [
    // Survey for Car Wash
    {
      id: "q_carwash_1_rating",
      type: "rating",
      text: "Rate the quality of the car wash.",
      isRequired: true,
      maxRating: 5,
      minLabel: "Poor",
      maxLabel: "Excellent",
    },
    {
      id: "q_carwash_2_text",
      type: "text",
      text: "Any specific areas missed or comments on the service?",
      isRequired: true,
    },
    {
      id: "q_carwash_3_image",
      type: "image_upload",
      text: "Upload a photo of the washed car (optional).",
      isRequired: false,
      allowMultiple: true,
      maxImages: 2,
    },
  ],
  // No specific questions needed for mission-3, mission-5, or mission-7, mission-15, mission-16 for now
};

// Added mockUsers as a separate export
export const mockUsers = [
  mockUser, // Alex Shopper
  {
    id: "user-admin-1",
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
    password: "$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa", // Same example hash
    registrationDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
    completedMissions: 0,
    unreadMessages: 0,
  },
  {
    id: "user-shopper-2",
    name: "Beth Shopper",
    email: "beth@example.com",
    role: "shopper",
    profilePicUrl: "https://picsum.photos/seed/user-shopper-2/100/100",
    status: "active",
    city: "Otherville",
    telephone: "+1-555-0002",
    motivation: "Looking for new opportunities.",
    cvUrl: null,
    birthYear: 1985,
    gender: "male",
    password: "$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa",
    registrationDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
    completedMissions: 5,
    unreadMessages: 2,
  },
  {
    id: "user-shopper-3",
    name: "Charles Shopper",
    email: "charles@example.com",
    role: "shopper",
    profilePicUrl: "https://picsum.photos/seed/user-shopper-3/100/100",
    status: "inactive", // Inactive user
    city: "Metroburg",
    telephone: "+1-555-0003",
    motivation: "Interested in service evaluations.",
    cvUrl: "/mock-cv/charles_shopper_cv.pdf",
    birthYear: 1990,
    gender: "male",
    password: "$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa",
    registrationDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    completedMissions: 12,
    unreadMessages: 0,
  },
  {
    id: "user-shopper-4",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "shopper",
    profilePicUrl: "https://picsum.photos/seed/user-shopper-4/100/100",
    status: "active",
    city: "Themyscira",
    telephone: "+1-555-0004",
    motivation: "Seeking truth and justice in customer service.",
    cvUrl: null,
    birthYear: 1980, // Example
    gender: "female",
    password: "$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa",
    registrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    completedMissions: 3,
    unreadMessages: 1,
  },
  {
    id: "user-shopper-5",
    name: "Edward Nygma",
    email: "edward@example.com",
    role: "shopper",
    profilePicUrl: "https://picsum.photos/seed/user-shopper-5/100/100",
    status: "active",
    city: "Gotham",
    telephone: "+1-555-0005",
    motivation: "I have a penchant for puzzles and detailed observations.",
    cvUrl: "/mock-cv/edward_nygma_cv.pdf",
    birthYear: 1978,
    gender: "male",
    password: "$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa",
    registrationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    completedMissions: 8,
    unreadMessages: 0,
  },
  {
    id: "user-shopper-6",
    name: "Fiona Glenanne",
    email: "fiona@example.com",
    role: "shopper",
    profilePicUrl: "https://picsum.photos/seed/user-shopper-6/100/100",
    status: "active",
    city: "Miami",
    telephone: "+1-555-0006",
    motivation: "Good with details and not afraid to speak my mind.",
    cvUrl: null,
    birthYear: 1988,
    gender: "female",
    password: "$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa",
    registrationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    completedMissions: 2,
    unreadMessages: 0,
  },
  {
    id: "user-shopper-7",
    name: "George Costanza",
    email: "george@example.com",
    role: "shopper",
    profilePicUrl: "https://picsum.photos/seed/user-shopper-7/100/100",
    status: "active", // Was refused a mission, but account is active
    city: "New York",
    telephone: "+1-555-0007",
    motivation: "Always looking for an angle, and I notice things.",
    cvUrl: null,
    birthYear: 1970,
    gender: "male",
    password: "$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa",
    registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    completedMissions: 0,
    unreadMessages: 0,
  },
];

// Placeholder for applications
export const mockApplications = [
  {
    id: "app-1",
    mission_id: "mission-2",
    user_id: "user-shopper-2",
    user_name: "Beth Shopper",
    mission_title: "Retail Store Cleanliness Check",
    status: "pending",
    applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "app-2",
    mission_id: "mission-3",
    user_id: "user-shopper-3",
    user_name: "Charles Shopper",
    mission_title: "Coffee Shop Speed of Service",
    status: "pending",
    applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "app-3",
    mission_id: "mission-5",
    user_id: "user-shopper-1",
    user_name: "Alex Shopper",
    mission_title: "Fast Food Drive-Thru Accuracy",
    status: "approved",
    applied_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
  }, // Example of an approved one
  {
    id: "app-4",
    mission_id: "mission-8",
    user_id: "user-shopper-4",
    user_name: "Diana Prince",
    mission_title: "Electronics Store Demo Station",
    status: "pending",
    applied_at: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "app-5",
    mission_id: "mission-11",
    user_id: "user-shopper-5",
    user_name: "Edward Nygma",
    mission_title: "Online Shopping Checkout Process",
    status: "refused",
    refusal_reason:
      "Applicant does not meet experience criteria for online evaluations.",
    applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "app-6",
    mission_id: "mission-12",
    user_id: "user-shopper-6",
    user_name: "Fiona Glenanne",
    mission_title: "Public Park Maintenance Check",
    status: "pending",
    applied_at: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000),
  },
];

// Placeholder for assignments
export const mockAssignments = [
  {
    id: "asg-1",
    mission_id: "mission-1",
    user_id: "user-shopper-1",
    assigned_at: new Date(),
  },
  {
    id: "asg-2",
    mission_id: "mission-1",
    user_id: "user-shopper-2",
    assigned_at: new Date(),
  },
  {
    id: "asg-3",
    mission_id: "mission-1",
    user_id: "user-shopper-3",
    assigned_at: new Date(),
  },
  {
    id: "asg-4",
    mission_id: "mission-1",
    user_id: "user-shopper-4",
    assigned_at: new Date(),
  },
  {
    id: "asg-5",
    mission_id: "mission-1",
    user_id: "user-shopper-5",
    assigned_at: new Date(),
  },
  {
    id: "asg-6",
    mission_id: "mission-4",
    user_id: "user-shopper-1",
    assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  }, // Older assignment for completed
  {
    id: "asg-7",
    mission_id: "mission-5",
    user_id: "user-shopper-1",
    assigned_at: new Date(Date.now() - 0.4 * 24 * 60 * 60 * 1000),
  }, // Approved application
  {
    id: "asg-8",
    mission_id: "mission-6",
    user_id: "user-shopper-1",
    assigned_at: new Date(),
  },
  {
    id: "asg-9",
    mission_id: "mission-7",
    user_id: "user-shopper-7",
    assigned_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  }, // Older assignment for refused
  {
    id: "asg-10",
    mission_id: "mission-15",
    user_id: "user-shopper-2",
    assigned_at: new Date(),
  },
  {
    id: "asg-11",
    mission_id: "mission-16",
    user_id: "user-shopper-3",
    assigned_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: "asg-12",
    mission_id: "mission-17",
    user_id: "user-shopper-4",
    assigned_at: new Date(),
  },
];
