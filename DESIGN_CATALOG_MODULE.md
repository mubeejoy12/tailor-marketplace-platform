# Design Catalog Module

Roadmap Phase 4: tailors list clothing designs with a fixed price, and customers browse
them and order one directly.

## Data model

`designs` table (`entity/Design.java`)

| column      | notes                                   |
|-------------|-----------------------------------------|
| id          | PK                                      |
| tailor_id   | FK → `tailors.id`, indexed              |
| title       | required, ≤ 120 chars                   |
| description | optional, ≤ 2000 chars                  |
| price       | `NUMERIC(12,2)`, > 0                    |
| category    | required, indexed                       |
| image_url   | optional                                |
| created_at / updated_at | timestamps                  |

`orders.design_id` (nullable) records which catalog design an order came from.

## API

| Method | Path                           | Auth                 | Notes |
|--------|--------------------------------|----------------------|-------|
| GET    | `/api/designs`                 | public               | Paginated. Optional `keyword`, `category`, `tailorId`, `minPrice`, `maxPrice`, `page` (0-based), `size` (max 50), `sortBy` = `newest` \| `priceAsc` \| `priceDesc` |
| GET    | `/api/designs/{id}`            | public               | |
| GET    | `/api/designs/tailor/{tailorId}` | public             | Every design a tailor offers, newest first |
| POST   | `/api/designs`                 | TAILOR / ADMIN (JWT) | Owner is the caller's tailor profile; 409 if the shop isn't set up |
| PUT    | `/api/designs/{id}`            | owner or ADMIN       | 403 for anyone else |
| DELETE | `/api/designs/{id}`            | owner or ADMIN       | 204 on success |

Request body for POST/PUT: `{ "title", "description?", "price", "category", "imageUrl?" }`.

## Ordering from a design

`POST /api/orders` accepts an optional `designId`. When present the server checks the
design belongs to `tailorId` (409 otherwise) and sets `styleChoice` and `amount` from the
design, ignoring any client-sent values.

## Authentication

This module introduced `security/JwtAuthenticationFilter`, which verifies the
`Authorization: Bearer <token>` header and puts an `AuthenticatedUser`
(`userId`, `email`, `role`) in the SecurityContext. Only the design write routes require
it so far; every other route is still `permitAll` in `SecurityConfig`.

## Frontend

- `/designs` — catalog with search, category chips, price range, sort, pagination
- `/tailors/[id]` — "Designs" section listing the tailor's catalog
- `/orders/place?tailorId=&designId=` — pick a catalog design (real price) or a custom style (quoted later)
- `/profile/shop` — `ShopDesignsManager` for tailors to add / edit / delete designs
- `services/designService.ts` — all design API calls
