# MediMate-Back-End-Web-Application
**TODO: Add project description here**

## Contents
- [Hardware Requirements](#hardware-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Dependencies](#dependencies)
    - [Deployment Dependencies](#deployment-dependencies)
    - [Development Dependencies](#development-dependencies)
- [Purpose of Chosen Technologies](#purpose-of-chosen-technologies)
- [Alternative Technologies](#alternative-technologies)
- [Licensing of Technologies](#licensing-of-technologies)
- [Style Guide](#style-guide)
- [Reference List](#reference-list)

## Hardware Requirements
- **Processor:** Minimum: 1GHz or faster 64-bit processor  
- **RAM:** Minimum: 1 GB
- **Storage:** Minimum: 1 GB free HDD or SSD space
- **Network:** Required: Internet access required
- **OS:** Minimum: Windows 10 / Server 2016, macOS 13.5, Linux Kernel 4.18

## Installation
1. Install Node.js
    - Recommended: Use Node Version Manager (NVM) on Linux/MacOS systems:  
        1.  ```bash
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
            ```  
        2.  ```bash
            nvm install --lts
            ```
    - For windows systems, download and install from the [official Node.js website](https://nodejs.org/en/download/) (Recommend WSL for NVM functionality)

2. Install [MongoDB](https://www.mongodb.com/try/download/community), or configure a cloud-hosted MongoDB service such as [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

3. Clone the repository:
    ```bash
    git clone git@github.com:lillieharlow/MediMate-Back-End-Web-App.git
    ```

4. Install dependencies:
    ```bash
    npm install
    ```

5. Configure environment variables:
    - Copy the `.env.example` file to `.env`
    - Update environment variables with your configuration

## Usage
**TODO: list usage instructions**

## Endpoints
| Category | Method | Endpoint | Purpose | User Access |
|---|---|---|---|---|
| Base | GET | /api/v1/ | Health Check | Public |
| Base | GET | /api/v1/databaseHealth | Database Health Check | Public |
| Auth | POST | /api/v1/auth/register | User Registration | Public |
| Auth | POST | /api/v1/auth/login | User Login | Public |
| Patients | GET | /api/v1/patients/ | Get all patients | Staff, Doctor (If assigned) |
| Patients | GET | /api/v1/patients/:id | Get patient by ID | Staff, Doctor (If assigned), Patient (Self) |
| Patients | POST | /api/v1/patients/ | Create new patient | Staff |
| Patients | PATCH | /api/v1/patients/:id | Update patient by ID | Staff, Patient (Self) |
| Patients | DELETE | /api/v1/patients/:id | Delete patient by ID | Staff |
| Staff | GET | /api/v1/staff/ | Get all staff accounts | Staff |
| Staff | GET | /api/v1/staff/:id | Get staff account by ID | Staff |
| Staff | GET | /api/v1/staff/patients | Get all patient accounts | Staff |
| Staff | POST | /api/v1/staff/ | Create new staff account | Staff |
| Staff | PATCH | /api/v1/staff/:id | Update staff account by ID | Staff |
| Staff | PATCH | /api/v1/staff/userType/:id | Update user type by ID | Staff |
| Staff | DELETE | /api/v1/staff/:id | Delete staff account by ID | Staff |

## Dependencies
### Deployment Dependencies
| Package | Version | License | Purpose |
|---|---:|---|---|
| bcryptjs | ^3.0.3 | MIT | Protecting user passwords by hashing them before storage. |
| cors | ^2.8.5 | MIT | Enabling Cross-Origin Resource Sharing to restrict access to requested resources. |
| express | ^5.2.1 | MIT | Web framework for building RESTful APIs and handling HTTP requests. |
| express-rate-limit | ^8.2.1 | MIT | Limiting repeated requests to API endpoints. |
| express-validator | ^7.3.1 | MIT | Validating and sanitizing user input. |
| helmet | ^8.1.0 | MIT | Securing HTTP headers to protect the app from well-known web vulnerabilities. |
| jsonwebtoken | ^9.0.3 | MIT | Implementing JSON Web Tokens (JWT) for secure authentication and authorization. |
| mongoose | ^9.1.1 | MIT | Object Data Modeling (ODM) library for MongoDB. |
| validator | ^13.15.26 | MIT | String validation and sanitization. |

### Development Dependencies
| Package | Version | License | Purpose |
|---|---:|---|---|
| @eslint/js | ^9.39.2 | MIT | JavaScript linting utility to enforce style guide. |
| eslint | ^8.57.1 | MIT | JavaScript linting utility to enforce style guide. |
| eslint-config-airbnb | ^19.0.4 | MIT | Airbnb's ESLint configuration to enforce style guide. |
| eslint-config-airbnb-base | ^15.0.0 | MIT |  Airbnb's base ESLint configuration to enforce style guide. |
| eslint-config-prettier | ^10.1.8 | MIT | Disables ESLint rules that might conflict with Prettier formatting. |
| eslint-plugin-node | ^11.1.0 | MIT | ESLint plugin for Node.js specific linting rules. |
| eslint-plugin-promise | ^7.2.1 | ISC | ESLint plugin for Promise-specific linting rules. |
| globals | ^17.0.0 | MIT | Defines global variables for use in test development. |
| mongodb-memory-server | ^11.0.1 | MIT | In-memory MongoDB server for testing purposes. |
| prettier | ^3.7.4 | MIT | Code formatter to ensure consistent code style. |
| supertest | ^7.2.2 | MIT | HTTP assertions for testing Node.js HTTP servers. |


## Alternative Technologies
**TODO: List alternative technologies that could have been used for this project**


## Style Guide
This project follows the [AirBnB JavaScript Style Guide](https://github.com/airbnb/javascript) with the following alterations:
#### Alterations:
* Dangling underscores are allowed for MongoDB default ID field `_id`


## Reference List:
Express-validator. (2025) *express-validator*, https://express-validator.github.io/docs, accessed: 5 January 2025.

Iqbal, K. (2025) *Authentication with JWT in MERN (Step-by-Step Guide)*, https://mernblog.com/blog/authentication-jwt-mern, accessed: 5 January 2025.

Lew, Z. (2019) *A step-by-step intro to end-point testing*, https://www.freecodecamp.org/news/end-point-testing/, accessed: 6 January 2026.

mongodb-memory-server. (2026) *mongodb-memory-server* [GitHub repository], https://github.com/typegoose/mongodb-memory-server, accessed: 7 January 2026.

Open JS Foundation. (n.d.) *Using Middleware*, https://expressjs.com/en/guide/using-middleware.html, accessed: 5 January 2026.

Pal, R. (2020) *NodeJS RESTful API Testing With Jest and Supertest*, https://medium.com/@palrajesh/nodejs-restful-api-testing-with-jest-and-supertest-490d636fe71, accessed: 6 January 2026.

Ram, M. (2025) *Beginner’s Guide: JWT Authentication Flow in MERN Stack*, https://www.linkedin.com/pulse/beginners-guide-jwt-authentication-flow-mern-stack-mukesh-ram-max--xzqvf/, accessed: 5 January 2025.

Testim. (2025) *Supertest: How to Test APIs Like a Pro*, https://www.testim.io/blog/supertest-how-to-test-apis-like-a-pro/, accessed: 6 January 2026.

Ulili, S. (2025) *Using Express-Validator for Data Validation in Node.js*, https://betterstack.com/community/guides/scaling-nodejs/express-validator-nodejs/, accessed: 5 January 2025.