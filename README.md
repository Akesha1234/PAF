# Smart Campus Operations Hub

A complete, production-inspired web system for university facility and asset bookings, and maintenance/incident handling.

## Tech Stack
- **Backend:** Java 17, Spring Boot 3.2.x, PostgreSQL, Spring Security (OAuth2)
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router

## Prerequisites
Before running the application, ensure you have the following installed:
1. **Java 17** (e.g., Eclipse Adoptium or Oracle JDK 17)
2. **Node.js** (v18 or higher) and npm
3. **PostgreSQL** (running on default port 5432)

## 1. Database Setup
1. Open PostgreSQL (via pgAdmin or psql).
2. Create a new database named `smart_campus`:
   ```sql
   CREATE DATABASE smart_campus;
   ```
3. The backend is configured to use the default credentials:
   - Username: `postgres`
   - Password: `postgres`
   *(If your local PostgreSQL uses different credentials, update `backend/backend/src/main/resources/application.properties`)*

## 2. Running the Backend (Spring Boot)
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend/backend
   ```
2. Run the application using the Maven wrapper. We use the `dev` profile to automatically seed the database with mock data (resources and users).
   
   **On Windows:**
   ```powershell
   .\mvnw.cmd spring-boot:run -D"spring-boot.run.profiles=dev"
   ```
   
   **On Mac/Linux:**
   ```bash
   ./mvnw spring-boot:run -D"spring-boot.run.profiles=dev"
   ```
3. The backend will start on `http://localhost:8080`.

## 3. Running the Frontend (React Vite)
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The frontend will be available at `http://localhost:5173`.

## 4. OAuth2 Configuration (Optional for Local Testing)
The application uses Google OAuth2 for authentication. By default, dummy keys are in `application.properties`. If you want real Google Login to work:
1. Go to Google Cloud Console.
2. Create an OAuth 2.0 Client ID for a Web Application.
3. Set Authorized Redirect URI to: `http://localhost:8080/login/oauth2/code/google`
4. Update `application.properties` with your Client ID and Secret.

For local frontend development bypassing real OAuth, you can simulate login by navigating to the UI and observing the Dev Profile seeded accounts.

## Project Structure
- `/backend`: Contains the Spring Boot REST API.
  - Domain (Entities), Repositories, Services, Controllers, and Security logic.
- `/frontend`: Contains the Vite React application.
  - Pre-built Layouts, Tailwind configurations, Pages (Dashboard, Bookings, Resources, etc.).
