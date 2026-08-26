# Cashflow Angular Project Instructions

## 1. Project Role

This repository contains the Cashflow frontend application.

The application is an Angular application using:

- Angular
- TypeScript
- RxJS
- NgRx
- Facade Pattern
- Angular Signals
- SCSS

All code generated, modified, or reviewed for this project must follow the architecture and coding standards defined in this file.

These rules are mandatory unless the developer explicitly asks to override a specific rule.

---

# 2. General Development Principles

Follow these principles:

1. Prefer simple and maintainable solutions.
2. Follow the existing project architecture before introducing new patterns.
3. Do not introduce unnecessary abstractions.
4. Do not duplicate business logic.
5. Keep responsibilities separated.
6. Prefer strongly typed code.
7. Avoid unnecessary state.
8. Avoid unnecessary subscriptions.
9. Prevent memory leaks.
10. Prefer Signals for application/UI state.
11. Use RxJS where asynchronous streams and reactive workflows are appropriate.
12. Use NgRx where application state belongs in the global state layer.
13. Use Facades as the UI boundary for NgRx.
14. Keep components small.
15. Keep shared SCSS design values centralized.
16. Do not rewrite working code without a meaningful reason.
17. Explain architectural decisions when introducing significant changes.

---

# 3. Angular Architecture

The application should follow a clear separation of responsibilities.

Preferred architecture:

Component
    ↓
Facade
    ↓
NgRx / Services
    ↓
Effects / API
    ↓
Backend

For reading application state:

Store
    ↓
Selectors
    ↓
Facade
    ↓
Signals
    ↓
Component
    ↓
Template

Components should primarily handle:

- UI state
- User interaction
- Template bindings
- Calling Facade methods
- Small UI-specific logic

Components should NOT contain:

- API calls
- Complex business logic
- Direct NgRx Store interaction
- Complex RxJS workflows
- Authentication/token-refresh logic
- Large data transformations
- Large reusable validation systems
- Global application state management

Move appropriate logic into:

- Facades
- Services
- Effects
- Selectors
- Utility functions
- Models
- Constants
- Child components

---

# 4. Facade Pattern - Mandatory

The application uses the Facade Pattern for NgRx interaction.

This rule is mandatory.

Components must not directly interact with the NgRx Store.

Do NOT inject Store directly into a component.

Do NOT use these directly inside components:

```ts
store.dispatch(...)
store.select(...)
store.selectSignal(...)
store.pipe(...)