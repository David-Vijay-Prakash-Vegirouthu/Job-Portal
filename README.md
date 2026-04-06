# Job Portal

A full-stack job portal application built with Spring Boot for the backend and React for the frontend.

## Features

- User registration and authentication
- Job posting and management
- Job application submission
- Dashboard for users to view jobs and applications
- File upload for resumes

## Technologies Used

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- H2 Database (or configure as needed)
- Maven

### Frontend
- React
- JavaScript
- CSS
- Axios for API calls

## Prerequisites

- Java 17 or higher
- Node.js and npm
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/David-Vijay-Prakash-Vegirouthu/Job-Portal.git
   cd Job-Portal
   ```

2. Backend Setup:
   - Navigate to the backend directory:
     ```
     cd backend
     ```
   - Run the application:
     ```
     ./mvnw spring-boot:run
     ```
   - The backend will start on `http://localhost:8080`

3. Frontend Setup:
   - Navigate to the frontend directory:
     ```
     cd frontend
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Start the development server:
     ```
     npm start
     ```
   - The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job (admin)
- `GET /api/jobs/{id}` - Get job by ID
- `PUT /api/jobs/{id}` - Update job
- `DELETE /api/jobs/{id}` - Delete job

### Job Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Submit a job application
- `GET /api/applications/{id}` - Get application by ID

## Usage

1. Register or login through the frontend.
2. Post jobs or browse available jobs.
3. Apply to jobs by uploading your resume.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature.
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## License

This project is licensed under the MIT License.