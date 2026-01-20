# MediMate — Back-End Web Application ⚕️
A clean, minimal back-end API for MediMate — a medical appointment booking system built with Node.js, Express and MongoDB.

## Contents
- [Hardware Requirements](#hardware-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Dependencies](#dependencies)
    - [Deployment Dependencies](#deployment-dependencies)
    - [Development Dependencies](#development-dependencies)
- [Alternative Technologies](#alternative-technologies)
- [Style Guide](#style-guide)
- [Reference List](#reference-list)

---

## Hardware Requirements
- ✅ Processor: 1 GHz or faster 64‑bit CPU  
- ✅ RAM: 1 GB minimum  
- ✅ Storage: 1 GB free HDD/SSD  
- ✅ Network: Internet access  
- ✅ OS: Windows 10 / Server 2016, macOS 13.5, Linux Kernel 4.18+

---

## Installation
1. Install Node.js (recommend NVM on Linux/macOS)
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
     nvm install --lts
     ```
     For Windows, use the official installer (WSL recommended for NVM).

2. Install MongoDB or use MongoDB Atlas: https://www.mongodb.com/try/download/community

3. Clone the repo:
     ```bash
     git clone git@github.com:lillieharlow/MediMate-Back-End-Web-App.git
     cd MediMate-Back-End-Web-App
     ```

4. Install dependencies:
     ```bash
     npm install
     ```

5. Configure environment:
     ```bash
     cp .env.example .env
     # Edit .env with your config
     ```

---

## Usage
### Production Environment
```bash
npm start
```
### Development Environment
```bash
npm run dev
```
### Running Tests
```bash
npm test
```

---

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
| Staff | GET | /api/v1/staff/users | Get all user accounts of any type | Staff |
| Staff | POST | /api/v1/staff/ | Create new staff account | Staff |
| Staff | PATCH | /api/v1/staff/:id | Update staff account by ID | Staff |
| Staff | PATCH | /api/v1/staff/userType/:id | Update user type by ID | Staff |
| Staff | DELETE | /api/v1/staff/:id | Delete staff account by ID | Staff |
| Doctors | GET | /api/v1/doctors | List all doctors | Staff, Patient |
| Doctors | GET | /api/v1/doctors/:userId | Get one doctor | Staff, Doctor (Self) |
| Doctors | POST | /api/v1/doctors | Create doctor profile | Staff |
| Doctors | PATCH | /api/v1/doctors/:userId | Update doctor profile | Staff, Doctor (Self) |
| Doctors | DELETE | /api/v1/doctors/:userId | Delete doctor profile | Staff |
| Bookings | GET | /api/v1/bookings | List all bookings | Staff |
| Bookings | GET | /api/v1/bookings/patients/:userId | Get all bookings for one patient | Staff, Doctor (Self), Patient (Self) |
| Bookings | GET | /api/v1/bookings/doctors/:userId | Get all bookings for one doctor | Staff, Doctor (Self) |
| Bookings | GET | /api/v1/bookings/:bookingId | Get one booking | Staff, Doctor (Self), Patient (Self) |
| Bookings | POST | /api/v1/bookings | Create a booking | Staff, Patient |
| Bookings | PATCH | /api/v1/bookings/:bookingId | Update a booking | Staff, Doctor (Self), Patient (Self) |
| Bookings | PATCH | /api/v1/bookings/:bookingId/doctorNotes | Update doctor notes of a booking | Doctor (Self) |
| Bookings | DELETE | /api/v1/bookings/:bookingId | Delete a booking | Staff, Patient (Self) |

## Dependencies

### Deployment Dependencies
| Package | Version | License | Purpose |
|---|---:|---|---|
| bcryptjs | ^3.0.3 | BSD-3-Clause | Protecting user passwords by hashing them before storage. |
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

---

## Alternative Technologies
**TODO: List alternative technologies that could have been used for this project**
### Deployment Dependencies
| Package | Alternatives | Reason For Selecting Package |
|---|---|---|
| bcryptjs | Argon2, Scrypt, PBKDF2 | Bcrypt was selected due to its industry acceptance, balance of security and performance, and ubiquitous documentation. |
| cors | Corser, express-cors  | CORS itself represents the industry standard for allowing resource sharing across origins. The cors NPM package is the most widely implemented package for this purpose. |
| express | Fastify, Koa | With ~57M weekly downloads, express is the largest web framework for Node.js, and therefore has the widest availability of community support & plugins. Fastify & Koa are both newer frameworks with more specialised use cases, which were not necessary for this app. |
| express-rate-limit | rate-limiter-flexible | Rate-limiter-flexible offers more advanced rate limiting features for wider use cases and integration into data storage solutions, however this app requires basic rate limiting functionality at the API level, and as such the express-rate-limit package was sufficient. |
| express-validator | joi | Express-validator was selected for its ease of integration with Express, while still offering sufficient validation capabilities for this use case. Joi provides more comprehensive validation and is more widely adopted, but not required for this app. |
| helmet | hsts | Helmet is widely adopted by the community for setting common HTTP security headers. While other packages performing similar functions are available, they target more specific security features or headers, while Helmet provides a comprehensive simple to implement solution. |
| jsonwebtoken | express-jwt, jose | jsonwebtoken is used to create & verify JWTs in the app. Express-jwt provides specific middleware for express, and is itself dependent on jsonwebtoken, so jsonwebtoken is used for flexibility of implementation into the app. Jose provides a more comprehensive solution with additional features, however these features are not required in this use case. |
| mongoose | prisma, sequalize | Mongoose was selected for its specialisation with MongoDB, and ease of integration with express. Prisma and Sequelize are more general ORM tools that support multiple databases, but were not necessary for this app. |

### Development Dependencies
| Package | Alternatives | Reason For Selecting Package |
|---|---|---|
| eslint | biome, oxlint | Eslint is the most feature-rich and widely adopted JavaScript linter, providing extensive rules and community support, and integration with the AirBnB style guide, which was selected for this project. |
| eslint-config-airbnb | Google, Standard | The AirBnB style guide was chosen due to its wide acceptance in the community, and ease of integration into linters & formatters. |
| eslint-config-prettier | Eslint configuration | eslint-config-prettier disables eslint rules that may conflict with the code formatter used in this project, prettier. An alternative would be direct modification of eslint rules to accommodate prettier formatting, which would add unnecessary workload. |
| eslint-plugin-node | N/A | Adds additional ESLint rules specific to the Node.js environment.  |
| eslint-plugin-promise | N/A | Adds additional ESLint rules for improved handling of promises. |
| globals | N/A | Configures global variables for ESLint to recognize, preventing false positives for undefined variables. |
| jest | mocha, chai | Jest offers a comprehensive framework for writing tests, and is widely adopted in the community. While alternatives are just as capable, familiarity with Jest was a deciding factor for this project. |
| mongodb-memory-server | Environment configuration | Provides an in-memory MongoDB server for testing, without requiring configuration of development environment handling in database configuration. |
| prettier | biome, beautify | Prettier is a widely adopted code formatter, with extensive community support and integration options, particularly with ESLint and IDEs. It was chosen for its simple setup and linter integration. |
| supertest | nock | Supertest provides HTTP server mocking for Node.js implementations. It was chosen for its simplicity of integration with Express, and community recognition. |

## Style Guide
This project follows the AirBnB JavaScript Style Guide with one alteration:
- Allow dangling underscore for MongoDB `_id`.

---

## Reference List
Express-validator. (2025) *express-validator*, https://express-validator.github.io/docs, accessed: 5 January 2025.

Iqbal, K. (2025) *Authentication with JWT in MERN (Step-by-Step Guide)*, https://mernblog.com/blog/authentication-jwt-mern, accessed: 5 January 2025.

Lew, Z. (2019) *A step-by-step intro to end-point testing*, https://www.freecodecamp.org/news/end-point-testing/, accessed: 6 January 2026.

mongodb-memory-server. (2026) *mongodb-memory-server* [GitHub repository], https://github.com/typegoose/mongodb-memory-server, accessed: 7 January 2026.

Open JS Foundation. (n.d.) *Using Middleware*, https://expressjs.com/en/guide/using-middleware.html, accessed: 5 January 2026.

Pal, R. (2020) *NodeJS RESTful API Testing With Jest and Supertest*, https://medium.com/@palrajesh/nodejs-restful-api-testing-with-jest-and-supertest-490d636fe71, accessed: 6 January 2026.

Ram, M. (2025) *Beginner’s Guide: JWT Authentication Flow in MERN Stack*, https://www.linkedin.com/pulse/beginners-guide-jwt-authentication-flow-mern-stack-mukesh-ram-max--xzqvf/, accessed: 5 January 2025.

Testim. (2025) *Supertest: How to Test APIs Like a Pro*, https://www.testim.io/blog/supertest-how-to-test-apis-like-a-pro/, accessed: 6 January 2026.

Ulili, S. (2025) *Using Express-Validator for Data Validation in Node.js*, https://betterstack.com/community/guides/scaling-nodejs/express-validator-nodejs/, accessed: 5 January 2025.