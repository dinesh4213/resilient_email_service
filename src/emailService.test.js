const { EmailService } = require('./emailService');

class MockEmailProvider {
	constructor(successRate) {
		this.successRate = successRate;
	}

	async sendEmail(to, subject, body) {
		return new Promise((resolve) => setTimeout(() => resolve(Math.random() < this.successRate), 100));
	}
}

describe('EmailService', () => {
	let emailService;

	beforeEach(() => {
		emailService = new EmailService();
		emailService.provider1 = new MockEmailProvider(0.2); // 20% success rate
		emailService.provider2 = new MockEmailProvider(0.8); // 80% success rate
	});

	test('should send email successfully on first attempt', async () => {
		emailService.provider1.sendEmail = jest.fn().mockResolvedValue(true);
		emailService.provider2.sendEmail = jest.fn().mockResolvedValue(false);

		const result = await emailService.sendEmail('test@example.com', 'Subject', 'Body');
		expect(result).toBe(true);
		expect(emailService.provider1.sendEmail).toHaveBeenCalled();
		expect(emailService.provider2.sendEmail).not.toHaveBeenCalled();
	});

	test('should handle fallback to second provider on failure', async () => {
		jest.setTimeout(10000); // Increase timeout to 10 seconds

		emailService.provider1.sendEmail = jest.fn().mockResolvedValue(false);
		emailService.provider2.sendEmail = jest.fn().mockResolvedValue(true);

		const result = await emailService.sendEmail('test@example.com', 'Subject', 'Body');
		expect(result).toBe(true);
		expect(emailService.provider1.sendEmail).toHaveBeenCalled();
		expect(emailService.provider2.sendEmail).toHaveBeenCalled();
	});

	test('should retry on failure and succeed eventually', async () => {
		jest.setTimeout(10000); // Increase timeout to 10 seconds

		emailService.provider1.sendEmail = jest.fn()
			.mockRejectedValueOnce(new Error('Fail'))
			.mockRejectedValueOnce(new Error('Fail'))
			.mockRejectedValueOnce(new Error('Fail'))
			.mockResolvedValueOnce(true);

		emailService.provider2.sendEmail = jest.fn().mockResolvedValue(true);

		const result = await emailService.sendEmail('test@example.com', 'Subject', 'Body');
		expect(result).toBe(true);
		expect(emailService.provider1.sendEmail).toHaveBeenCalledTimes(4); // 3 failures + 1 success
		expect(emailService.provider2.sendEmail).not.toHaveBeenCalled();
	});

	test('should retry and fallback to second provider on provider1 failure', async () => {
		jest.setTimeout(10000); // Increase timeout to 10 seconds

		emailService.provider1.sendEmail = jest.fn().mockRejectedValue(new Error('Fail'));
		emailService.provider2.sendEmail = jest.fn().mockResolvedValue(true);

		const result = await emailService.sendEmail('test@example.com', 'Subject', 'Body');
		expect(result).toBe(true);
		expect(emailService.provider1.sendEmail).toHaveBeenCalled();
		expect(emailService.provider2.sendEmail).toHaveBeenCalled();
	});

	test('should respect rate limiting', async () => {
		jest.setTimeout(10000); // Increase timeout to 10 seconds

		const originalDelay = global.setTimeout;
		global.setTimeout = (callback, ms) => callback();

		emailService.sendWithRetry = jest.fn().mockResolvedValue(true);
		emailService.handleRateLimiting = jest.fn().mockResolvedValue();

		const result = await emailService.sendEmail('test@example.com', 'Subject', 'Body');
		expect(result).toBe(true);
		expect(emailService.handleRateLimiting).toHaveBeenCalled();
		global.setTimeout = originalDelay; // Restore original setTimeout
	});
});
