# Divisibility Rules

Quick tests for whether N is divisible by d — no long division needed.

| Divisor | Rule | Example |
|---------|------|---------|
| **2**  | Last digit is even (0, 2, 4, 6, 8). | 4,318 → last digit 8 → divisible. |
| **3**  | Digit sum is divisible by 3. | 4,317 → 4+3+1+7=15 → divisible. |
| **4**  | Last two digits form a number divisible by 4. | 5,332 → 32 ÷ 4 = 8 → divisible. |
| **5**  | Last digit is 0 or 5. | 4,315 → divisible. |
| **6**  | Divisible by both 2 and 3. | 4,320 → even, digit sum 9 → divisible. |
| **7**  | Double the last digit, subtract it from the rest; repeat until small enough to check. | 483 → 48 − (3×2)=42 → 42 ÷ 7 = 6 → divisible. |
| **8**  | Last three digits form a number divisible by 8. | 5,432 → 432 ÷ 8 = 54 → divisible. |
| **9**  | Digit sum is divisible by 9. | 4,317 → 4+3+1+7=15 → not (15 isn't div by 9). |
| **10** | Last digit is 0. | 4,310 → divisible. |
| **11** | Alternating digit sum (right to left) is divisible by 11 (0 counts). | 9,163 → 3−6+1−9 = −11 → divisible. |
| **12** | Divisible by both 3 and 4. | 5,436 → digit sum 18 (÷3 ✓), last two 36 ÷ 4 = 9 (✓) → divisible. |
| **13** | Multiply the last digit by 4, add to the rest; repeat until small enough to check. | 351 → 35 + (1×4) = 39 → 39 ÷ 13 = 3 → divisible. |
| **14** | Divisible by both 2 and 7. | 490 → even, and 49 ÷ 7 = 7 → divisible. |
| **15** | Divisible by both 3 and 5. | 4,215 → digit sum 12 (÷3 ✓), ends in 5 (✓) → divisible. |

---

**Tip:** for 7 and 13, if the "repeat" step still leaves a number too big to eyeball, apply the same rule again — it converges fast.
