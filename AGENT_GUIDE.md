# AI Agent Development Guide

This repository contains a **Tailor Marketplace Platform**.

The platform allows:

Customers to order traditional clothing from tailors.

Tailors to showcase designs and receive orders.

---

# Core Roles

Customer
- browse designs
- choose tailor
- submit measurements
- place orders
- review tailors

Tailor
- create profile
- upload designs
- receive orders
- update order status

Admin
- approve tailors
- manage users
- moderate reviews

---

# Tech Stack

Frontend
React

Backend
Java
Spring Boot

Database
PostgreSQL or MySQL

---

# Architecture Rules

AI agents must follow this architecture:

controller → service → repository → database

Controllers must not contain business logic.

Services must contain all business logic.

Repositories handle database queries.

---

# Backend Folder Structure

backend/src/main/java

controller
service
repository
entity
dto
config
security

---

# Frontend Structure

frontend/src

components
pages
services
context

---

# Coding Rules

Agents must:

- write modular code
- follow layered architecture
- use DTOs for API responses
- use REST conventions

Agents must NOT:

- place business logic in controllers
- access database directly from controllers
- store passwords as plain text

---

# Development Order

1 Authentication
2 Tailor profiles
3 Design uploads
4 Measurement system
5 Order system
6 Reviews