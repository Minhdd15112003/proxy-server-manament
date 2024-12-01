# Proxy Server Management

This project is a management and proxy server system that allows you to manage domain status, block or unblock domains, and handle domain groups.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/proxy-server-management.git
   cd proxy-server-management
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the server:
   ```sh
   npm start
   ```

## Usage

- The server will start on `http://localhost:3000`.
- You can access the management interface via your web browser.

## API Endpoints

### Update Domain Status

- **URL:** `/updateDomain/:id`
- **Method:** `PATCH`
- **Body:**
  ```json
  {
    "status": true,
    "blockWhiteStatus": 0
  }
  ```

### Update All Domains Status

- **URL:** `/updateAllDomains/:id`
- **Method:** `PATCH`
- **Body:**
  ```json
  {
    "status": true
  }
  ```

### Find Domain

- **URL:** `/findDomain/:id`
- **Method:** `GET`

### Find Trash

- **URL:** `/findTrash`
- **Method:** `GET`

### Post Domain

- **URL:** `/postDomain/:id`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "domainName": "example.com",
    "statusDomain": true,
    "blockWhiteStatus": 0
  }
  ```

## File Structure

The project has the following directory structure:

. ├── controllers/ # Controllers for handling application logic │ └── proxyController.js # Manages proxy-related logic (CRUD operations, etc.) ├── models/ # Mongoose models for database schemas │ └── domain.model.js # Defines the Domain schema for MongoDB ├── routes/ # Express routes for application endpoints │ └── proxyRoutes.js # Defines routes for managing proxies and domains ├── views/ # Views for rendering content (using a templating engine like EJS) │ └── domain.ejs # Template for displaying domain data ├── public/ # Public assets (JS, CSS, Images) │ ├── javascripts/ # JavaScript files for client-side behavior │ │ ├── domain.js # Domain-specific logic (handle domain actions) │ │ ├── statusDomain.js # Logic for updating and managing domain statuses │ │ └── moveDomain.js # Logic for moving domains between categories (allow/block) │ └── stylesheets/ # CSS files for styling the application │ └── custom-switch.css # Custom styles for switches (checkboxes) ├── config/ # Configuration files │ └── db.js # Database connection configuration ├── .env # Environment variables (API keys, DB URIs, etc.) ├── package.json # NPM dependencies and scripts ├── README.md # Project documentation └── server.js # Entry point to the application (starts the Express server)

### Explanation:

- **controllers/**: Contains all the controllers for handling different operations in the app.
- **models/**: Contains all the Mongoose models to interact with MongoDB.
- **routes/**: Contains the route definitions for API endpoints.
- **views/**: The folder for server-side rendered views (if you're using a templating engine like EJS).
- **public/**: Contains static files such as JavaScript, CSS, and images.
- **config/**: Contains configuration files, such as database connection setups.
- **.env**: Stores environment variables (ensure to keep it secure and add it to `.gitignore`).
- **package.json**: Lists project dependencies and defines npm scripts for running or building the app.
- **server.js**: The main file for bootstrapping and starting the Express server.

Feel free to adjust the structure if your project has additional folders or files!
