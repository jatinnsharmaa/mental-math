# Cyclicity (Last Digit Patterns)

The unit digit of Nᵏ repeats in a fixed cycle based on N's own last digit. To find the unit digit of N^k: take k mod (cycle length) — using the cycle length itself instead of 0 — and look up that position.

| Base | Cycle Length | Pattern (n¹, n², n³, …) |
|------|--------------|--------------------------|
| **2** | 4 | 2, 4, 8, 6 |
| **3** | 4 | 3, 9, 7, 1 |
| **4** | 2 | 4, 6 |
| **5** | 1 | 5 |
| **6** | 1 | 6 |
| **7** | 4 | 7, 9, 3, 1 |
| **8** | 4 | 8, 4, 2, 6 |
| **9** | 2 | 9, 1 |

---

**Example:** unit digit of 7²³? Cycle length 4, 23 mod 4 = 3 → 3rd position in {7, 9, 3, 1} → **3**.

**Notable:** bases 5 and 6 are fixed points — any power ends in 5 or 6 respectively.
