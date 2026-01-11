# MediMate-Back-End-Web-Application


## Style Guide
**AirBnB Javascript Style Guide**  
*Note: This requires reformatting - listed here as a record of alterations*
#### Alterations:
* Dangling underscores are allowed for MongoDB default ID field `_id`.


## API Endpoints
# Public
* GET homepage - /api/v1/

# Auth
* POST register - /api/v1/auth/register
* POST login - /api/v1/auth/login

# Patients
* POST - Create patient profile (patient only) - /api/v1/patients
* GET - Get patient by userId (Staff all, patients self, doctors with bookings for that patient) - /api/v1/patients/:userId 
* PATCH - Update patient profile (staff & patient only) - /api/v1/patients/:userId 
* DELETE - Delete patient (staff only) - /api/v1/patients/:userId

# Staff
* PATCH - Change user type (staff only) - /api/v1/staff/userType/:userId
* POST - Create staff profile (staff only) - /api/v1/staff
* GET - Get staff by userId (staff only) - /api/v1/staff/:userId  
* GET - List all staff (staff only) - /api/v1/staff
* GET - List all patients (staff only) - /api/v1/staff/patients
* PATCH - Update staff profile (staff only) - /api/v1/staff/:userId
* DELETE - Delete staff (staff only) - /api/v1/staff/:userId  

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