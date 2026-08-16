# 🌿 Bloomora – Smart Task Management System

Bloomora is a web-based Smart Task Management System developed using Flask, SQLite, HTML, CSS, and JavaScript.

The application helps users create, manage, update, delete, search, and track their tasks through a simple and responsive interface.

##  Live Demo

(https://bloomora-ru5d.onrender.com)

##  Features

- User Signup and Login
- Secure password hashing
- Session-based authentication
- Add new tasks
- View all tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as Completed/Pending
- Task priorities: High, Medium, Low
- Due dates
- Search and filter tasks
- Dashboard with task statistics
- Smart Suggestions section
- Light and Dark mode
- Responsive design for desktop and mobile
- SQLite database for storing users and tasks

##  Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask

### Database
- SQLite

### Security
- Werkzeug Password Hashing
- Flask Sessions

### Deployment
- Render

##  Project Architecture

The application follows a simple three-layer architecture:

```text
User
  ↓
Frontend (HTML + CSS + JavaScript)
  ↓
Flask Backend / REST APIs
  ↓
SQLite Database
