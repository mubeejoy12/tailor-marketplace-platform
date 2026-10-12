# Security Configuration Guide

## CWE-321 Fix: Hard-coded Cryptographic Keys

### Vulnerability Fixed

**CWE-321: Use of Hard-coded Cryptographic Key**

The JWT secret key was previously hard-coded in `application.properties`, which violates security best practices. This has been fixed by moving the secret to environment variables.

### Configuration

#### Development Environment

For local development, use the provided `application-dev.properties` file:

```bash
# Set the active profile to development
export SPRING_PROFILES_ACTIVE=dev
```

Or run with:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

#### Production Environment

For production, set these environment variables **before** starting the application:

```bash
export JWT_SECRET="your-secure-random-jwt-secret-key-here"
export DATABASE_PASSWORD="your-secure-database-password"
export SPRING_PROFILES_ACTIVE=prod
```

**Important**: Generate a strong JWT secret with at least 32 random characters:

```bash
# Generate a secure random key
openssl rand -base64 32
```

### Migration Steps

1. **Generate a secure JWT secret**:

   ```bash
   openssl rand -base64 32
   ```

2. **Set environment variables** before deployment:

   ```bash
   export JWT_SECRET="<generated-secret>"
   export DATABASE_PASSWORD="<secure-password>"
   ```

3. **Do NOT hardcode secrets** in any properties files committed to version control

4. **Use environment-specific profiles**:
   - `application-dev.properties`: Development (with safe defaults)
   - `application-prod.properties`: Production (no defaults, must use env vars)

### Best Practices Implemented

1. ✅ Hard-coded secrets removed from properties files
2. ✅ Environment variables used for sensitive configuration
3. ✅ Safe defaults for development only
4. ✅ Separate configuration profiles for dev/prod
5. ✅ Documentation for secure deployment

### Verification

After fixing, verify the configuration:

```bash
# Check that application.properties uses environment variable placeholders
grep -n "jwt.secret=" backend/src/main/resources/application.properties

# Expected output:
# jwt.secret=${JWT_SECRET:dev-secret-key-change-in-production}
```

### Related Vulnerabilities Also Addressed

- **CWE-259**: Use of Hard-coded Password - Database password now uses environment variable
- **CWE-798**: Use of Hard-coded Credentials - All credentials now externalized

### Environment Variables Reference

| Variable                 | Purpose                            | Example                    |
| ------------------------ | ---------------------------------- | -------------------------- |
| `JWT_SECRET`             | JWT signing key (minimum 32 chars) | `openssl rand -base64 32`  |
| `DATABASE_PASSWORD`      | PostgreSQL password                | `secure-postgres-password` |
| `JWT_EXPIRATION_MS`      | Token expiration (optional)        | `86400000` (24 hours)      |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile              | `prod` or `dev`            |

### For CI/CD Pipelines

Store secrets in your CI/CD platform's secure variable store:

- **GitHub Actions**: Use GitHub Secrets
- **GitLab CI**: Use CI/CD Variables (masked)
- **Azure Pipelines**: Use Variable Groups
- **Jenkins**: Use Credentials Plugin

Never expose these values in logs or build artifacts.

---

## API Authentication & Authorization

Every request may carry `Authorization: Bearer <jwt>` (issued by `/api/auth/login` and
`/api/auth/register`). `security/JwtAuthenticationFilter` verifies it and exposes the caller
as an `AuthenticatedUser` (userId, email, role).

### Route rules (`config/SecurityConfig.java`)

| Access | Routes |
|--------|--------|
| Public | `/api/auth/**`, `POST /api/payments/webhook` (HMAC-signed by Paystack), `POST /api/measurements/ai-suggest`, `GET` tailor browsing (`/api/tailors`, `/{id}`, `/user/{userId}`, `/search/**`), `GET /api/designs/**`, `GET /api/reviews/tailor/**`, `GET /api/reviews/order/{id}/exists`, `GET /api/recommendations` |
| ADMIN  | `/api/admin/**`, `/api/analytics/admin` |
| TAILOR or ADMIN | `POST`/`PUT /api/tailors/**`, `PUT /api/orders/{id}/status`, `/api/analytics/tailor/**`, design writes |
| Any logged-in user | everything else |

Missing/invalid token → **401**; wrong role or someone else's resource → **403**.

### Ownership rules (`security/AccessGuard.java`, applied in the services)

Admins pass every ownership check.

- **Own data only:** measurements, notifications, user profile, conversations list, orders list.
  Any `userId` in a path or body must be the caller's.
- **Orders:** placed only as yourself, with your own measurement. Viewed by the customer or the
  order's tailor. Status is advanced only by the order's tailor.
- **Tailor profile, verification, tailor analytics, tailor's order list:** only the profile's owner.
- **Messages:** only the conversation's customer or the owner of its tailor profile can read or send.
  `conversation.tailorId` is the tailor's *profile* id.
- **Reviews:** only for your own delivered order, and always credited to that order's tailor.
- **Payments:** only the order's customer can initialize or verify. A priced order is always charged
  its stored amount, whatever the client sends.

### Admin accounts

Registration rejects `role: ADMIN`. To create an admin, register a normal account and promote it:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

The user must log in again afterwards so their token carries the new role.
