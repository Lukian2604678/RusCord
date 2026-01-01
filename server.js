// Optional: Simple Node.js server for RusCord
// This is a basic Express server to serve the static files

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the main app
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// API endpoints (mock)
app.get('/api/user', (req, res) => {
    res.json({
        id: 1,
        username: 'DemoUser',
        email: 'demo@ruscord.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        status: 'online'
    });
});

app.get('/api/servers', (req, res) => {
    res.json([
        {
            id: 1,
            name: 'RusCord Official',
            icon: 'RC',
            channels: [
                { id: 1, name: 'general', type: 'text' },
                { id: 2, name: 'introductions', type: 'text' }
            ]
        },
        {
            id: 2,
            name: 'Gaming Hub',
            icon: 'GH',
            channels: [
                { id: 3, name: 'lobby', type: 'text' },
                { id: 4, name: 'valorant', type: 'text' }
            ]
        }
    ]);
});

// Start server
app.listen(PORT, () => {
    console.log(`RusCord server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
