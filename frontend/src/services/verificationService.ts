/**
 * verificationService.ts
 * API client for the Tailor Verification System.
 *
 * Tailor endpoints:
 *   submitVerificationRequest()  → POST /api/tailors/verification-request
 *   getLatestVerificationRequest() → GET /api/tailors/{tailorId}/verification-request/latest
 *
 * Admin endpoints:
 *   getAllVerifications()         → GET  /api/admin/verifications
 *   getPendingVerifications()     → GET  /api/admin/verifications/pending
 *   approveVerification()         → PUT  /api/admin/verifications/{id}/approve
 *   rejectVerification()          → PUT  /api/admin/verifications/{id}/reject
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerificationSubmitPayload {
  tailorId:        number;
  nationalIdNumber: string;
  idDocumentUrl:   string;
  selfieUrl?:      string;
}

export interface VerificationRequestResponse {
  id:              number;
  tailorId:        number;
  tailorShopName:  string | null;
  tailorLocation:  string | null;
  nationalIdNumber: string;
  idDocumentUrl:   string;
  selfieUrl:       string | null;
  status:          "PENDING" | "APPROVED" | "REJECTED";
  submittedAt:     string;
  reviewedAt:      string | null;
  reviewNote:      string | null;
}

export interface VerificationDecisionPayload {
  note?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tailor_token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = JSON.parse(text) as Record<string, unknown>;
      msg = (j.error as string) || (j.message as string) || text || msg;
    } catch { msg = text || msg; }
    throw new Error(msg);
  }
  return JSON.parse(text) as T;
}

// ─── Tailor actions ───────────────────────────────────────────────────────────

/** Submit identity documents for admin review */
export async function submitVerificationRequest(
  payload: VerificationSubmitPayload,
): Promise<VerificationRequestResponse> {
  const res = await fetch(`${API_BASE}/api/tailors/verification-request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse<VerificationRequestResponse>(res);
}

/** Get the most recent verification request for a tailor */
export async function getLatestVerificationRequest(
  tailorId: number,
): Promise<VerificationRequestResponse> {
  const res = await fetch(
    `${API_BASE}/api/tailors/${tailorId}/verification-request/latest`,
    { headers: authHeaders() },
  );
  return parseResponse<VerificationRequestResponse>(res);
}

// ─── Admin actions ────────────────────────────────────────────────────────────

/** Get all verification requests (all statuses) */
export async function getAllVerifications(): Promise<VerificationRequestResponse[]> {
  const res = await fetch(`${API_BASE}/api/admin/verifications`, {
    headers: authHeaders(),
  });
  return parseResponse<VerificationRequestResponse[]>(res);
}

/** Get only PENDING verification requests */
export async function getPendingVerifications(): Promise<VerificationRequestResponse[]> {
  const res = await fetch(`${API_BASE}/api/admin/verifications/pending`, {
    headers: authHeaders(),
  });
  return parseResponse<VerificationRequestResponse[]>(res);
}

/** Approve a verification request */
export async function approveVerification(
  id: number,
  payload?: VerificationDecisionPayload,
): Promise<VerificationRequestResponse> {
  const res = await fetch(`${API_BASE}/api/admin/verifications/${id}/approve`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload ?? {}),
  });
  return parseResponse<VerificationRequestResponse>(res);
}

/** Reject a verification request */
export async function rejectVerification(
  id: number,
  payload?: VerificationDecisionPayload,
): Promise<VerificationRequestResponse> {
  const res = await fetch(`${API_BASE}/api/admin/verifications/${id}/reject`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload ?? {}),
  });
  return parseResponse<VerificationRequestResponse>(res);
}
