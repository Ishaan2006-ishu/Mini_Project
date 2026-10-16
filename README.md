# MockMate Pro — AI-Powered Interview Preparation Platform

MockMate Pro is a full-stack web application designed to help students prepare for technical interviews and placements through AI-powered mock interviews, MCQ practice, and performance tracking.

## Features

- **User Authentication:** Registration, login, email OTP verification, and protected routes.
- **AI Mock Interviews:** Interactive interview questions, follow-up questions based on candidate responses, and AI-generated feedback.
- **MCQ Practice:** AI-generated multiple-choice questions and automatic answer evaluation.
- **Interview History:** Store and review previous practice sessions and results.
- **Premium Payments:** Razorpay integration for order creation and payment verification.
- **Email Verification:** Resend API integration for OTP delivery.

## Tech Stack

**Frontend:** React, Vite, JavaScript, React Router, Axios, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** MongoDB, Mongoose  
**AI Integration:** OpenRouter API  
**Payments:** Razorpay  
**Email Service:** Resend API  
**Authentication:** JWT and bcrypt

## Project Structure

- `client/` — React frontend, pages, components, context, and API services.
- `backend/routes/` — API route definitions.
- `backend/controllers/` — Request handling and application logic.
- `backend/services/` — AI interview and question-generation services.
- `backend/models/` — Mongoose database schemas.
- `backend/middleware/` — Authentication and error-handling middleware.
- `backend/config/` — Database configuration.
- `backend/utils/` — Utility functions, including email delivery.

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB connection string
- API credentials for the services you want to use

### Installation

Clone the repository:

```bash
git clone https://github.com/Ishaan2006-ishu/Mini_Project.git
cd Mini_Project
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies in a separate terminal:

```bash
cd backend
npm install
```

### Environment Configuration

Create `.env` files using the project's `.env.example` files as references. Configure the required database connection, authentication secret, AI API, email service, payment credentials, and frontend/backend URLs. Never commit actual secrets or API keys.

### Running Locally

Start the backend using the start script defined in `backend/package.json`, for example:

```bash
npm run dev
```

Start the frontend in another terminal using the script defined in `client/package.json`, for example:

```bash
npm run dev
```

Use the local URL printed by Vite to open the application.

## Important Notes

- AI responses depend on the configured OpenRouter model and API availability.
- Email OTP and payment functionality require valid service credentials.
- Configure the frontend API base URL to point to the running backend.

## Project Purpose

MockMate Pro brings interactive AI interview practice, MCQ assessments, and interview history together in one platform to help students prepare for internships and campus placements.
