# RetroKit Code of Conduct & Contributor Guidelines

We want RetroKit to be a welcoming, high-craft, and enjoyable open-source project to build, maintain, and contribute to. Whether you're adding new emulation cores, improving audio synchronization, fixing timing bugs, or refining documentation, we appreciate your work.

---

## 1. Community Pledge

We are committed to providing a friendly, safe, and welcoming environment for everyone, regardless of background, identity, or experience level.

- **Be respectful and constructive**: Give and receive feedback with empathy and curiosity.
- **Focus on what is best for the project**: We value clean architecture, reliability, and great developer experience.
- **Collaborate openly**: Discuss non-trivial architectural changes in issues or pull requests before spending days on massive rewrites.

---

## 2. Architecture & Design Principles

When contributing code to RetroKit, follow these core architectural rules:

### A. Headless-First (Zero DOM Couplings)
RetroKit is designed to power any frontend—custom web apps, React/Vue/Svelte UIs, Jellyfin plugins, Electron, or Tauri.
- The core runtime (`src/`) must never depend on specific DOM structures, CSS classes, or UI frameworks.
- The only DOM elements the engine touches are the target `HTMLCanvasElement` (for rendering frames) and user input events injected into virtual player channels.

### B. Capability-Driven Virtual Bridge
Do not write fragile `if (core === 'snes9x')` or `if (core === 'play')` branching in general engine code.
- Cores declare their supported features through `CoreCapabilities` (`saveStates`, `sram`, `cheats`, `multiDisc`, etc.).
- When a core does not support a feature, the engine must degrade gracefully with safe no-op fallbacks instead of throwing unhandled exceptions.

### C. Clean Resource Lifecycle Management
WebAssembly runtimes, Web Audio contexts, and WebGL buffers consume significant memory.
- Every subsystem must implement clean lifecycle hooks (`stop()`, `destroy()`, `clear()`).
- When `stop()` is called, battery SRAM must be flushed and the canvas cleared.
- When `destroy()` is called, all WASM modules, audio contexts, resize observers, and event listeners must be completely freed for garbage collection.

---

## 3. Code Comments & Documentation Standards

Code comments should read like they were written by a human engineer communicating directly with other engineers:

- **No Robotic Numbered Lists**: Do not write comments in numbered list format (e.g. avoid `// 1. do this`, `// 2. do that`, `// 3. do next`). Write conversational, explanatory prose instead.
- **Explain the *Why*, Not Just the *What***: Avoid repeating what the syntax already says (e.g., avoid `// sets speed` above `this.speed = speed;`). Instead, explain non-obvious reasoning, hardware quirks, or browser workarounds (e.g., explaining why a 16-byte iNES header or 512-byte SMC copier header must be stripped so ROM hashes match RetroAchievements).
- **No Boilerplate Fluff**: Keep comments concise, direct, and pragmatic.
- **Document Emscripten & WASM Quirks**: When working with virtual filesystem paths (`/home/web_user/...`), memory pointers, or audio ring buffers, leave a short note explaining the underlying core contract.

---

## 4. Tooling & Code Style (Biome JS)

We use **Biome JS** for fast, consistent formatting and linting:

- **Format before committing**: Run `npm run format` (formats with 2 spaces, single quotes, trailing semicolons).
- **Check for lint issues**: Run `npm run lint` (`biome check .`).
- **Verify TypeScript compilation**: Run `npm run typecheck` (`tsc --noEmit`) and `npm run build`.

All pull requests must pass `npm run lint` and `npm run build` without errors.

---

## 5. Commit Messages

When committing changes, write natural, first-person commit messages that explain what you did and why in plain English:

- **Good**: `"I added IPS patch verification and fixed the save state slot indexing"`
- **Good**: `"I resolved CORS and Cloudflare blocks on RetroAchievements API requests"`
- **Good**: `"I implemented auto-upscaling for canvas layout under resize events"`
- **Avoid**: Vague, robotic, or generic messages like `"update files"` or `"fix stuff"`.

---

## 6. Maintainer Responsibilities & PR Reviews

Maintainers are responsible for reviewing pull requests fairly, keeping dependencies up to date, and helping contributors align their work with the project's architectural standards. If you encounter any issues or questions, open an issue or reach out to the project maintainers.
