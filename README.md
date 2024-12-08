# Proxy Server Management System

## Overview

A robust and flexible domain management application designed to provide comprehensive control over domain statuses, proxy configurations, and access management. This system allows administrators to efficiently categorize, block, and unblock domains while maintaining granular control over network access.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

## Features

- 🌐 Domain Status Management
- 🔒 Dynamic Blocking/Unblocking Mechanisms
- 📊 Group-Based Domain Categorization
- 🛡️ Flexible Proxy Configuration
- 🔍 Detailed Domain Tracking

## Prerequisites

Ensure you have the following installed:

- Node.js (v16.x or later)
- MongoDB (v5.x or later)
- npm (v8.x or later)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/proxy-server-management.git
cd proxy-server-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/proxymanagement
PORT=3000
NODE_ENV=development
```

### 4. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Usage

1. Ensure MongoDB is running
2. Start the application using the commands above
3. Access the API endpoints via `http://localhost:3000`
4. Use API clients like Postman or cURL to interact with the endpoints

## API Endpoints

### Domain Management

#### Update Single Domain Status

- **Endpoint:** `PATCH /updateStatusDomain/:id`
- **Request Body:**

```json
{
  "status": true,
  "blockWhiteStatus": 0
}
```

#### Update All Domains

- **Endpoint:** `PATCH /updateAllDomains/:id`
- **Request Body:**

```json
{
  "status": true
}
```

#### Domain Operations

- `GET /findDomain/:id` - Retrieve specific domain details
- `GET /findTrash` - List domains in trash
- `POST /postDomain/:id` - Add new domain

## Project Structure

```
proxy-server-management/
│
├── controllers/           # Application logic handlers
│   └── proxyController.js # Proxy management CRUD operations
│
├── models/                # Database schemas
│   └── domain.model.js    # MongoDB Domain schema definition
│
├── routes/                # API endpoint definitions
│   └── proxyRoutes.js     # Domain and proxy route configurations
│
├── views/                 # Server-side rendering templates
│   └── domain.ejs         # Domain data visualization template
│
├── public/                # Static web assets
│   ├── javascripts/       # Client-side scripts
│   │   ├── domain.js      # Domain interaction logic
│   │   ├── statusDomain.js # Domain status management
│   │   └── moveDomain.js  # Domain category transitions
│   │
│   └── stylesheets/       # Styling resources
│       └── custom-switch.css # UI component styles
│
├── config/                # Configuration management
│   └── db.js              # Database connection setup
│
├── .env                   # Environment variable configurations
├── package.json           # Project metadata and dependency management
└── server.js              # Application entry point
```

## Development Workflow

### Code Quality

```bash
# Run linter
npm run lint

# Run tests
npm test
```

## Deployment

1. Set environment variables securely
2. Use process managers like PM2 for production
3. Configure reverse proxy (Nginx recommended)
4. Implement CI/CD pipelines

## Security Considerations

- Secure `.env` file (add to `.gitignore`)
- Use strong MongoDB credentials
- Implement:
  - Rate limiting
  - Input validation
  - Authentication middleware
- Regularly update dependencies
- Use HTTPS
- Implement proper error handling

## Contributing

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Commit changes
   ```bash
   git commit -m 'Add detailed description of changes'
   ```
4. Push to branch
   ```bash
   git push origin feature/YourFeatureName
   ```
5. Open a Pull Request

## Troubleshooting

Common issues and solutions:

- MongoDB connection problems
  - Verify connection string
  - Check MongoDB service status
- Dependency conflicts
  - Run `npm cache clean --force`
  - Reinstall dependencies
- Port conflicts
  - Change port in `.env`
  - Check for running processes

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

**Project Maintainer:** Minh

- Email:minhtit006@gmail.com
- GitHub: [@Minhdd15112003](https://github.com/Minhdd15112003)
- Project Link: [[https://github.com/Minhdd15112003/proxy-server-manament](https://github.com/Minhdd15112003/proxy-server-manament)]

---
