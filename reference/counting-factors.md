# Counting Factors (Total / Odd / Even)

## 1. General framework

Let

```
N = 2^a × p₁^b₁ × p₂^b₂ × ... × pₖ^bₖ
```

where p₁, p₂, …, pₖ are **odd primes**.

**(a) Total number of factors**
```
Total factors = (a+1)(b₁+1)(b₂+1)...(bₖ+1)
```

**(b) Odd factors** — set the exponent of 2 to 0 (odd numbers contain no factor of 2):
```
Odd factors = (b₁+1)(b₂+1)...(bₖ+1)
```

**(c) Even factors** — all factors that include at least one 2 → total minus odd:
```
Even factors = (a+1)(b₁+1)...(bₖ+1) − (b₁+1)...(bₖ+1)
             = a × (b₁+1)(b₂+1)...(bₖ+1)
```

---

## 2. Examples

| Number | Prime Form | Total Factors | Odd Factors | Even Factors |
|--------|------------|----------------|-------------|--------------|
| 18  | 2¹ × 3²         | (1+1)(2+1)=6            | (2+1)=3           | 1×(2+1)=3            |
| 48  | 2⁴ × 3¹         | (4+1)(1+1)=10           | (1+1)=2            | 4×(1+1)=8             |
| 120 | 2³ × 3¹ × 5¹    | (3+1)(1+1)(1+1)=16      | (1+1)(1+1)=4       | 3×(1+1)(1+1)=12       |
| 45  | 3² × 5¹         | (2+1)(1+1)=6            | same (no 2) = 6    | 0                     |

---

## 3. Intuitive summary

- **Odd factors** = drop the "2 part."
- **Even factors** = whatever's left.
- Each additional power of 2 multiplies the even count.
