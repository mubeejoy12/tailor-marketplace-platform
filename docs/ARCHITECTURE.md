# System Architecture

The system is a **multi-tailor marketplace**.

Customers can browse designs and order from tailors.

---

# High Level Architecture

React Frontend

↓

Spring Boot Backend API

↓

Database

---

# Backend Layers

Controller

Handles HTTP requests.

Service

Handles business logic.

Repository

Handles database operations.

Entity

Represents database tables.

---

# Frontend Layers

Pages
UI screens.

Components
Reusable UI elements.

Services
API communication.

Context
Global state.

---

# Data Flow Example

Customer places order.

Frontend sends request

↓

Backend controller

↓

Service processes order

↓

Repository saves order

↓

Database stores order