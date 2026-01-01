// Main application logic for RusCord
class RusCordApp {
    constructor() {
        this.db = rusCordDB;
        this.currentUser = this.db.getCurrentUser();
        this.currentServer = null;
        this.currentChannel = null;
        
        this.init();
    }
    
    init() {
        // Check if user is logged in
        if (!this.currentUser && window.location.pathname.includes('main.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // Initialize based on page
        if (window.location.pathname.includes('main.html')) {
            this.initMainApp();
        }
    }
    
    initMainApp() {
        // Set user info in UI
        this.setUserInfo();
        
        // Load servers
        this.loadServers();
        
        // Load direct messages
        this.loadDirectMessages();
        
        // Load members
        this.loadMembers();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set default server/channel
        this.selectServer('home');
        
        // Show welcome message
        this.showWelcomeMessage();
    }
    
    setUserInfo() {
        document.getElementById('current-username').textContent = this.currentUser.username;
        document.getElementById('user-avatar-img').src = this.currentUser.avatar;
        document.getElementById('settings-username').value = this.currentUser.username;
        document.getElementById('settings-email').value = this.currentUser.email;
        document.getElementById('settings-avatar').src = this.currentUser.avatar;
    }
    
    loadServers() {
        const serversList = document.getElementById('servers-list');
        if (!serversList) return;
        
        // Clear existing servers
        serversList.innerHTML = '';
        
        // Add home server (always present)
        const homeServer = document.createElement('div');
        homeServer.className = 'server-item';
        homeServer.innerHTML = '<i class="fas fa-home"></i><span class="tooltip">Home</span>';
        homeServer.addEventListener('click', () => {
            this.selectServer('home');
        });
        serversList.appendChild(homeServer);
        
        // Get user's servers from database
        const userServers = this.db.getServersForUser(this.currentUser.id);
        
        // Add each server
        userServers.forEach(server => {
            const serverEl = document.createElement('div');
            serverEl.className = 'server-item';
            serverEl.dataset.serverId = server.id;
            serverEl.innerHTML = `<span>${server.icon || server.name.charAt(0)}</span><span class="tooltip">${server.name}</span>`;
            
            serverEl.addEventListener('click', () => {
                this.selectServer(server.id);
            });
            
            serversList.appendChild(serverEl);
        });
    }
    
    loadDirectMessages() {
        const dmList = document.getElementById('direct-messages-list');
        if (!dmList) return;
        
        // Clear existing DMs
        dmList.innerHTML = '';
        
        // For demo, add some mock DMs
        const mockDMs = [
            { id: 1, name: 'RusCord Support', unread: true },
            { id: 2, name: 'Gaming Buddy', unread: false },
            { id: 3, name: 'Work Friend', unread: false }
        ];
        
        mockDMs.forEach(dm => {
            const dmEl = document.createElement('div');
            dmEl.className = 'channel-item';
            if (dm.unread) dmEl.classList.add('unread');
            dmEl.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <span>${dm.name}</span>
            `;
            
            dmEl.addEventListener('click', () => {
                this.selectDM(dm.id);
            });
            
            dmList.appendChild(dmEl);
        });
    }
    
    loadMembers() {
        const membersList = document.getElementById('members-list');
        if (!membersList) return;
        
        // Clear existing members
        membersList.innerHTML = '';
        
        // Add current user
        this.addMemberToList(this.currentUser, membersList);
        
        // For demo, add some mock members
        const mockMembers = [
            { id: 2, username: 'AlexJohnson', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
            { id: 3, username: 'SamSmith', status: 'idle', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
            { id: 4, username: 'TaylorSwift', status: 'dnd', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' },
            { id: 5, username: 'ChrisEvans', status: 'offline', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris' }
        ];
        
        mockMembers.forEach(member => {
            this.addMemberToList(member, membersList);
        });
        
        // Update member count
        document.getElementById('members-count').textContent = mockMembers.length + 1;
    }
    
    addMemberToList(member, list) {
        const memberEl = document.createElement('div');
        memberEl.className = 'member-item';
        memberEl.innerHTML = `
            <div class="member-avatar">
                <img src="${member.avatar}" alt="${member.username}">
            </div>
            <div class="member-info">
                <div class="member-name">${member.username}</div>
                <div class="member-status">${this.formatStatus(member.status)}</div>
            </div>
        `;
        list.appendChild(memberEl);
    }
    
    formatStatus(status) {
        const statusMap = {
            'online': 'Online',
            'idle': 'Idle',
            'dnd': 'Do Not Disturb',
            'offline': 'Offline'
        };
        return statusMap[status] || status;
    }
    
    selectServer(serverId) {
        // Update active server in UI
        document.querySelectorAll('.server-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (serverId === 'home') {
            document.getElementById('home-server').classList.add('active');
            this.currentServer = null;
            this.currentChannel = null;
            
            // Update UI for home
            document.getElementById('current-server-name').textContent = 'Direct Messages';
            document.getElementById('current-channel-name').textContent = 'friends';
            
            // Clear messages container
            this.clearMessages();
            
            // Show welcome message
            this.showWelcomeMessage();
        } else {
            const serverEl = document.querySelector(`.server-item[data-server-id="${serverId}"]`);
            if (serverEl) {
                serverEl.classList.add('active');
            }
            
            // Get server data
            const servers = this.db.getServersForUser(this.currentUser.id);
            this.currentServer = servers.find(s => s.id == serverId);
            
            if (this.currentServer) {
                // Update server name
                document.getElementById('current-server-name').textContent = this.currentServer.name;
                
                // Select first channel
                if (this.currentServer.channels.length > 0) {
                    this.selectChannel(this.currentServer.channels[0].id);
                }
            }
        }
    }
    
    selectChannel(channelId) {
        if (!this.currentServer) return;
        
        this.currentChannel = this.currentServer.channels.find(c => c.id == channelId);
        
        if (this.currentChannel) {
            // Update channel name in UI
            document.getElementById('current-channel-name').textContent = this.currentChannel.name;
            
            // Load messages for this channel
            this.loadMessages();
        }
    }
    
    selectDM(dmId) {
        this.currentServer = null;
        this.currentChannel = { id: dmId, name: 'Direct Message', type: 'dm' };
        
        // Update UI
        document.getElementById('current-server-name').textContent = 'Direct Messages';
        document.getElementById('current-channel-name').textContent = 'Direct Message';
        
        // Load DM messages
        this.loadDMMessages(dmId);
    }
    
    loadMessages() {
        if (!this.currentServer || !this.currentChannel) return;
        
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;
        
        // Clear messages
        this.clearMessages();
        
        // Get messages from database
        const messages = this.db.getMessages(this.currentServer.id, this.currentChannel.id);
        
        // Add each message to the UI
        messages.forEach(message => {
            this.addMessageToUI(message);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    loadDMMessages(dmId) {
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;
        
        // Clear messages
        this.clearMessages();
        
        // For demo, show some mock messages
        const mockMessages = [
            {
                id: 1,
                senderId: 2,
                content: 'Hey there! How are you doing?',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 2,
                senderId: 1,
                content: "I'm doing great! Just testing out RusCord.",
                timestamp: new Date(Date.now() - 3500000).toISOString()
            },
            {
                id: 3,
                senderId: 2,
                content: 'Nice! It looks just like Discord!',
                timestamp: new Date(Date.now() - 3400000).toISOString()
            }
        ];
        
        mockMessages.forEach(message => {
            this.addMessageToUI(message, true);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    addMessageToUI(message, isDM = false) {
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;
        
        // For demo, create mock sender data
        const sender = isDM ? 
            { id: message.senderId, username: message.senderId === 1 ? this.currentUser.username : 'Friend', avatar: message.senderId === 1 ? this.currentUser.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Friend' } :
            { id: message.senderId, username: this.currentUser.username, avatar: this.currentUser.avatar };
        
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        
        const time = new Date(message.timestamp);
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <img src="${sender.avatar}" alt="${sender.username}">
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${sender.username}</span>
                    <span class="message-time">${timeString}</span>
                </div>
                <div class="message-text">${message.content}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageEl);
    }
    
    clearMessages() {
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;
        
        // Keep only the welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        messagesContainer.innerHTML = '';
        
        if (welcomeMessage && !this.currentServer) {
            messagesContainer.appendChild(welcomeMessage);
        }
    }
    
    showWelcomeMessage() {
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;
        
        // Check if welcome message already exists
        if (!messagesContainer.querySelector('.welcome-message')) {
            const welcomeEl = document.createElement('div');
            welcomeEl.className = 'welcome-message';
            welcomeEl.innerHTML = `
                <h2>Welcome to RusCord!</h2>
                <p>This is your home for all your conversations. Select a server or start a direct message to begin chatting.</p>
            `;
            messagesContainer.appendChild(welcomeEl);
        }
    }
    
    setupEventListeners() {
        // Send message button
        document.getElementById('send-message-btn')?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Message input enter key
        document.getElementById('message-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Add server button
        document.getElementById('add-server-btn')?.addEventListener('click', () => {
            this.showModal('add-server-modal');
        });
        
        // Create server button
        document.getElementById('create-server-btn')?.addEventListener('click', () => {
            this.createServer();
        });
        
        // Add friend button
        document.getElementById('add-friend-btn')?.addEventListener('click', () => {
            this.showModal('add-friend-modal');
        });
        
        // Send friend request button
        document.getElementById('send-friend-request')?.addEventListener('click', () => {
            this.sendFriendRequest();
        });
        
        // Settings button
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showModal('settings-modal');
        });
        
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
        
        // Close modal buttons
        document.querySelectorAll('.close-modal, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModals();
            });
        });
        
        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchSettingsTab(tabName);
            });
        });
        
        // User status change
        document.getElementById('user-status')?.addEventListener('change', (e) => {
            this.updateUserStatus(e.target.value);
        });
        
        // Close modals when clicking overlay
        document.getElementById('modal-overlay')?.addEventListener('click', () => {
            this.hideModals();
        });
    }
    
    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (this.currentServer && this.currentChannel) {
            // Add message to database
            const newMessage = this.db.addMessage(
                this.currentServer.id, 
                this.currentChannel.id, 
                {
                    senderId: this.currentUser.id,
                    content: message
                }
            );
            
            // Add to UI
            this.addMessageToUI(newMessage);
        } else if (this.currentChannel && this.currentChannel.type === 'dm') {
            // For DM, just add to UI (in a real app, this would save to DB)
            const mockMessage = {
                id: Date.now(),
                senderId: this.currentUser.id,
                content: message,
                timestamp: new Date().toISOString()
            };
            
            this.addMessageToUI(mockMessage, true);
        }
        
        // Clear input
        input.value = '';
        
        // Scroll to bottom
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    createServer() {
        const serverNameInput = document.getElementById('server-name');
        const serverName = serverNameInput.value.trim();
        
        if (!serverName) {
            this.showAlert('Please enter a server name.', 'error');
            return;
        }
        
        // Create server in database
        const newServer = this.db.createServer({
            name: serverName,
            ownerId: this.currentUser.id,
            icon: serverName.charAt(0).toUpperCase()
        });
        
        // Hide modal
        this.hideModals();
        
        // Reload servers list
        this.loadServers();
        
        // Select the new server
        this.selectServer(newServer.id);
        
        // Show success message
        this.showAlert(`Server "${serverName}" created successfully!`, 'success');
        
        // Clear input
        serverNameInput.value = '';
    }
    
    sendFriendRequest() {
        const friendInput = document.getElementById('friend-username');
        const friendUsername = friendInput.value.trim();
        
        if (!friendUsername) {
            this.showAlert('Please enter a username.', 'error');
            return;
        }
        
        // In a real app, this would send a request to the server
        // For demo, just show a success message
        this.showAlert(`Friend request sent to ${friendUsername}!`, 'success');
        
        // Clear input
        friendInput.value = '';
        
        // Hide modal
        this.hideModals();
    }
    
    updateUserStatus(status) {
        // Update in database
        this.db.updateUserStatus(this.currentUser.id, status);
        
        // Update in UI
        document.getElementById('current-user-status').textContent = 
            status.charAt(0).toUpperCase() + status.slice(1);
        
        // Update current user object
        this.currentUser.status = status;
    }
    
    switchSettingsTab(tabName) {
        // Update active tab
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`.settings-tab[data-tab="${tabName}"]`).classList.add('active');
        
        // Show corresponding pane
        document.querySelectorAll('.settings-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        document.getElementById(`${tabName}-pane`).classList.add('active');
    }
    
    showModal(modalId) {
        document.getElementById('modal-overlay').style.display = 'block';
        document.getElementById(modalId).style.display = 'block';
    }
    
    hideModals() {
        document.getElementById('modal-overlay').style.display = 'none';
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    logout() {
        // Clear current user
        this.db.clearCurrentUser();
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
    
    showAlert(message, type) {
        // Create alert element
        const alertEl = document.createElement('div');
        alertEl.className = `alert ${type}`;
        alertEl.textContent = message;
        
        // Style the alert
        alertEl.style.position = 'fixed';
        alertEl.style.top = '20px';
        alertEl.style.right = '20px';
        alertEl.style.padding = '15px 20px';
        alertEl.style.borderRadius = '4px';
        alertEl.style.fontWeight = '600';
        alertEl.style.zIndex = '10000';
        
        if (type === 'error') {
            alertEl.style.backgroundColor = '#f04747';
            alertEl.style.color = '#fff';
        } else {
            alertEl.style.backgroundColor = '#43b581';
            alertEl.style.color = '#fff';
        }
        
        // Add to page
        document.body.appendChild(alertEl);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (alertEl.parentNode) {
                alertEl.remove();
            }
        }, 5000);
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RusCordApp();
});
