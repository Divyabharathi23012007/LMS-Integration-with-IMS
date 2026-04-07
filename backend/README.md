# LMS Backend

## Overview

This backend is a Spring Boot REST API for the LMS (Learning Management System) application. It provides the server-side logic, database access, authentication, file upload/download, and student dashboard aggregation used by the frontend application.

The backend is designed as a layered Spring Boot application with:
- controllers exposing HTTP APIs
- services containing business logic
- repositories providing database access via Spring Data JPA
- entities modeling database tables
- DTOs defining payloads shared with the frontend

## Project Structure

The LMS project consists of three main components:
- **backend/**: Spring Boot REST API (this directory)
- **frontend/**: React/Vite web application
- **database/**: Database schema and setup scripts
- **docs/**: Documentation and commands

### Backend Folder Structure

backend/
  - HELP.md (Spring Boot reference documentation)
  - mvnw / mvnw.cmd (Maven wrapper scripts)
  - pom.xml (Maven project configuration)
  - README.md (this file)
  - src/
    - main/
      - java/com/lms/
        - config/ (Spring configuration classes)
        - controller/ (REST API endpoints)
        - dto/ (Data Transfer Objects)
        - model/ (JPA entities)
        - repository/ (Data access layer)
        - service/ (Business logic layer)
        - utils/ (Utility classes)
        - LmsApplication.java (Main application class)
      - resources/
        - application.properties (Application configuration)
        - static/ (Static resources)
        - templates/ (Thymeleaf templates, if used)
    - test/
      - java/com/lms/
        - LmsApplicationTests.java (Basic integration test)
  - target/ (Compiled classes and JAR files)

## Prerequisites

- Java 17 JDK
- MySQL database (local or remote)
- Maven or the included Maven wrapper (mvnw / mvnw.cmd)
- Frontend runs on http://localhost:5173 for local CORS allowance

## Database Setup

The application uses MySQL as the database. The current configuration points to a free online MySQL database for development/demo purposes.

### For Local Development

1. Install MySQL locally or use a Docker container:
   ```bash
   docker run --name mysql-lms -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=lms -p 3306:3306 -d mysql:8.0
   ```

2. Update `src/main/resources/application.properties` with your local database credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/lms
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

3. The application will automatically create/update the database schema on startup due to `spring.jpa.hibernate.ddl-auto=update`.

### Production Setup

For production deployment:
- Use a managed MySQL instance (AWS RDS, Google Cloud SQL, etc.)
- Set `spring.jpa.hibernate.ddl-auto=validate` or `none` and manage schema migrations manually
- Use environment variables or external configuration for sensitive credentials
- Consider using connection pooling and database migration tools like Flyway

## Build and Run

### Quick Start

To run the full LMS application:

1. **Backend**: In one terminal:
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run  # Windows
   # or
   ./mvnw spring-boot:run     # macOS/Linux
   ```

2. **Frontend**: In another terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The backend will start on `http://localhost:8080` and frontend on `http://localhost:5173`.

### Backend Only

#### Run with Maven Wrapper

Windows:
```bash
.\mvnw.cmd spring-boot:run
```

macOS / Linux:
```bash
./mvnw spring-boot:run
```

#### Package JAR

```bash
./mvnw clean package
```

Then run:
```bash
java -jar target/lms-0.0.1-SNAPSHOT.jar
```

## Configuration

### application.properties

Located at `src/main/resources/application.properties`.

Current settings:
- `spring.application.name=lms`
- `spring.datasource.url=jdbc:mysql://sql12.freesqldatabase.com:3306/sql12822196` (demo database)
- `spring.datasource.username=sql12822196`
- `spring.datasource.password=NlIGzZESqQ`
- `spring.jpa.hibernate.ddl-auto=update`
- `spring.jpa.show-sql=true`
- `spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect`

**Important**: This file contains live database credentials. For local development or team collaboration, replace these values with your own database credentials before running.

### Database Behavior

- Uses Spring Data JPA with Hibernate ORM
- `ddl-auto=update`: Hibernate automatically creates/updates database schema on startup
- `show-sql=true`: Logs all SQL queries to console (useful for debugging)
- MySQL dialect ensures proper SQL generation for MySQL

### Environment Variables

For production deployments, consider using environment variables:
```bash
export DB_URL=jdbc:mysql://your-db-host:3306/lms
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
```

Then update application.properties:
```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

## Core Architecture

### Entry Point

- src/main/java/com/lms/LmsApplication.java
  - @SpringBootApplication
  - boots the Spring application and embedded Tomcat

### Security

- src/main/java/com/lms/config/SecurityConfig.java

Current behavior:
- CSRF disabled
- CORS enabled for http://localhost:5173
- Stateless session management
- /api/auth/** routes are public
- /api/student/** routes are public
- all other routes require authentication

Important note: even though security is configured, /api/student/** is currently permitted to all, so student endpoints are effectively public.

### Layered packages

- controller: REST API endpoints
- service: business logic and orchestration
- repository: JPA persistence layer
- model: database entities
- dto: request/response payloads
- utils: helper utilities

## Important Files

### Build
- pom.xml
  - Spring Boot 3.5.11
  - spring-boot-starter-web
  - spring-boot-starter-data-jpa
  - spring-boot-starter-security
  - mysql-connector-j
  - lombok
  - spring-boot-starter-test

### Controllers
- AuthController.java
- StudentDashboardController.java
- StudyMaterialController.java
- AssignmentController.java
- AblController.java
- LeaveController.java
- QuizController.java
- FacultyController.java (empty placeholder)
- StudentController.java (empty placeholder)

### Services
- AuthService.java
- StudentDashboardService.java
- StudyMaterialService.java
- AssignmentService.java
- AblService.java
- LeaveService.java
- QuizService.java
- FacultyService.java (likely unused)
- StudentService.java (likely unused)

### Key Models
- User.java
- StudentDetails.java
- FacultyDetails.java
- Course.java
- CourseEnrollment.java
- CourseFaculty.java
- Assignment.java
- AssignmentSubmission.java
- AblActivity.java
- AblSubmission.java
- StudyMaterial.java
- LeaveRequest.java
- Quiz.java
- QuizQuestion.java
- QuizSubmission.java
- QuizResponse.java
- AttendanceSession.java
- AttendanceRecord.java
- Announcement.java
- Notification.java
- Marks.java
- Timetable.java

## API Endpoints

### Authentication

Method: POST
Path: /api/auth/login
Payload: { username, password }
Function: Password login by username or regNo

Method: POST
Path: /api/auth/qr-login
Payload: { regNo }
Function: Login via QR registration number

Method: PUT
Path: /api/auth/change-password
Payload: { regNo, currentPassword, newPassword }
Function: Update user password

### Student Dashboard / Profile

Method: GET
Path: /api/student/dashboard/{regNo}
Function: Full student dashboard payload

Method: GET
Path: /api/student/profile/{regNo}
Function: Student personal profile

Method: GET
Path: /api/student/courses/{regNo}
Function: Student enrolled courses

Method: GET
Path: /api/student/assignments/{regNo}
Function: Assignments available to student

Method: GET
Path: /api/student/attendance/{regNo}
Function: Attendance summary

Method: GET
Path: /api/student/timetable/{regNo}
Function: Student timetable

Method: GET
Path: /api/student/marks/{regNo}
Function: Marks summary

Method: GET
Path: /api/student/announcements/{regNo}
Function: Latest announcements

Method: GET
Path: /api/student/quizzes/{regNo}
Function: Quiz list

Method: GET
Path: /api/student/notifications/{regNo}
Function: Notifications list

Method: GET
Path: /api/student/notifications/{regNo}/unread-count
Function: Unread notification count

Method: PATCH
Path: /api/student/notifications/{notificationId}/read
Function: Mark notification as read

### Leave and Attendance

Method: GET
Path: /api/student/leave/{regNo}
Function: Get student leave requests

Method: POST
Path: /api/student/leave/apply
Function: Submit leave request with optional supporting file

Method: GET
Path: /api/student/attendance/{regNo}/course/{courseId}/sessions
Function: Attendance sessions for a course

### ABL (Activity-Based Learning)

Method: GET
Path: /api/student/abl/{regNo}
Function: Get ABL activities for student

Method: GET
Path: /api/student/abl/{ablId}/file
Function: Download ABL activity file

Method: POST
Path: /api/student/abl/{ablId}/submit
Function: Submit ABL activity with file upload

### Assignment Uploads

Method: GET
Path: /api/student/assignments/{assignmentId}/question
Function: Download assignment question file

Method: POST
Path: /api/student/assignments/{assignmentId}/submit
Function: Submit assignment file

### Study Materials

Method: GET
Path: /api/student/study-material/course/{courseId}
Function: Materials for a course

Method: GET
Path: /api/student/study-material/student/{regNo}
Function: Materials available to student

Method: GET
Path: /api/student/study-material/{materialId}/view
Function: Inline view file

Method: GET
Path: /api/student/study-material/{materialId}/download
Function: Download material file

### Quiz

Method: GET
Path: /api/student/quiz/submissions/{regNo}
Function: List quiz submissions

Method: POST
Path: /api/student/quiz/{quizId}/start
Function: Start a quiz and return questions

Method: POST
Path: /api/student/quiz/submission/{submissionId}/submit
Function: Submit quiz answers

## Request/Response Contracts

### Auth
- LoginRequest — { username, password }
- QrLoginRequest — { regNo }
- AuthResponse — { id, name, role, regNo }

### Other key DTOs

- StudentDashboardDTO
- StudentProfileDTO
- CourseDTO
- AssignmentDTO
- AblDTO
- StudyMaterialDTO
- LeaveRequestDTO
- QuizStartResponseDTO
- QuizQuestionDTO
- QuizSubmitRequestDTO
- QuizResultDTO
- NotificationDTO
- AttendanceDTO
- MarksDTO
- TimetableDTO

## Backend Behavior

### Authentication

- Password login verifies username or regNo against User.username / User.regNo.
- Input password is hashed with SHA-256 and compared to stored password.
- QR login authenticates only by registration number.
- change-password updates the User.password after verification.

### Public access

- The backend currently does not require authentication for /api/student/**.
- Access control is minimal, so frontend session data is relied on for navigation.

### File handling

- Upload endpoints consume multipart/form-data.
- Files are stored as byte arrays in the database.
- Download endpoints set content disposition and MIME type appropriately.

### Dashboard aggregation

- StudentDashboardService builds a combined dashboard response using a shared student context and asynchronous fetches.
- Data is aggregated from student details, course enrollments, announcements, quizzes, notifications, attendance, timetable, marks, and assignments.

## Development Notes

### Empty controller placeholders

- FacultyController.java is currently empty.
- StudentController.java is currently empty.

These are likely intended for future faculty/admin functionality.

### Future Enhancements

**Security & Authentication**
- Implement JWT or OAuth2 bearer token authentication
- Add proper authorization for student endpoints
- Implement role-based access control (RBAC)
- Add API rate limiting and security headers

**Testing**
- Add unit tests for services and utilities
- Add integration tests for controllers
- Add end-to-end tests with TestContainers
- Implement test coverage reporting

**Documentation & API**
- Add Swagger/OpenAPI documentation
- Generate API client SDKs
- Add request/response examples
- Document error codes and handling

**Production Readiness**
- Externalize configuration with Spring profiles
- Implement database migration scripts (Flyway)
- Add health checks and monitoring endpoints
- Implement logging and centralized log management
- Add containerization (Docker) support

**Performance & Scalability**
- Implement caching (Redis)
- Add database connection pooling
- Optimize queries and add indexing
- Implement pagination for large datasets

**Development Experience**
- Add pre-commit hooks and code formatting
- Implement CI/CD pipeline
- Add API versioning strategy
- Implement feature flags

## Tests

### Current Test Coverage

- `src/test/java/com/lms/LmsApplicationTests.java`
- Only verifies Spring application context loads successfully
- No unit or integration tests for business logic or controllers currently exist

### Running Tests

```bash
./mvnw test
```

### Recommended Test Structure

```
src/test/java/com/lms/
  controller/     # Controller integration tests
  service/        # Service unit tests
  repository/     # Repository tests
  utils/          # Utility class tests
  integration/    # Full integration tests
```

### Test Configuration

For testing, consider using H2 in-memory database:
```properties
# application-test.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

## Useful Commands

- `./mvnw clean install` - Clean and install dependencies
- `./mvnw package` - Package the application into a JAR
- `./mvnw spring-boot:run` - Run the application
- `./mvnw test` - Run tests

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify MySQL is running and credentials are correct
- Check if the database exists
- Ensure MySQL port (default 3306) is not blocked

**Port Already in Use**
- Backend runs on port 8080 by default
- Change port in application.properties: `server.port=8081`

**CORS Errors**
- Ensure frontend is running on http://localhost:5173
- Check SecurityConfig.java for CORS configuration

**File Upload Issues**
- Verify multipart configuration in application.properties
- Check file size limits for uploads

**Build Failures**
- Ensure Java 17 is installed and JAVA_HOME is set
- Clear Maven cache: `./mvnw clean`
- Delete target/ directory and rebuild

### Logs and Debugging

- Enable debug logging: Add `logging.level.com.lms=DEBUG` to application.properties
- View SQL queries: `spring.jpa.show-sql=true` is already enabled
- Check application startup logs for errors

## Notes for a New Teammate

### Getting Started
- Start with AuthController and AuthService to understand login and QR authentication flows
- Read StudentDashboardController and StudentDashboardService to understand the main student API
- Study SecurityConfig to see how CORS and authorization are configured
- Check application.properties before running: update DB credentials for local development

### Development Tips
- For file uploads, inspect multipart controller methods and corresponding service file storage logic
- The backend uses Lombok for entity/DTO boilerplate - ensure your IDE has Lombok support
- Use the included Maven wrapper (mvnw/mvnw.cmd) to avoid version conflicts
- Database schema is auto-managed by Hibernate - review entities in the model package

### Architecture Understanding
- Controllers handle HTTP requests and responses
- Services contain business logic and orchestrate data operations
- Repositories provide JPA-based database access
- DTOs define the contract between frontend and backend
- Models represent database entities with JPA annotations

### Testing
- Currently only basic context loading tests exist
- Consider adding unit tests for services and integration tests for controllers
- Use the test profile for testing with H2 in-memory database

### Deployment
- For production, package as JAR: `./mvnw clean package`
- Configure external database and environment variables
- Consider using Spring profiles for different environments (dev, staging, prod)

---

This README is intended to be a comprehensive knowledge transfer for the backend portion of the LMS project.
