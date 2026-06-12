# Verification API Reference

Base URL: `http://localhost:8080`

All endpoints require `Authorization: Bearer <jwt>` header unless noted.

---

## Tailor Endpoints

### POST `/api/tailors/verification-request`

Submit identity documents for admin review.

**Request body:**
```json
{
  "tailorId":         3,
  "nationalIdNumber": "NIN-12345678901",
  "idDocumentUrl":    "https://drive.google.com/file/d/abc/view",
  "selfieUrl":        "https://drive.google.com/file/d/xyz/view"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `tailorId` | Long | ✅ | Must be the authenticated tailor's profile ID |
| `nationalIdNumber` | String | ✅ | NIN, driver's licence number, or passport number |
| `idDocumentUrl` | String | ✅ | Public URL to scanned ID document |
| `selfieUrl` | String | ❌ | Public URL to selfie with ID |

**Response (201 Created):**
```json
{
  "id":               1,
  "tailorId":         3,
  "tailorShopName":   "Mubee Classic Tailors",
  "tailorLocation":   "Lagos, Nigeria",
  "nationalIdNumber": "NIN-12345678901",
  "idDocumentUrl":    "https://drive.google.com/file/d/abc/view",
  "selfieUrl":        "https://drive.google.com/file/d/xyz/view",
  "status":           "PENDING",
  "submittedAt":      "2026-06-03T14:30:00",
  "reviewedAt":       null,
  "reviewNote":       null
}
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 409 Conflict | A PENDING request already exists for this tailor |
| 409 Conflict | Tailor is already verified |
| 404 Not Found | Tailor profile not found |

---

### GET `/api/tailors/{tailorId}/verification-request/latest`

Get the most recent verification request for a tailor.

**Response (200 OK):** `VerificationRequestResponse` (same shape as above)

**Error:** 404 if no request exists.

---

## Admin Endpoints

### GET `/api/admin/verifications`

Return all verification requests across all statuses, newest first.

**Response (200 OK):** Array of `VerificationRequestResponse`

---

### GET `/api/admin/verifications/pending`

Return only PENDING requests, newest first.

**Response (200 OK):** Array of `VerificationRequestResponse`

---

### PUT `/api/admin/verifications/{id}/approve`

Approve a PENDING verification request.

**Side effects:**
- `VerificationRequest.status` → `APPROVED`
- `TailorProfile.verified` → `true`
- `TailorProfile.verificationStatus` → `APPROVED`
- Premium eligibility check runs
- Tailor receives in-app notification

**Request body (optional):**
```json
{ "note": "Documents verified successfully." }
```

**Response (200 OK):** Updated `VerificationRequestResponse` with `status: "APPROVED"`

**Error responses:**
| Status | Condition |
|--------|-----------|
| 404 | Request ID not found |
| 409 | Request is already APPROVED or REJECTED |

---

### PUT `/api/admin/verifications/{id}/reject`

Reject a PENDING verification request.

**Side effects:**
- `VerificationRequest.status` → `REJECTED`
- `TailorProfile.verificationStatus` → `REJECTED`
- `TailorProfile.verified` stays `false`
- Tailor receives in-app notification with reason

**Request body (optional but strongly recommended):**
```json
{ "note": "The ID document image is blurry. Please resubmit a clear photo." }
```

**Response (200 OK):** Updated `VerificationRequestResponse` with `status: "REJECTED"`

---

## TailorProfile fields added by this module

| Field | Type | Description |
|-------|------|-------------|
| `verified` | Boolean | `true` once admin approves |
| `premium` | Boolean | Auto-computed: verified + completedOrders≥20 + rating≥4.5 |
| `completedOrders` | Integer | Cached count of DELIVERED orders |
| `totalReviews` | Integer | Cached total review count |
| `verificationStatus` | String | UNVERIFIED / PENDING / APPROVED / REJECTED |

---

## Premium Auto-Promotion

After each of these events, `VerificationService.checkAndSetPremium()` is called:

1. **Admin approves** a verification → `VerificationService.approve()`
2. **Order delivered** → `OrderService.updateOrderStatus()` (DELIVERED case)
3. **Review submitted** → `ReviewService.recalculateTailorRating()`

Premium is set to `true` when:
```
verified == true
AND completedOrders >= 20
AND rating >= 4.5
```

Premium is revoked automatically if any condition is no longer met (e.g. rating drops below 4.5).
