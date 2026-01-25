# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - heading "BlockLogic" [level=1] [ref=e4]
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: "Score:"
        - generic [ref=e8]: "30"
      - generic [ref=e9]:
        - generic [ref=e10]: "High Score:"
        - generic [ref=e11]: "30"
  - main [ref=e12]:
    - button "Restart Game" [ref=e15] [cursor=pointer]
    - complementary [ref=e16]:
      - heading "Leaderboard" [level=2] [ref=e17]
      - list [ref=e18]:
        - listitem [ref=e19]:
          - generic [ref=e20]: "#1"
          - generic [ref=e21]: TestPlayer
          - generic [ref=e22]: "999"
        - listitem [ref=e23]:
          - generic [ref=e24]: "#2"
          - generic [ref=e25]: E2ETest
          - generic [ref=e26]: "500"
        - listitem [ref=e27]:
          - generic [ref=e28]: "#3"
          - generic [ref=e29]: E2ETest
          - generic [ref=e30]: "500"
      - button "Refresh" [ref=e31] [cursor=pointer]
```