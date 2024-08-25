const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MockEmailProvider1 {
    async sendEmail(to, subject, body) {
        return Math.random() > 0.1;
    }
}

class MockEmailProvider2 {
    async sendEmail(to, subject, body) {
        return Math.random() > 0.2;
    }
}

class EmailService {
    constructor() {
        this.provider1 = new MockEmailProvider1();
        this.provider2 = new MockEmailProvider2();
        this.retryAttempts = 5;
        this.retryDelay = 1000; // Initial delay in milliseconds
        this.rateLimit = 5000; // Rate limit in milliseconds
        this.lastSent = 0;
    }

    async sendWithRetry(provider, to, subject, body, attempt = 0) {
        if (attempt >= this.retryAttempts) return false;
        try {
            const result = await provider.sendEmail(to, subject, body);
            if (result) return true;
            throw new Error('Email sending failed');
        } catch (error) {
            await delay(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
            return this.sendWithRetry(provider, to, subject, body, attempt + 1);
        }
    }

    async handleRateLimiting() {
        const now = Date.now();
        if (now - this.lastSent < this.rateLimit) {
            await delay(this.rateLimit - (now - this.lastSent));
        }
        this.lastSent = Date.now();
    }

    async sendEmail(to, subject, body) {
        await this.handleRateLimiting();
        const result = await this.sendWithRetry(this.provider1, to, subject, body);
        if (result) return true;
        return this.sendWithRetry(this.provider2, to, subject, body);
    }
}

module.exports = { EmailService };
