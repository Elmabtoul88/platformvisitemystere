
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
    status: 'available',
    profileQuiz: [
      { id: 'p1', question: 'Ma peau est:', options: ['Normale', 'Grasse', 'Mixte'] },
      { id: 'p2', question: 'Pour me démaquiller j’utilise:', options: ['Un lait', 'Une lotion', 'Un démaquillant'] }
    ],
    knowledgeQuiz: [
      { id: 'k1', question: 'La visite porte sur le conseil pour les peaux mixtes?', type: 'boolean', answer: true },
      { id: 'k2', question: 'Le passage en caisse est obligatoire?', type: 'boolean', answer: true }
    ],
    briefingUrl: '/files/briefing_mission_1.pdf',
    scenarioUrl: '/files/scenario_mission_1.pdf',
    questionnairePdfUrl: '/files/questionnaire_mission_1.pdf',
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
    status: 'assigned',
    assignedTo: ['user-shopper-1'],
    docsConsulted: { briefing: false, scenario: false, questionnaire: false },
    knowledgeQuizPassed: false,
    plannedDate: new Date(Date.now() + 1000 * 60 * 15), // Scheduled for 15 mins from now
    briefingUrl: '/files/briefing_mission_5.pdf',
    scenarioUrl: '/files/scenario_mission_5.pdf',
    questionnairePdfUrl: '/files/questionnaire_mission_5.pdf',
  },
  {
    id: 'mission-anytown',
    title: 'Local Store Audit - Anytown',
    description: 'Evaluate the local store performance and inventory availability.',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    reward: 50,
    location: 'Anytown, Downtown',
    country: 'USA',
    city: 'Anytown',
    category: 'Retail',
    businessName: 'Anytown Mart',
    clientId: 'client-2',
    soughtProfile: 'Any active shopper',
    status: 'assigned',
    assignedTo: ['user-shopper-1'],
    docsConsulted: { briefing: true, scenario: true, questionnaire: true },
    knowledgeQuizPassed: true,
    plannedDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // Scheduled in 2 hours
    briefingUrl: '#',
    scenarioUrl: '#',
    questionnairePdfUrl: '#',
  }
];

export const mockUser = {
  id: 'user-shopper-1',
  name: 'Alex Shopper',
  email: 'alex@example.com',
  role: 'shopper',
  profilePicUrl: `https://picsum.photos/seed/user-shopper-1/100/100`,
  city: 'Anytown',
  country: 'USA',
  status: 'active',
  completedMissions: 1,
};

export let mockApplications = [
    {
        id: 'app-1',
        mission_id: 'mission-1',
        user_id: 'user-shopper-1',
        status: 'pending',
        applied_at: new Date().toISOString(),
        selectedStoreId: 'store-1',
        quizAnswers: { p1: 'Grasse', p2: 'Une lotion' }
    }
];

export let mockReports = [];

export let mockSurveyQuestions = {
  'mission-1': [
       { id: 'q1', type: 'rating', text: 'Qualité du conseil reçu.', isRequired: true },
       { id: 'q2', type: 'text', text: 'Commentaires généraux.', isRequired: true },
   ],
   'mission-5': [
       { id: 'q1', type: 'rating', text: 'Accueil du conseiller.', isRequired: true },
       { id: 'q2', type: 'image_upload', text: 'Photo du ticket de caisse.', isRequired: true, maxImages: 1 },
   ],
   'mission-anytown': [
       { id: 'q1', type: 'text', text: 'Audit observations.', isRequired: true }
   ]
};

export let mockStores = [
  { id: 'store-1', mission_id: 'mission-1', name: 'Gourmet Maarif', city: 'Casablanca', address: 'Rue Maarif', latitude: 33.5892, longitude: -7.6018, active: true, category: 'Restaurant' },
  { id: 'store-2', mission_id: 'mission-5', name: 'Beauty Paris Etoile', city: 'Paris', address: 'Place de l\'Etoile', latitude: 48.8738, longitude: 2.2950, active: true, category: 'Beauté' },
  { id: 'store-3', mission_id: 'mission-anytown', name: 'Downtown Mart', city: 'Anytown', address: '123 Main St', latitude: 34.0522, longitude: -118.2437, active: true, category: 'Retail' },
  { id: 'store-4', mission_id: 'mission-anytown', name: 'Eastside Mart', city: 'Anytown', address: '456 East Ave', latitude: 34.0622, longitude: -118.2337, active: true, category: 'Retail' },
  { id: 'store-5', mission_id: 'mission-anytown', name: 'Westside Mart', city: 'Anytown', address: '789 West Blvd', latitude: 34.0422, longitude: -118.2537, active: true, category: 'Retail' },
];

export let mockAssignments = [];
