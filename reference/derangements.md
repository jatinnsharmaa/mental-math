# Derangements

You rarely need to calculate Derangements (D) manually. Memorize these values:

| Remaining Items (Wrong) | Symbol | Ways (D) | Logic |
|--------------------------|--------|----------|-------|
| 0 Items | D₀ | 1 | Special case — the empty arrangement counts as one (vacuously) deranged way. |
| 1 Item | D₁ | 0 | Impossible to have just 1 wrong — if only 1 item is left and the other n-1 are already correctly placed, that last item has nowhere else to go but its own spot. |
| 2 Items | D₂ | 1 | Swap them (A-B becomes B-A). |
| 3 Items | D₃ | 2 | Cycle them (ABC becomes BCA, CAB). |
| 4 Items | D₄ | 9 | Memorize this. |
| 5 Items | D₅ | 44 | Memorize this (rare but useful). |
