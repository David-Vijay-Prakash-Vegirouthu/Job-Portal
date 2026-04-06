# Design Document for Job Portal

## Overview

The Job Portal is a full-stack web application that allows users to register, login, post jobs, and apply for jobs. Employers can manage job postings, and job seekers can submit applications with resume uploads. The application consists of a Spring Boot backend for API services and a React frontend for the user interface.

## System Architecture

The application follows a client-server architecture:

- **Frontend**: React single-page application (SPA) running on the client-side.
- **Backend**: Spring Boot REST API server handling business logic, data persistence, and authentication.
- **Database**: H2 in-memory database for development (can be configured for production databases like MySQL or PostgreSQL).
- **File Storage**: Local file system for resume uploads (uploads folder).

### High-Level Architecture Diagram

```
[React Frontend] <--- HTTP/HTTPS ---> [Spring Boot Backend]
                                      |
                                      v
                                [H2 Database]
                                      |
                                      v
                            [File System (Uploads)]
```

- Frontend communicates with Backend via RESTful APIs.
- Backend handles authentication, data validation, and business logic.
- Database stores user, job, and application data.
- Uploaded files are stored in the backend's uploads directory.

## Backend Design

### Technologies
- **Framework**: Spring Boot
- **Language**: Java 17
- **ORM**: Spring Data JPA
- **Security**: Spring Security (for authentication)
- **Build Tool**: Maven

### Components
- **Controllers**: Handle HTTP requests (AuthController, JobController, JobApplicationController, TestController)
- **Services**: Business logic layer (not explicitly shown but implied in controllers)
- **Repositories**: Data access layer using JPA (UserRepository, JobRepository, JobApplicationRepository)
- **Models**: Entity classes (User, Job, JobApplication)
- **Configuration**: application.properties for database and server settings

### API Endpoints
- Authentication: `/api/auth/register`, `/api/auth/login`
- Jobs: `/api/jobs` (CRUD operations)
- Applications: `/api/applications` (CRUD operations)

### Security
- JWT-based authentication for securing endpoints.
- Password encryption using BCrypt.
- Role-based access (e.g., admin for job posting).

## Frontend Design

### Technologies
- **Framework**: React
- **Language**: JavaScript (ES6+)
- **Styling**: CSS
- **HTTP Client**: Axios for API calls
- **Build Tool**: npm

### Components
- **App.js**: Main application component with routing.
- **Login.js**: User login form.
- **Register.js**: User registration form.
- **Dashboard.js**: Main dashboard for viewing jobs and applications.
- **Other Components**: Additional UI components as needed.

### Features
- Responsive design for desktop and mobile.
- Form validation for user inputs.
- State management using React hooks.
- Navigation between pages (login, register, dashboard).

## Database Design

### Schema
- **User Table**:
  - id (Primary Key)
  - username
  - email
  - password (hashed)
  - role (e.g., USER, ADMIN)

- **Job Table**:
  - id (Primary Key)
  - title
  - description
  - company
  - location
  - postedBy (Foreign Key to User)

- **JobApplication Table**:
  - id (Primary Key)
  - jobId (Foreign Key to Job)
  - applicantId (Foreign Key to User)
  - resumePath (file path)
  - status (e.g., PENDING, ACCEPTED, REJECTED)

### Relationships
- User has many Jobs (one-to-many).
- User has many JobApplications (one-to-many).
- Job has many JobApplications (one-to-many).

## API Design

### RESTful Principles
- Use HTTP methods: GET, POST, PUT, DELETE.
- JSON for request/response bodies.
- Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error.

### Example Endpoints
- `POST /api/auth/login`: Body {email, password} -> Response {token}
- `GET /api/jobs`: Headers {Authorization: Bearer token} -> Response [job objects]
- `POST /api/applications`: Body {jobId, resume} -> Response {applicationId}

## Security Considerations

- **Authentication**: JWT tokens with expiration.
- **Authorization**: Check user roles for protected endpoints.
- **Input Validation**: Sanitize inputs to prevent SQL injection and XSS.
- **File Upload Security**: Validate file types and sizes for resumes.
- **HTTPS**: Use SSL/TLS in production.
- **Environment Variables**: Store sensitive data (e.g., secrets) in env files.

## Deployment

### Backend Deployment
- Package as JAR using Maven.
- Deploy to cloud platforms like Heroku, AWS Elastic Beanstalk, or Azure App Service.
- Configure production database (e.g., PostgreSQL).

### Frontend Deployment
- Build production bundle with `npm run build`.
- Serve static files via web server (e.g., Nginx) or deploy to platforms like Vercel, Netlify.

### Full Deployment
- Use Docker for containerization.
- Orchestrate with Kubernetes or Docker Compose for local development.

## Future Enhancements

- Add email notifications for job applications.
- Implement search and filtering for jobs.
- Add user profiles and company pages.
- Integrate with external job APIs.
- Implement real-time notifications using WebSockets.

## Conclusion

This design document outlines the architecture and key components of the Job Portal application. It provides a foundation for development, testing, and deployment. For detailed implementation, refer to the source code in the repository.