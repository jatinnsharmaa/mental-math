# Linear Equations

ax + by = c (highest power of the variables is 1).

For two simultaneous equations in x and y:

```
a₁x + b₁y = c₁
a₂x + b₂y = c₂
```

**Two ways to solve:**
1. **Substitution** — take x from equation (1), plug it into equation (2) to get y.
2. **Elimination** — multiply both equations by different constants so a coefficient matches, then add/subtract to cancel x and isolate y.

Either way, once you have y, plug it back into either original equation to get x.

---

## Classifying a pair of equations

**Unique solution** — lines cross once.
```
\       /
 \     /
  \   /
   \ /
    •
   / \
  /   \
 /     \
```

**No solution** — lines are parallel, same slope, never meet.
```
\           \
 \           \
  \           \
   \           \
    \           \
```

**Infinite solutions** — same line; one equation is just a multiple of the other.
```
↖
  \
    \
      \
        \
          \
            ↘
```

| Examples | Condition | Type of solution |
|----------|-----------|-------------------|
| 2x + 3y = 12 <br> x + y = 5 | a₁/a₂ ≠ b₁/b₂ | **Unique solution** |
| 2x + 3y = 12 <br> 6x + 9y = 20 | a₁/a₂ = b₁/b₂ ≠ c₁/c₂ | **No solution** |
| 2x + 3y = 12 <br> 4x + 6y = 24 | a₁/a₂ = b₁/b₂ = c₁/c₂ | **Infinite solutions** |

---

**Tip:** check the ratio test before solving anything — it tells you upfront whether to expect one answer, no answer, or every point on the line as an answer.
