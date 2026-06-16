
// IMPORTANT: This file maintains the mock data for the application.
// Following the 11-step process defined in the requirements.

export let mockMissions = [
  {
    id: 'mission-1',
    title: 'Dinner Service Evaluation at Gourmet Place',
    description: 'Evaluate the dinner service quality, food presentation, and overall ambiance.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    reward: 200,
    location: 'Casablanca, Maarif',
    country: 'Maroc',
    city: 'Casablanca',
    storeNeighborhood: 'Maarif',
    category: 'Restaurant',
    businessName: 'Gourmet Place Inc.',
    clientId: 'client-1',
    soughtProfile: 'Femme de 30 à 60 ans',
    status: 'available', // MISSION DISPONIBLE
    // Step 1: Quizzes and PDFs
    profileQuiz: [
      { id: 'p1', question: 'Ma peau est:', options: ['Normale', 'Grasse', 'Mixte'] },
      { id: 'p2', question: 'Pour me démaquiller j’utilise:', options: ['Un lait', 'Une lotion', 'Un démaquillant'] }
    ],
    knowledgeQuiz: [
      { id: 'k1', question: 'La visite porte sur le conseil pour les peaux mixtes?', type: 'boolean', answer: true },
      { id: 'k2', question: 'Le passage en caisse est obligatoire?', type: 'boolean', answer: true }
    ],
    briefingUrl: '#placeholder-briefing',
    scenarioUrl: '#placeholder-scenario',
    assignedTo: [],
    appliedBy: [],
  },
  {
    id: 'mission-5',
    title: 'Beauté et Bien-être - Test de Luminosité',
    description: 'La visite consiste à vous rendre dans un magasin de beauté et demander conseil sur un produits pour les peaux ternes.',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    reward: 20,
    location: 'Paris, Etoile',
    country: 'France',
    city: 'Paris',
    storeNeighborhood: 'Etoile',
    category: 'Beauté',
    businessName: 'Beauty Co.',
    clientId: 'client-1',
    soughtProfile: 'Femme de 25 à 45 ans',
    status: 'assigned', // MISSION ATTRIBUÉE
    assignedTo: ['user-shopper-1'],
    // Tracking Step 5 & 6
    docsConsulted: { briefing: false, scenario: false, questionnaire: false },
    knowledgeQuizPassed: false,
    currentStep: 5, 
  }
];

export const mockUser = {
  id: 'user-shopper-1',
  name: 'Alex Shopper',
  email: 'alex@example.com',
  role: 'shopper',
  profilePicUrl: `https://picsum.photos/seed/user-shopper-1/100/100`,
  city: 'Paris',
  country: 'France',
  status: 'active', // Validated by admin
  completedMissions: 1,
};

export let mockApplications = [];

export let mockReports = [];

export let mockSurveyQuestions = {
  'mission-1': [
       { id: 'q1', type: 'rating', text: 'Qualité du conseil reçu.', isRequired: true },
       { id: 'q2', type: 'text', text: 'Commentaires généraux.', isRequired: true },
   ],
   'mission-5': [
       { id: 'q1', type: 'rating', text: 'Accueil du conseiller.', isRequired: true },
       { id: 'q2', type: 'image_upload', text: 'Photo du ticket de caisse.', isRequired: true, maxImages: 1 },
   ]
};

export let mockStores = [
  { id: 'store-1', mission_id: 'mission-1', name: 'Gourmet Maarif', city: 'Casablanca', address: 'Rue Maarif', latitude: 33.5892, longitude: -7.6018, active: true },
  { id: 'store-2', mission_id: 'mission-5', name: 'Beauty Paris Etoile', city: 'Paris', address: 'Place de l\'Etoile', latitude: 48.8738, longitude: 2.2950, active: true },
];

export let mockAssignments = [];
