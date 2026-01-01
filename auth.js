// Authentication logic for RusCord
class RusCordAuth {
    constructor() {
        this.db = rusCordDB;
        this.captcha = rusCordCaptcha;
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Tab switching
        document.getElementById('login-tab')?.addEventListener('click', () => {
            this.switchTab('login');
        });
        
        document.getElementById('register-tab')?.addEventListener('click', () => {
            this.switchTab('register');
        });
        
        // Form submissions
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // Password strength indicator
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }
    
    switchTab(tab) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (tab === 'login') {
            document.getElementById('login-tab').classList.add('active');
            document.getElementById('login-form').classList.add('active');
            document.getElementById('register-form').classList.remove('active');
        } else {
            document.getElementById('register-tab').classList.add('active');
            document.getElementById('register-form').classList.add('active');
            document.getElementById('login-form').classList.remove('active');
        }
    }
    
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const captchaInput = document.getElementById('captcha-input').value;
        
        // Validate CAPTCHA
        if (!this.captcha.validateCaptcha(captchaInput, 'login')) {
            this.showMessage('Invalid CAPTCHA code. Please try again.', 'error');
            this.captcha.generateCaptcha('captcha-display');
            return;
        }
        
        // Find user
        const user = this.db.findUserByEmail(email);
        
        if (!user) {
            this.showMessage('User not found. Please check your email or register.', 'error');
            return;
        }
        
        // Check password (in a real app, this would compare hashed passwords)
        if (user.password !== password) {
            this.showMessage('Incorrect password. Please try again.', 'error');
            return;
        }
        
        // Set current user
        this.db.setCurrentUser(user);
        
        // Show success message
        this.showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to main app after a short delay
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1500);
    }
    
    handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const captchaInput = document.getElementById('register-captcha-input').value;
        
        // Validate inputs
        if (!username || !email || !password) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }
        
        // Validate CAPTCHA
        if (!this.captcha.validateCaptcha(captchaInput, 'register')) {
            this.showMessage('Invalid CAPTCHA code. Please try again.', 'error');
            this.captcha.generateCaptcha('register-captcha-display');
            return;
        }
        
        // Check if user already exists
        if (this.db.findUserByEmail(email)) {
            this.showMessage('User with this email already exists.', 'error');
            return;
        }
        
        if (this.db.findUserByUsername(username)) {
            this.showMessage('Username already taken. Please choose another.', 'error');
            return;
        }
        
        // Create new user
        const newUser = this.db.createUser({
            username,
            email,
            password,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });
        
        // Set as current user
        this.db.setCurrentUser(newUser);
        
        // Show success message
        this.showMessage('Account created successfully! Redirecting...', 'success');
        
        // Redirect to main app after a short delay
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1500);
    }
    
    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.getElementById('strength-value');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let width = 0;
        let text = 'None';
        let color = '#f04747';
        
        if (password.length >= 6) {
            strength += 1;
        }
        
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
            strength += 1;
        }
        
        if (password.match(/\d/)) {
            strength += 1;
        }
        
        if (password.match(/[^a-zA-Z\d]/)) {
            strength += 1;
        }
        
        // Calculate width and text based on strength
        switch (strength) {
            case 1:
                width = 25;
                text = 'Weak';
                color = '#f04747';
                break;
            case 2:
                width = 50;
                text = 'Fair';
                color = '#faa61a';
                break;
            case 3:
                width = 75;
                text = 'Good';
                color = '#43b581';
                break;
            case 4:
                width = 100;
                text = 'Strong';
                color = '#43b581';
                break;
            default:
                width = 0;
                text = 'None';
                color = '#f04747';
        }
        
        // Update the UI
        strengthBar.style.width = `${width}%`;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }
    
    showMessage(message, type) {
        // Remove any existing message
        const existingMessage = document.querySelector('.message-alert');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message-alert ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.position = 'fixed';
        messageEl.style.top = '20px';
        messageEl.style.right = '20px';
        messageEl.style.padding = '15px 20px';
        messageEl.style.borderRadius = '4px';
        messageEl.style.fontWeight = '600';
        messageEl.style.zIndex = '10000';
        
        if (type === 'error') {
            messageEl.style.backgroundColor = '#f04747';
            messageEl.style.color = '#fff';
        } else {
            messageEl.style.backgroundColor = '#43b581';
            messageEl.style.color = '#fff';
        }
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
}

// Initialize authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    const auth = new RusCordAuth();
});
