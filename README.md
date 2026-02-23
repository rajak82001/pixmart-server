# Pixmart Server

This directory contains the back-end Node.js/Express API server for the Pixmart application.

## Overview

The server handles user authentication, post management, orders, and payments. It connects to a MongoDB database and exposes RESTful endpoints consumed by the client.

## Getting Started

### Prerequisites
- Node.js (version 14 or later)
- npm or yarn
- MongoDB connection URI

### Installation
```bash
cd server
npm install
# or yarn install
```

### Environment Variables
Create a `.env` file in the server root with the following variables:
```
MONGO_URI=your_mongo_connection_string
ACCESS_TOKEN_SECRET=some_secret
REFRESH_TOKEN_SECRET=another_secret
PORT=5000
```

### Development
```bash
npm run dev
# or yarn dev
```
Server starts with nodemon, listening on the configured port (default 5000).

### Scripts
- `dev`: start development server with hot-reload
- `start`: run the server in production mode

## Project Structure
- `controllers/`: request handlers for different routes
- `models/`: Mongoose schemas
- `routes/`: Express route definitions
- `middlewares/`: custom middleware (e.g. token verification)
- `helpers/`: utility functions for tokens

## Database
The server uses MongoDB via Mongoose. Ensure your database is accessible and the URI is correct.

## Notes
- JWT tokens are issued for authentication and stored client-side as needed.
- Payment processing is handled via external provider (see `paymentController.js`).

## License
MIT