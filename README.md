# Resilient Email Service

## Overview

The Resilient Email Service is a Node.js application designed to send emails using multiple providers with features such as retry logic, fallback mechanisms, and rate limiting. It ensures reliable email delivery even in case of failures with one or more providers.

## Features

- **Retry Logic**: Automatically retries sending an email if the initial attempt fails.
- **Fallback Mechanism**: Falls back to a secondary email provider if the primary provider fails.
- **Rate Limiting**: Prevents sending emails too frequently by enforcing rate limits.
- **Mock Providers**: Uses mock email providers for testing with different success rates.

## Installation

To get started with the Resilient Email Service, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/dinesh4213/resilient_email_service.git
   cd resilient-email-service
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run test**
   ```bash
   npm test
   ```
