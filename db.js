// Mock database for RusCord
class RusCordDB {
    constructor() {
        this.initDatabase();
    }
    
    initDatabase() {
        // Check if database exists in localStorage
        if (!localStorage.getItem('ruscord_db')) {
            // Initialize with demo data
            const initialDB = {
                users: [
                    {
                        id: 1,
                        username: 'DemoUser',
                        email: 'demo@ruscord.com',
                        password: 'demo123',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
                        status: 'online',
                        bio: 'Demo user for RusCord',
                        createdAt: new Date().toISOString()
                    }
                ],
                servers: [
                    {
                        id: 1,
                        name: 'RusCord Official',
                        ownerId: 1,
                        icon: 'RC',
                        channels: [
                            { id: 1, name: 'general', type: 'text' },
                            { id: 2, name: 'introductions', type: 'text' },
                            { id: 3, name: 'help', type: 'text' },
                            { id: 4, name: 'general', type: 'voice' }
                        ],
                        members: [1],
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: 'Gaming Hub',
                        ownerId: 1,
                        icon: 'GH',
                        channels: [
                            { id: 5, name: 'lobby', type: 'text' },
                            { id: 6, name: 'valorant', type: 'text' },
                            { id: 7, name: 'minecraft', type: 'text' },
                            { id: 8, name: 'voice-chat', type: 'voice' }
                        ],
                        members: [1],
                        createdAt: new Date().toISOString()
                    }
                ],
                directMessages: [
                    {
                        id: 1,
                        participants: [1, 2],
                        messages: [
                            {
                                id: 1,
                                senderId: 2,
                                content: 'Hey there! Welcome to RusCord!',
                                timestamp: new Date(Date.now() - 3600000).toISOString()
                            },
                            {
                                id: 2,
                                senderId: 1,
                                content: 'Thanks! This looks awesome!',
                                timestamp: new Date(Date.now() - 3500000).toISOString()
                            }
                        ]
                    }
                ],
                friends: [],
                currentUser: null,
                messages: {
                    1: [ // Server 1, channel 1 (general)
                        {
                            id: 1,
                            senderId: 1,
                            content: 'Hello everyone! Welcome to RusCord!',
                            timestamp: new Date(Date.now() - 86400000).toISOString()
                        },
                        {
                            id: 2,
                            senderId: 1,
                            content: 'This is a demo of a Discord/Messenger clone.',
                            timestamp: new Date(Date.now() - 86300000).toISOString()
                        },
                        {
                            id: 3,
                            senderId: 1,
                            content: 'You can create servers, send messages, and more!',
                            timestamp: new Date(Date.now() - 86200000).toISOString()
                        }
                    ]
                }
            };
            
            this.saveDB(initialDB);
        }
    }
    
    getDB() {
        const db = localStorage.getItem('ruscord_db');
        return db ? JSON.parse(db) : null;
    }
    
    saveDB(db) {
        localStorage.setItem('ruscord_db', JSON.stringify(db));
    }
    
    // User methods
    createUser(userData) {
        const db = this.getDB();
        const newUser = {
            id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
            ...userData,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
            status: 'online',
            bio: '',
            createdAt: new Date().toISOString()
        };
        
        db.users.push(newUser);
        this.saveDB(db);
        return newUser;
    }
    
    findUserByEmail(email) {
        const db = this.getDB();
        return db.users.find(user => user.email === email);
    }
    
    findUserByUsername(username) {
        const db = this.getDB();
        return db.users.find(user => user.username === username);
    }
    
    // Server methods
    createServer(serverData) {
        const db = this.getDB();
        const newServer = {
            id: db.servers.length > 0 ? Math.max(...db.servers.map(s => s.id)) + 1 : 1,
            ...serverData,
            channels: [
                { id: 1, name: 'general', type: 'text' },
                { id: 2, name: 'voice-chat', type: 'voice' }
            ],
            members: [serverData.ownerId],
            createdAt: new Date().toISOString()
        };
        
        db.servers.push(newServer);
        
        // Initialize empty messages array for the new server's general channel
        const channelKey = `${newServer.id}_1`;
        db.messages[channelKey] = [];
        
        this.saveDB(db);
        return newServer;
    }
    
    getServersForUser(userId) {
        const db = this.getDB();
        return db.servers.filter(server => server.members.includes(userId));
    }
    
    // Message methods
    addMessage(serverId, channelId, messageData) {
        const db = this.getDB();
        const channelKey = `${serverId}_${channelId}`;
        
        if (!db.messages[channelKey]) {
            db.messages[channelKey] = [];
        }
        
        const newMessage = {
            id: db.messages[channelKey].length > 0 ? 
                Math.max(...db.messages[channelKey].map(m => m.id)) + 1 : 1,
            ...messageData,
            timestamp: new Date().toISOString()
        };
        
        db.messages[channelKey].push(newMessage);
        this.saveDB(db);
        return newMessage;
    }
    
    getMessages(serverId, channelId) {
        const db = this.getDB();
        const channelKey = `${serverId}_${channelId}`;
        return db.messages[channelKey] || [];
    }
    
    // Set and get current user
    setCurrentUser(user) {
        const db = this.getDB();
        db.currentUser = user;
        this.saveDB(db);
    }
    
    getCurrentUser() {
        const db = this.getDB();
        return db.currentUser;
    }
    
    clearCurrentUser() {
        const db = this.getDB();
        db.currentUser = null;
        this.saveDB(db);
    }
    
    // Friend methods
    addFriend(userId, friendId) {
        const db = this.getDB();
        
        // Check if friendship already exists
        const existingFriendship = db.friends.find(f => 
            (f.userId === userId && f.friendId === friendId) ||
            (f.userId === friendId && f.friendId === userId)
        );
        
        if (!existingFriendship) {
            db.friends.push({
                id: db.friends.length > 0 ? Math.max(...db.friends.map(f => f.id)) + 1 : 1,
                userId,
                friendId,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            this.saveDB(db);
            return true;
        }
        
        return false;
    }
    
    getFriends(userId) {
        const db = this.getDB();
        const userFriends = db.friends.filter(f => 
            f.userId === userId || f.friendId === userId
        );
        
        return userFriends.map(friendship => {
            const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
            const friend = db.users.find(u => u.id === friendId);
            return {
                ...friendship,
                friend: friend
            };
        });
    }
    
    // Update user status
    updateUserStatus(userId, status) {
        const db = this.getDB();
        const user = db.users.find(u => u.id === userId);
        if (user) {
            user.status = status;
            this.saveDB(db);
        }
    }
}

// Create a global instance
const rusCordDB = new RusCordDB();
