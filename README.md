# 🎓 RIT LMS — Learning Management System integrated with IMS
### Rajalakshmi Institute of Technology, Chennai

> A full-stack web application that integrates the **Learning Management System (LMS)** with the **Institute Management System (IMS)** of Rajalakshmi Institute of Technology — serving both **Students** and **Faculty** under one unified platform.

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Team](#team)

---

## 📖 About the Project

The **RIT LMS–IMS Integration** project is developed to digitize and streamline academic workflows at Rajalakshmi Institute of Technology. It provides a centralized system where students can access learning resources and faculty can manage academic activities — all connected with the institute's existing IMS data.

This platform eliminates the need for multiple disconnected systems by bringing student-side and faculty-side functionalities together in a single, cohesive application.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, JSX, CSS |
| Backend | Java, Spring Boot |
| Database | MySQL |
| API | REST API |
| Version Control | Git & GitHub |

---

## ✨ Features

### 🧑‍🎓 Student Side
- View enrolled courses and learning materials
- Access campus tour guide for new students
- Track academic progress and performance
- View GATE insights and preparation resources

### 👨‍🏫 Faculty Side
- Manage course content and materials
- View and update student records
- Faculty dashboard with schedule and layout management
- Access institute-integrated academic data

### 🏫 General
- Seamless LMS ↔ IMS data integration
- Role-based access (Student / Faculty)
- Responsive UI for all devices

---

## 📁 Project Structure

```
lms/
├── backend/
│   └── src/main/java/com/lms/
│       ├── GateInsightsController.java
│       ├── GateInsightsService.java
│       └── ...
├── frontend/
│   └── src/
│       ├── components/
│       │   └── Tour/
│       │       └── TourGuide.jsx
│       ├── pages/
│       │   └── faculty/
│       │       └── Layout.jsx
│       └── services/
│           ├── facultyService.js
│           └── tourService.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Maven
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/Divyabharathi23012007/LMS-Integration-with-IMS.git
cd LMS-Integration-with-IMS
```

### 2. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

> API runs at `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

> App runs at `http://localhost:3000`

---

## ⚙️ Configuration

In `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rit_lms
spring.datasource.username=your_username
spring.datasource.password=your_password
```

In `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

---

## 👥 Team

**Stack Hackers** — Developed as part of an academic project at Rajalakshmi Institute of Technology.

| Name | Role |
|---|---|
| Divyabharathi | Full Stack Developer |
|  | Add teammate names |

**Department:** Computer Science and Engineering
**Institution:** Rajalakshmi Institute of Technology, Chennai
**Affiliated to:** Anna University

---

## 📄 License

This project is developed for academic purposes at Rajalakshmi Institute of Technology.
© 2024–2025 Stack Hackers. All rights reserved.
