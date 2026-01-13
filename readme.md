# Event Ticket Distribution System (ETDS)

A full-stack, containerized ticketing platform simulation designed to mirror some of the core complexities of enterprise platforms like **Ticketmaster/StubHub**. This project focuses on high-concurrency inventory management, role-based access control (RBAC), and real-time sales analytics.

![Distributor Sales Dashboard Preview](assets/distributorsdashboard.png)
![Artists Sales Dashboard Preview](assets/artistsdashboard.png)
![Top 5 in Gross Sales Ranking Preview](assets/top5artists.png)

## Key Features

### 1. Enterprise Inventory Management
- **Complex Domain Modeling:** Manages relationships between 8 distinct MongoDB collections (Venues, Events, Tickets, Transactions).
- **Concurrency Handling:** Simulates real-time ticket availability and reservation locking logic.

### 2. Role-Based Access Control (RBAC)
- **Secure Authentication:** Implemented **JWT** to manage session state across the application.
- **Granular Permissions:** Distinct interfaces and API access for:
  - **Admins:** Global system oversight and database management.
  - **Distributors:** Venue capacity planning and event scheduling.
  - **Artists:** Tour performance tracking and sales analytics.
  - **Customers:** Ticket purchasing and purchase history.

### 3. Real-Time Analytics Dashboard
- **Data Visualization:** Integrated **Chart.js** to visualize "Monthly Gross Sales by Artist" and "Venue Performance."
- **Aggregation Pipelines:** Utilized complex MongoDB aggregations to calculate top-performing artists and revenue streams in real-time.

## Tech Stack

| Component | Technology | Usage |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express | REST API, Business Logic, Auth |
| **Database** | MongoDB (Replica Set) | Data Persistence, Aggregation Pipelines |
| **Frontend** | Angular v20, TypeScript | Client Interface, State Management (Signals) |
| **Infrastructure** | Docker, Docker Compose | Multi-container orchestration |
| **Security** | BCrypt, JWT | Password hashing, Stateless Auth |

## Setup & Installation

**Prerequisites:** Docker Desktop, Node.js and npm, an IDE

1. **Clone the repository**
   ```bash
   git clone https://github.com/itspeasi/etds-project.git
   cd etds-project
   ```

2. **Configure Environment Variables**
   Create an .env file in the server directory to store your secrets.
   ```bash
   # Create file: server/.env
   PORT=3000
   MONGO_URI=mongodb://mongo:27017/etds?replicaSet=rs0
   JWT_SECRET=your_secure_random_secret_here
   ```

3. **Start the Environment**
   ```bash
   docker-compose up --build
   ```
   *The API will launch on port 3001 and the Client on port 4200.*

4. **Seed the Database (Optional, but recommended)**
   Populate the system with simulated venues, artists, and transaction history:
   ```bash
   docker-compose exec server node utils/seeder.js
   ```

5. **Run the frontend in another terminal**
   ```bash
   cd client
   npm install
   npm start
   ```

6. **Open a browser to http://localhost:4200**

## Default Credentials
Once the seed data is populated, you can log in with the following standard accounts (there are more accounts in the seed data you can view in /utils/seeder.js):

- **Admin:** `admin` / `2222`
- **Distributor:** `distributor1` / `2222`
- **Customer:** `customer1` / `2222`
- **Artist:** `fisher` / `2222`

## Project Context

This application was originally developed as a graduate-level capstone for a **Database Programming** course. It serves as an exploration of complex schema design, aggregation pipelines, and full-stack integration.

While developed independently, the domain logic (Inventory, B2B Management, Reporting) conceptually mirrors enterprise solutions such as **Ticketmaster ARCHTICS**, demonstrating the transferability of these backend skills to the live events industry.