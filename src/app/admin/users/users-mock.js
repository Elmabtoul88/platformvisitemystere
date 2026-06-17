// Shared mock user data to ensure consistency across admin pages during simulation
import { mockUser as mockSingleUser } from '@/lib/mock-data';

// Generate more mock users for the list
const generateMockUsers = (count) => {
    const users = [];
    const usedIds = new Set();

    // 1. ADD SPECIFIC TEST USERS FIRST (to avoid being skipped by the loop)
    
    // Add Alex Shopper (The primary test account)
    const alexUserId = mockSingleUser.id; // 'user-shopper-1'
    users.push({
        ...mockSingleUser,
        id: alexUserId,
        name: 'Alex Shopper',
        email: 'alex@example.com',
        status: 'active',
        telephone: '+1-555-123-4567',
        registrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        completedMissions: 7,
        unreadMessages: 2,
    });
    usedIds.add(alexUserId);

    // Add Admin User
    const adminUserId = 'admin-1';
    users.push({
        id: adminUserId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        profilePicUrl: null,
        status: 'active',
        city: 'HQ',
        telephone: '+1-800-ADMIN-0',
        motivation: 'System Administrator.',
        cvUrl: null,
        birthYear: null,
        gender: 'prefer_not_say',
        registrationDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
        completedMissions: 0,
        unreadMessages: 0,
        password: '$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa',
    });
    usedIds.add(adminUserId);

    // Add Clients
    const clients = [
        { id: 'client-1', name: 'Gourmet Place Client', email: 'client@gourmet.com' },
        { id: 'client-2', name: 'Fashion Forward Client', email: 'client@fashion.com' },
        { id: 'client-3', name: 'General Services Client', email: 'client@services.com' }
    ];

    clients.forEach(c => {
        users.push({
            id: c.id,
            name: c.name,
            email: c.email,
            role: 'client',
            password: '$2b$10$clientPasswordHash',
            status: 'active',
            registrationDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
            unreadMessages: 0,
            profilePicUrl: `https://picsum.photos/seed/${c.id}/40/40`,
        });
        usedIds.add(c.id);
    });

    // 2. GENERATE RANDOM SHOPPERS
    for (let i = 1; i <= count; i++) {
        const userId = `user-shopper-random-${i}`;
        if (usedIds.has(userId)) continue;
        
        const shopperName = `Shopper ${i}`;
        
        users.push({
            id: userId,
            name: shopperName,
            email: `shopper${i}@example.com`,
            role: 'shopper',
            profilePicUrl: `https://picsum.photos/seed/${userId}/40/40`,
            status: i % 3 !== 0 ? 'active' : 'inactive',
            city: ['Casablanca', 'Paris', 'Lyon', 'Marrakech'][i % 4],
            telephone: `+1-555-00${String(i).padStart(2, '0')}`,
            motivation: `Intéressé par les missions de luxe #${i}.`,
            cvUrl: i % 6 === 0 ? `/mock-cv/cv_${userId}.pdf` : null,
            birthYear: 1980 + (i % 25),
            gender: ['female', 'male', 'other', 'prefer_not_say'][i % 4],
            registrationDate: new Date(Date.now() - Math.floor(Math.random() * 365 + 1) * 24 * 60 * 60 * 1000),
            completedMissions: Math.floor(Math.random() * 15),
            unreadMessages: i % 8 === 0 ? 1 : 0,
            password: `$2b$10$shopperPasswordHash${i}`,
            bankingInfo: {
                accountHolder: shopperName,
                rib: `FR76 1234 5678 9012 3456 7890 ${String(i).padStart(3, '0')}`,
                bankName: ['Attijariwafa Bank', 'CIH Bank', 'BMCE', 'Société Générale'][i % 4],
                swift: 'BANKMAXX',
                country: 'Maroc',
                currency: 'MAD'
            }
        });
        usedIds.add(userId);
    }

    return users;
};

// Export the generated list
export let mockUsers = generateMockUsers(25);

// Function to clear unread messages for a user (for simulation)
export function clearUserUnreadMessages(userId) {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        mockUsers[userIndex].unreadMessages = 0;
        console.log(`Cleared unread messages for user ${userId} in mock data.`);
        return true;
    }
    return false;
}
