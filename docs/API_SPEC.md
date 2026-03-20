# API Specification

All responses return JSON.

Base route

/api

---

# Authentication

POST /api/auth/register

POST /api/auth/login

---

# Tailors

GET /api/tailors

GET /api/tailors/{id}

POST /api/tailors/register

---

# Designs

GET /api/designs

GET /api/designs/{id}

POST /api/designs

PUT /api/designs/{id}

DELETE /api/designs/{id}

---

# Measurements

POST /api/measurements

GET /api/measurements/user/{id}

---

# Orders

POST /api/orders

GET /api/orders/user/{id}

GET /api/orders/{id}

PUT /api/orders/{id}/status

---

# Reviews

POST /api/reviews

GET /api/reviews/tailor/{id}