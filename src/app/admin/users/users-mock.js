// Shared mock user data to ensure consistency across admin pages during simulation
import { mockUser as mockSingleUser } from '@/lib/mock-data';

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
            role: 'shopper',
            profilePicUrl: `https://picsum.photos/seed/${userId}/40/40`,
            status: i % 4 === 0 ? 'inactive' : 'active', // Adjusted status distribution
            city: i % 3 === 0 ? 'Otherville' : 'Anytown',
            telephone: `+1-555-00${String(i).padStart(2, '0')}`, // Example phone
            motivation: `Interested shopper #${i}.`,
            cvUrl: i % 5 === 0 ? `/mock-cv/cv_${userId}.pdf` : null, // Example CV url
            birthYear: 1980 + (i % 20), // Example birth year
            gender: i % 3 === 0 ? 'male' : (i % 3 === 1 ? 'female' : 'prefer_not_say'), // Example gender
            registrationDate: new Date(Date.now() - (i * 5 + 1) * 24 * 60 * 60 * 1000), // Simulate varied registration dates
            completedMissions: Math.floor(Math.random() * 25), // Random mission count
        });
        usedIds.add(userId);
    }

    // Add the original mock user (Alex Shopper) if ID is unique
    const alexUserId = mockSingleUser.id;
    if (!usedIds.has(alexUserId)) {
        users.push({
            ...mockSingleUser,
            id: alexUserId,
            email: 'alex@example.com', // Ensure email is set
            status: 'active',
            telephone: '+1-555-123-4567', // Example phone for Alex
            registrationDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            completedMissions: 7,
        });
        usedIds.add(alexUserId);
    } else {
        // Handle potential ID conflict if 'user-shopper-1' was generated above
        // Option: Modify the generated user-shopper-1 instead of adding Alex separately,
        // or ensure Alex's ID is truly unique if needed. For now, we assume Alex is added if ID is free.
        console.warn(`Mock user ID conflict for ${alexUserId}. Alex might not be included.`);
    }


    // Add a mock admin user
    const adminUserId = 'admin-1';
    if (!usedIds.has(adminUserId)) {
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
            completedMissions: 0
        });
        usedIds.add(adminUserId);
    }
    return users;
};

// Export the generated list
// This list will be mutated by edit/toggle actions for simulation purposes
export let mockUsers = generateMockUsers(15);
