# Coprime Divisibility Rule

Let n be any integer (the number you're testing). Let p and q be coprime integers (their gcd = 1).

**Rule:** if n is divisible by both p and q, then n is divisible by (p × q).
```
(p divides n) and (q divides n) ⇒ (p×q divides n)
```

**Reverse also true:** if (p×q) divides n, then both p divides n and q divides n.

---

## ✅ Coprime example (works)

n = 532, p = 2, q = 7
gcd(2,7) = 1 → coprime

- 532 is even → divisible by 2
- For 7: 53 − (2×2) = 49 → divisible by 7

Therefore 14 (=2×7) divides 532.

---

## ❌ Non-coprime example (fails)

n = 12, p = 2, q = 4
gcd(2,4) = 2 → **not** coprime

- 12 is divisible by 2 → yes
- 12 is divisible by 4 → yes
- But 2×4 = 8, and 12 ÷ 8 = 1.5 → **not** divisible

So the rule fails when p and q share factors.

---

## 1-line takeaway

For coprime factors, divisibility by each ⇒ divisibility by their product. For non-coprime factors, this fails.
