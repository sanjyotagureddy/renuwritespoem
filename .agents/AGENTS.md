# Agent Context & Behavior Guidelines: renuwritespoem

This document guides AI coding assistants working on the `renuwritespoem` workspace. It establishes domain context, architecture rules, design constraints, and testing standards.

---

## 1. Domain Context & Repository Knowledge
* **The Poet (Renu)**: The site owner and author is Renu, a poet who writes creative poetry, books, and releases audio poems.
* **Target Website**: "Renu Writes Poem" is a personal portal showcasing poetry, audio recordings, published books, and creative updates. Readers can buy books, subscribe to newsletters, write comments, and like posts.
* **Language and Moderation Support**:
  * The site natively supports Marathi, Hindi, and English poem contents, language tags (`mr`, `hi`, `en`), proper font mappings, and translation options.
  * Content moderation is enforced dynamically via `contact-guard.ts` (checks for abusive words, threats, screaming/all-caps posts, spam patterns).

---

## 2. Design Principles & Architecture Good Practices
* **Sleek, Premium Dark Aesthetics**: Maintain the modern, glassmorphic layout, using custom HSL/Tailwood variables, harmonious gradients, dynamic hover transitions, micro-animations, and responsive layouts.
* **Reusable UI Components**: Prevent code duplication. Extract common UI structures (e.g. password validation blocks, input groups) into clean, shared client components (`src/components/...`) rather than repeating code in individual templates or routes.
* **Strict Security & Privacy Controls**:
  * **No Information Leakage**: Actions handling sign-up verification resends (`resendVerificationAction`) and password resets (`forgotPasswordAction`) must return generic success statuses (`{ success: true }`) quietly to protect user account enumeration.
  * **Rate Limiting**: All public/write actions (sign-ups, credential log-in attempts, comment submissions, contact messages, recovery request sends) must call `rateLimit()` on client IP with a Redis pipeline/memory fallback.

---

## 3. Mandatory Testing & Code Coverage Rules
* **Vitest Location**: All automated tests must reside within the root [`test/`](file:///e:/Projects/renuwritespoem/test) directory.
* **React/DOM Environment**: Front-end component testing is configured using `jsdom` and `@vitejs/plugin-react` inside [`vitest.config.ts`](file:///e:/Projects/renuwritespoem/vitest.config.ts).
* **Test Requirements**: Every new action, feature, helper utility, or core UI component introduced to the repository must have corresponding unit or integration test cases added to the test suite.
* **Coverage Target**: Total application logic coverage must remain strictly **above 80%** (Statements, Lines, Branches, and Functions). Always run test coverage to verify status before declaring a feature complete:
  ```bash
  npm run test -- --coverage
  ```
