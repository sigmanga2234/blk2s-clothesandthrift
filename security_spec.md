# Firestore Security Specification

This document details the security model, access control policies, and threat models for the BLK2S Thrift Store inventory catalog.

## 1. Data Invariants

1. **Read-All Access**: The catalog (products and reviews) must be readable by any visitor (unauthenticated strangers) to allow them to browse and review items.
2. **Curator-Write Only**: Only authenticated curators (Google Sign-In) can create, edit, or delete catalog items.
3. **Public Review Submissions**: Visitors can submit/append reviews to products. This means updating *only* the nested `reviews` array field is permitted for unauthenticated clients, while modifying administrative fields (e.g., `price`, `title`, `condition`) is blocked.
4. **ID Uniformity**: Document IDs for products must match their inner `id` fields.
5. **No System Overwrites**: Curators can modify catalog properties but cannot inject garbage fields.

---

## 2. The "Dirty Dozen" Threat Payloads (Blocked)

These payloads represents potential attacks that must be blocked by the security rules:

1. **Anonymous Product Creation**: Unauthenticated user attempting to insert a new product document.
2. **Stranger Price Tampering**: Unauthenticated user trying to modify the price of a vintage leather jacket.
3. **Stranger Deletion**: Unauthenticated user trying to delete a catalog item.
4. **Invalid Product Id**: Curator attempting to insert a product with an excessively long or invalid ID.
5. **Missing Fields**: Curator trying to add a product without a `title` or `price`.
6. **Negative Price**: Curator attempting to set a product price to a negative value.
7. **Invalid Condition Type**: Curator attempting to set a condition other than 'Mint', 'Excellent', 'Gently Used', or 'Distressed'.
8. **Malicious Review Injection**: Visitor trying to replace other fields of a product (like price) under the guise of submitting a review.
9. **Curator Self-Demotion**: Modification of user profile fields or unauthorized administrative roles (if applicable).
10. **Shadow Key Update**: Injecting unmapped/garbage properties to exhaust storage or break layout structures.
11. **Excessive String Lengths**: Writing titles or descriptions that exceed the blueprint boundaries (e.g. title size > 100).
12. **Malicious Array Expansion**: Replacing the entire reviews array with empty or bloated records.

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

A test runner would assert:
- `get` / `list` on `/products` returns success for unauthenticated visitors.
- `create` on `/products` returns `PERMISSION_DENIED` for unauthenticated visitors.
- `update` modifying *only* `reviews` on `/products/{productId}` returns success for unauthenticated visitors.
- `update` modifying `price` on `/products/{productId}` returns `PERMISSION_DENIED` for unauthenticated visitors.
- `update` modifying `price` returns success for authenticated administrators.
