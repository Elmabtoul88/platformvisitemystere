// IMPORTANT: This file maintains the mock data for the application.
// Synchronized with SQL schema and turn-based process requirements.

export let mockMissions = [
  {
    id: 'mission-1',
    title: 'Dinner Service Evaluation at Gourmet Place',
    description: 'Evaluate the dinner service quality, food presentation, and overall ambiance.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    reward: 200,
    location: 'Casablanca, Maroc',
    country: 'Maroc',
    city: 'Casablanca',
    category: 'Restaurant',
    businessName: 'Gourmet Place Inc.',
    clientId: 'client-1',
    soughtProfile: 'Femme de 30 à 60 ans',
    status: 'available',
    profileQuiz: [
      { 
        id: 'p1', 
        type: 'multiple_choice', 
        text: 'Quel est votre type de peau ?', 
        isRequired: true, 
        options: [{ id: 1, text: 'Normale' }, { id: 2, text: 'Grasse' }, { id: 3, text: 'Mixte' }] 
      },
      { 
        id: 'p2', 
        type: 'checkboxes', 
        text: 'Quels produits utilisez-vous habituellement ?', 
        isRequired: true, 
        options: [{ id: 4, text: 'Lait' }, { id: 5, text: 'Lotion' }, { id: 6, text: 'Gommage' }] 
      },
      { 
        id: 'p3', 
        type: 'text', 
        text: 'À quelle fréquence visitez-vous des enseignes de beauté ?', 
        isRequired: true 
      }
    ],
    briefingUrl: '/files/briefing_mission_1.pdf',
    scenarioUrl: '/files/scenario_mission_1.pdf',
    questionnairePdfUrl: '/files/questionnaire_mission_1.pdf',
    assignedTo: [],
    appliedBy: [],
  },
  {
    id: 'mission-2',
    title: 'Retail Store Cleanliness Check',
    description: 'Visit the downtown branch and assess store cleanliness, staff helpfulness, and product availability. Purchase a small item.',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    reward: 35,
    location: 'Anytown, USA',
    country: 'USA',
    city: 'Anytown',
    category: 'Retail',
    businessName: 'Fashion Forward Ltd.',
    clientId: 'client-2',
    soughtProfile: 'Tout profil',
    status: 'available',
    profileQuiz: [],
    briefingUrl: '#',
    scenarioUrl: '#',
    questionnairePdfUrl: '#',
  },
  {
    id: 'mission-5',
    title: 'Beauté et Bien-être - Test de Luminosité',
    description: 'La visite consiste à vous rendre dans un magasin de beauté et demander conseil sur un produits pour les peaux ternes.',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    reward: 20,
    location: 'Paris, France',
    country: 'France',
    city: 'Paris',
    category: 'Beauté',
    businessName: 'Beauty Co.',
    clientId: 'client-1',
    soughtProfile: 'Femme de 25 à 45 ans',
    status: 'assigned',
    assignedTo: ['user-shopper-1'],
    docsConsulted: { briefing: true, scenario: true, questionnaire: true },
    knowledgeQuizPassed: true,
    briefingUrl: '/files/briefing_mission_5.pdf',
    scenarioUrl: '/files/scenario_mission_5.pdf',
    questionnairePdfUrl: '/files/questionnaire_mission_5.pdf',
    profileQuiz: [
      { id: 'p5-1', type: 'text', text: 'Ville de résidence', isRequired: true }
    ]
  },
  {
    id: 'mission-anytown',
    title: 'Local Store Audit - Anytown',
    description: 'Evaluate the local store performance and inventory availability.',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    reward: 50,
    location: 'Anytown, USA',
    country: 'USA',
    city: 'Anytown',
    category: 'Retail',
    businessName: 'Anytown Mart',
    clientId: 'client-2',
    soughtProfile: 'Any active shopper',
    status: 'assigned',
    assignedTo: ['user-shopper-1'],
    docsConsulted: { briefing: false, scenario: false, questionnaire: false },
    knowledgeQuizPassed: false,
    briefingUrl: '#',
    scenarioUrl: '#',
    questionnairePdfUrl: '#',
    profileQuiz: []
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
  completedMissions: 2,
  // Detailed initial banking info
  bankingInfo: {
    accountHolder: 'Alex Shopper',
    rib: 'FR76 3000 6000 0112 3456 7890 123',
    bankName: 'BNP Paribas',
    swift: 'BNPAFRPP',
    country: 'France',
    currency: 'EUR'
  }
};

export let mockApplications = [
    {
        id: 'app-1',
        mission_id: 'mission-1',
        user_id: 'user-shopper-1',
        status: 'pending',
        applied_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        selectedStoreIds: ['store-1'],
        quizAnswers: { p1: 'Grasse', p2: ['Lait'], p3: '2 fois par mois' }
    }
];

export let mockReports = [
    {
        id: 'report-past-1',
        missionId: 'mission-5',
        userId: 'user-shopper-1',
        status: 'approved',
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentStatus: 'paid',
        paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        reward: 20,
        transactionRef: 'TRX-998877',
        answers: { q1_rating: { type: 'rating', value: 5 }, q2_text: { type: 'text', value: 'Excellent service' } }
    },
    {
        id: 'report-past-2',
        missionId: 'mission-anytown',
        userId: 'user-shopper-1',
        status: 'approved',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        paymentStatus: 'pending',
        reward: 50,
        answers: { q1_text: { type: 'text', value: 'Audit complete' } }
    }
];

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
  { id: 'store-any-1', mission_id: 'mission-anytown', name: 'Downtown Market Anytown', city: 'Anytown', address: '123 Main St', latitude: 34.0522, longitude: -118.2437, active: true, category: 'Retail' },
  { id: 'store-any-2', mission_id: 'mission-anytown', name: 'Westside Shop Anytown', city: 'Anytown', address: '789 West Blvd', latitude: 34.0422, longitude: -118.2537, active: true, category: 'Retail' },
  { id: 'store-any-3', mission_id: 'mission-anytown', name: 'Eastside Mart Anytown', city: 'Anytown', address: '456 East Ave', latitude: 34.0622, longitude: -118.2337, active: true, category: 'Retail' },
];

export let mockAssignments = [
  {
    id: 'asg-1',
    mission_id: 'mission-5',
    user_id: 'user-shopper-1',
    store_id: 'store-2',
    assigned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    plannedDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timeWindowMinutes: 60,
    status: 'assigned'
  },
  {
    id: 'asg-2',
    mission_id: 'mission-anytown',
    user_id: 'user-shopper-1',
    store_id: 'store-any-1',
    assigned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    plannedDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    timeWindowMinutes: 60,
    status: 'assigned'
  }
];
