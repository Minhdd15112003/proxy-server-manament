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
