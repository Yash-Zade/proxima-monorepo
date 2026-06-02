# Oat Milk Editorial Design System

A modern, high-aesthetic style guideline curated for Proxima's frontend components. Designed around warm soft creams, organic sage greens, toast terracottas, and deep espresso typography.

## Typography System

- **Display / Heading Stack**:
  ```css
  font-family: 'Playfair Display', Georgia, serif;
  letter-spacing: -0.02em;
  ```
  *Brings an editorial, high-end, publication-like literary feel to titles.*

- **Body / Interface Stack**:
  ```css
  font-family: 'Instrument Sans', -apple-system, sans-serif;
  ```
  *Provides exceptionally crisp readability for listings, charts, and input forms.*

---

## Palette Vectors

| Layer | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Base** | `#FDFBF7` | Warm Oat Milk Background |
| **Primary Text** | `#241E1A` | Deep Warm Espresso |
| **Secondary Accent** | `#C1CDBC` | Muted Organic Sage Green |
| **Highlight Accent** | `#DFA687` | Soft Terracotta Toast |
| **Card / Canvas** | `#FCF9F3` | Warm Ivory Paper |
| **Border / Sand** | `#E5DAC9` | Soft Desert Sand Border |

---

## Component Guidelines

### 1. Cards
Cards should have very thin borders, generous padding, and subtle shadows.
```html
<div className="bg-[#FCF9F3] border border-[#E5DAC9] p-6 rounded-2xl shadow-sm hover:shadow transition-all duration-300">
  ...
</div>
```

### 2. Buttons
- **Primary**: Solid Espresso with warm cream text.
  ```html
  <button className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors">
    Action
  </button>
  ```
- **Secondary (Sage)**: Soft organic green background.
  ```html
  <button className="bg-[#C1CDBC] hover:bg-[#B0BEAA] text-[#241E1A] font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors">
    Status Action
  </button>
  ```
- **Accent (Terracotta)**: Soft brick highlighting alert cues.
  ```html
  <button className="bg-[#DFA687] hover:bg-[#CE9273] text-[#241E1A] font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors">
    Alert Action
  </button>
  ```

---

## Micro-Interactions
- Smooth bezier curve transitions (`transition-all duration-300`).
- Float cards upwards on hover (`hover:-translate-y-0.5 hover:shadow-md`).
- Circular dashed rings rotating slowly inside hero backgrounds (`animate-spin-slow`).
