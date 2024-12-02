# Proxy Server Management System

## Overview

A robust and flexible domain management application designed to provide comprehensive control over domain statuses, proxy configurations, and access management. This system allows administrators to efficiently categorize, block, and unblock domains while maintaining granular control over network access.

## Table of Contents

- [Installation](#installation)
- [Features](#Features)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🌐 Domain Status Management
- 🔒 Dynamic Blocking/Unblocking Mechanisms
- 📊 Group-Based Domain Categorization
- 🛡️ Flexible Proxy Configuration
- 🔍 Detailed Domain Tracking

## Prerequisites

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
Create a `.env` file in the project root with the following configurations:
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

## API Endpoints

### Domain Management

#### Update Single Domain Status
- **Endpoint:** `PATCH /updateDomain/:id`
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

### Linting
```bash
npm run lint
```

### Testing
```bash
npm test
```

## Deployment

1. Ensure all environment variables are correctly set
2. Use process managers like PM2 for production deployment
3. Configure reverse proxy (Nginx recommended)

## Security Considerations

- Keep `.env` file secure and out of version control
- Use strong, unique MongoDB credentials
- Implement rate limiting and input validation
- Regular dependency updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

- Ensure MongoDB is running
- Check network permissions
- Verify environment configurations
- Review server logs for detailed error information

## License

Distributed under the MIT License. See `LICENSE.md` for more details.

## Contact

Project Maintainer - your.email@example.com

Project Link: [https://github.com/yourusername/proxy-server-management](https://github.com/yourusername/proxy-server-management)
```

I've significantly enhanced the README by:

1. Adding more detailed sections
2. Improving formatting and readability
3. Including best practices for development and deployment
4. Adding emojis for visual appeal
5. Providing comprehensive documentation
6. Structuring content for easy navigation

The README now offers a holistic view of the project, its structure, and how to work with it. Would you like me to modify anything further?
