# Application License Verification Specification

## Overview

This document defines the standardized protocol for license verification within the SaaS ecosystem. All applications must implement this verification layer to ensure that access is granted only to active licensees.

**Philosophy**: "Fail Closed" — If verification cannot be confirmed, access is denied.

## System Philosophy: One-License = Full System Access

Our ecosystem operates on a simple, unified model: a single valid license grant full access to the entire system and all its integrated applications. There are no tiered feature gates based on the license key itself; the key is binary (Active/Inactive).

## Required Environment Variables

Applications must configure the following variables in their production environment:

| Variable             | Description                                                           |
| :------------------- | :-------------------------------------------------------------------- |
| `LICENSE_SERVER_URL` | Base URL of the central license authority.                            |
| `APP_KEY`            | Unique identifier for the calling application.                        |
| `APP_SECRET`         | Secret key used for HMAC signing (must NEVER be exposed to frontend). |

## When to Verify License

1. **At Registration**: Must verify the key before creating a new tenant/company.
2. **At Login**: Re-verify the key to ensure the account is still in good standing.
3. **Periodically**: Every 15-30 minutes during an active session (managed via caching).
4. **Critical Actions**: Before sensitive operations (e.g., payroll execution, data export).

## Verification Flow

1. **Client App**: Collects License Key and constructs a signature.
2. **Client App**: Sends a `POST` request to `${LICENSE_SERVER_URL}/api/licenses/verify`.
3. **License Server**: Validates HMAC signature and checks DB for license status.
4. **License Server**: Returns validation result with status and metadata.
5. **Client App**: Enforces access based on the response.

## HMAC Generation Steps

To secure communication, every request must include an HMAC SHA256 signature.

1. **Prepare Signature String**: Concatenate `APP_KEY`, `Nonce` (unique random string), and `Timestamp` (ISO 8601).
   - Format: `APP_KEY:TIMESTAMP:NONCE`
2. **Generate HMAC**: Use the `APP_SECRET` as the key to sign the signature string using SHA256.
3. **Encode**: Use Hex encoding for the final signature string.

### Header Configuration

Requests must include the following headers:

| Header        | Description                                |
| :------------ | :----------------------------------------- |
| `X-App-Key`   | Your `APP_KEY`.                            |
| `X-Timestamp` | The exact timestamp used in the signature. |
| `X-Nonce`     | The unique nonce used in the signature.    |
| `X-Signature` | The generated HMAC SHA256 signature.       |

## Handling Successful Verification

If the server returns `{"valid": true}`:

- **Allow Full Access**: Unlock all system modules.
- **Cache Result**: Store the validation state in a short-term memory store (e.g., Redis or local memory).
- **TTL**: Set the cache expiry between 15 and 30 minutes.

## Handling License Failure

If verification fails, the application must:

1. **Immediately Block Protected Routes**: Redirect to a `/subscription-required` or `/locked` screen.
2. **Display Clear Reason**: Show why the license failed (see [Failure Reasons](#failure-reasons)).
3. **Prevent Data Mutations**: Disable all `POST`, `PUT`, `DELETE` operations.
4. **Disable Background Jobs**: Pause any automated tasks for that tenant.
5. **Link to Portal**: Provide a Direct link to the billing portal for resolution.

### Failure Reasons

- `LICENSE_EXPIRED`: The term of the license has ended.
- `LICENSE_SUSPENDED`: The license has been manually disabled due to billing issues or policy violations.
- `LICENSE_NOT_FOUND`: The provided key does not exist in the central registry.

## Caching Rules

- **Success Cache**: 15–30 minutes lifecycle.
- **Failure Cache**: Maximum 5 minutes (allows for quick retry after payment).
- **Clear on Logout**: Always purge license cache when a user ends their session.

## System Lock Flow (Critical)

When a license is revoked:

1. Clear all session tokens for that company.
2. Present a read-only dashboard if applicable, or a full-screen lock.
3. Allow access _only_ to settings/billing areas.

## Failure UX Guidelines

- **No Technical Errors**: Do not show raw JSON or stack traces.
- **Professionalism**: Use neutral, professional language (e.g., "Account Verification Required").
- **Action Oriented**: Always give the user a path forward (e.g., "Contact Support" or "Update Billing").

## Critical Security Rules

- **No Frontend Validation**: Never trust a boolean flag sent from the browser. Verification must happen server-side.
- **No Permanent Storage**: Do not store the "isValid" flag permanently in your local DB settings. Re-verify frequently.
- **Always External**: The central server is the only source of truth.
- **Log Failures**: All verification failures must be logged for audit and security monitoring.
