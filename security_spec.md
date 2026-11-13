# Security Specification — Prime System Group

## 1. Data Invariants
1. **Product Integrity**: Every document in `/products/{productId}` must pass `isValidProduct`, enforce strict key allowlists (`hasAll` + `hasOnly`), enforce non-negative pricing, bounded arrays (`<= 10`), and only be created, updated, or deleted by a verified Administrator.
2. **Order & Invoice Ownership**: Every document in `/orders/{orderId}` must be created by a verified authenticated user (`request.auth.token.email_verified == true`) with `userId == request.auth.uid`, initial `status == 'Confirmed'`, server timestamps (`createdAt == request.time`, `updatedAt == request.time`), and valid `PSG-YYYY-NNNN` invoice format.
3. **Order Line-Item Relational Sync (Master Gate)**: Every document in `/orders/{orderId}/items/{itemId}` requires the parent `/orders/{orderId}` document to exist (or `existsAfter` in the atomic batch) and belong to `request.auth.uid`.
4. **Terminal State Locking**: Once an order reaches `'Completed'` or `'Cancelled'`, non-admins cannot alter it; in fact only Admins can transition order statuses via `affectedKeys().hasOnly(['status', 'updatedAt'])`.
5. **PII Isolation**: Customer emails, phone numbers, and shipping addresses in `/orders`, `/inquiries`, and `/users` are strictly unreadable by other customers (`resource.data.userId == request.auth.uid || isAdmin()`).
6. **Privilege Escalation Prevention**: Users cannot write to `/admins/{userId}` unless already an authorized Admin. Unverified emails are always denied writes on customer collections.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Product Creation**: `create /products/p1` without auth -> `PERMISSION_DENIED`.
2. **Non-Admin Product Price Tampering**: `update /products/p1` with `{ priceUsd: 0.01 }` by regular user -> `PERMISSION_DENIED`.
3. **Shadow Field Injection on Order**: `create /orders/o1` including extra field `isAdminApproved: true` -> `PERMISSION_DENIED`.
4. **Identity Spoofing on Order**: `create /orders/o1` with `userId: "other_uid"` -> `PERMISSION_DENIED`.
5. **Status Shortcutting on Order**: `create /orders/o1` with `status: "Completed"` -> `PERMISSION_DENIED`.
6. **Client Timestamp Forgery**: `create /orders/o1` with client-supplied past `createdAt` -> `PERMISSION_DENIED`.
7. **ID Poisoning (1.5KB Document ID)**: `create /orders/<1500_char_id>` -> `PERMISSION_DENIED`.
8. **Invalid Characters in ID**: `create /orders/order$bad` -> `PERMISSION_DENIED`.
9. **Blanket Order List Scraping**: `list /orders` by regular user without `userId == request.auth.uid` filter -> `PERMISSION_DENIED`.
10. **PII Cross-User Read**: `get /users/victim_uid` by another signed-in user -> `PERMISSION_DENIED`.
11. **Self-Assigned Admin Escalation**: `create /admins/attacker_uid` by non-admin -> `PERMISSION_DENIED`.
12. **Unverified Email Spoofing**: `create /orders/o1` with `email_verified: false` -> `PERMISSION_DENIED`.
