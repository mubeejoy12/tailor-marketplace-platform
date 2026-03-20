# Engineering Rules for AI Agents

This document defines strict engineering standards that must be followed when writing code in this project.

AI agents must follow these rules when generating or modifying code.

---

# 1. General Principles

The project must follow professional software engineering practices.

Code must be:

- readable
- modular
- maintainable
- scalable

Avoid quick hacks or shortcuts.

---

# 2. Architecture Rules

The backend must follow **layered architecture**.

controller → service → repository → database

Responsibilities:

Controller
- handle HTTP requests
- validate input
- call services

Service
- implement business logic
- coordinate operations

Repository
- communicate with database

Entity
- represent database tables

Controllers must NEVER contain business logic.

---

# 3. Spring Boot Standards

Use standard Spring Boot conventions.

Entities must use:

@Entity

Repositories must extend:

JpaRepository

Services must use:

@Service

Controllers must use:

@RestController

---

# 4. API Standards

All APIs must follow REST conventions.

Examples:

GET /api/designs

GET /api/designs/{id}

POST /api/orders

PUT /api/orders/{id}/status

DELETE /api/designs/{id}

---

# 5. Response Format

All APIs must return consistent JSON responses.

Success example:

{
  "success": true,
  "data": {}
}

Error example:

{
  "success": false,
  "message": "Invalid request"
}

---

# 6. DTO Usage

Controllers must NOT return entity objects directly.

Instead use DTOs.

Example:

OrderResponseDTO

DesignResponseDTO

UserResponseDTO

DTOs protect internal data structures.

---

# 7. Validation Rules

All incoming requests must be validated.

Use annotations such as:

@NotNull  
@NotBlank  
@Email  

Validation must occur before business logic runs.

---

# 8. Security Rules

Passwords must always be hashed.

Use:

BCryptPasswordEncoder

Never store passwords in plain text.

Authentication must use JWT tokens.

Protected routes must require authentication.

Admin routes must require ADMIN role.

---

# 9. Logging

Important events must be logged.

Examples:

User login  
Order creation  
Tailor registration  

Use standard Spring logging.

---

# 10. Error Handling

Global error handling must be implemented.

Create a global exception handler.

Errors should return clear messages.

Example:

"Measurement data is incomplete."

---

# 11. Database Best Practices

Each table must have:

primary key  
timestamps where needed

Use foreign keys for relationships.

Avoid duplicate data.

---

# 12. Naming Conventions

Use consistent naming.

Classes

UserService  
OrderController  

Variables

camelCase

Database tables

snake_case

---

# 13. Code Quality

Avoid large classes.

Services should focus on one responsibility.

Controllers should remain small.

---

# 14. Frontend Standards

Frontend must use:

React functional components

Hooks for state management.

API calls must go through service files.

Example:

authService.js  
orderService.js  
designService.js  

Components should not directly call APIs.

---

# 15. Git Practices

Commits should be clear.

Examples:

feat: add order creation endpoint

fix: resolve measurement validation bug

refactor: move pricing logic to service layer

---

# 16. AI Agent Restrictions

AI agents must NOT:

- generate unstructured code
- bypass architecture rules
- create undocumented endpoints
- store sensitive data insecurely

AI agents must always:

- follow architecture documents
- follow database schema
- follow API specification

---

# 17. Performance Considerations

Avoid unnecessary database queries.

Use pagination for large lists.

Example:

GET /api/designs?page=1&size=20

---

# 18. Future Scalability

Design code so that it can evolve into microservices.

Avoid tight coupling between modules.

---

# End of Engineering Rules