// CAPTCHA implementation for RusCord
class RusCordCaptcha {
    constructor() {
        this.captchaCode = '';
        this.registerCaptchaCode = '';
        this.init();
    }
    
    init() {
        // Generate initial CAPTCHA codes
        this.generateCaptcha('captcha-display');
        this.generateCaptcha('register-captcha-display');
        
        // Add event listeners
        document.getElementById('refresh-captcha')?.addEventListener('click', () => {
            this.generateCaptcha('captcha-display');
        });
        
        document.getElementById('register-refresh-captcha')?.addEventListener('click', () => {
            this.generateCaptcha('register-captcha-display');
        });
    }
    
    generateCaptcha(elementId) {
        // Create a random CAPTCHA code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let code = '';
        
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Store the code based on which CAPTCHA we're generating
        if (elementId === 'captcha-display') {
            this.captchaCode = code;
        } else {
            this.registerCaptchaCode = code;
        }
        
        // Display the CAPTCHA with some visual distortion
        this.displayCaptcha(elementId, code);
    }
    
    displayCaptcha(elementId, code) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Clear previous content
        element.innerHTML = '';
        
        // Create canvas for CAPTCHA
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#202225';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some noise (dots)
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = this.getRandomColor(100, 200);
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw the text with distortion
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add distortion to each character
        for (let i = 0; i < code.length; i++) {
            // Random rotation and position offset for each character
            const rotation = (Math.random() - 0.5) * 0.2;
            const xOffset = (i * 30) + 40;
            const yOffset = 30 + (Math.random() - 0.5) * 10;
            
            ctx.save();
            ctx.translate(xOffset, yOffset);
            ctx.rotate(rotation);
            
            // Draw character with gradient
            const gradient = ctx.createLinearGradient(0, -15, 0, 15);
            gradient.addColorStop(0, '#7289da');
            gradient.addColorStop(1, '#ffffff');
            ctx.fillStyle = gradient;
            
            ctx.fillText(code.charAt(i), 0, 0);
            ctx.restore();
        }
        
        // Add some lines through the text
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = this.getRandomColor(150, 200);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        
        // Add the canvas to the element
        element.appendChild(canvas);
    }
    
    getRandomColor(min, max) {
        const r = Math.floor(Math.random() * (max - min) + min);
        const g = Math.floor(Math.random() * (max - min) + min);
        const b = Math.floor(Math.random() * (max - min) + min);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    validateCaptcha(input, type = 'login') {
        const code = type === 'login' ? this.captchaCode : this.registerCaptchaCode;
        return input === code;
    }
}

// Create a global instance
const rusCordCaptcha = new RusCordCaptcha();
