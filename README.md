<div align="center">
  <h1>NGX-FLOATING</h1>
  <p>A lightweight and powerful Angular floating UI solution with flexible positioning and draggable support.</p>
  <p align="center">
    <a href="README_CN.md">中文文档</a><span> | </span><span>English</span>
  </p>
  
  <p align="center">
    <a href="https://www.npmjs.com/package/ngx-floating">
      <img src="https://img.shields.io/npm/v/ngx-floating.svg" alt="npm version">
    </a>
    <a href="https://www.npmjs.com/package/ngx-floating">
      <img src="https://img.shields.io/npm/dm/ngx-floating.svg" alt="npm downloads">
    </a>
    <a href="https://github.com/your-username/ngx-floating/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/ngx-floating.svg" alt="license">
    </a>
  </p>
</div>

---

## ✨ Features

- 🚀 **Lightweight** – No external dependencies  
- 📦 **Multiple Usage Modes** – Component, Directive, or Service  
- 🎯 **Flexible Positioning** – Dynamic alignment with boundary constraints  
- 🖱️ **Drag & Drop Support** – Optional movable functionality  
- 🔄 **Auto Boundary Detection** – Smart repositioning within containers  
- 🎨 **Customizable Styling** – Full control over appearance and content  

---

## 🛠 Installation

```bash
npm install ngx-floating
```

---

## 🚀 Usage

### 1. Import the Module

```typescript
import { NgxFloatingComponent, NgxFloatingDirective } from 'ngx-floating';

@Component({
  // ...
  imports: [NgxFloatingComponent, NgxFloatingDirective],
})
```

### 2. Component Mode

```html
<div #target>
  <ngx-floating 
    [at]="target" 
    [movable]="true" 
    [offset]="{ right: 10, bottom: 10, inner: true }" 
    [boundary]="target">
    <div>Floating Content</div>
  </ngx-floating>
</div>
```

### 3. Directive Mode

```html
<div #target>
  <div [ngxFloating]="true" 
       [movable]="true" 
       [at]="target" 
       [offset]="{ top: 0, right: 0 }">
    Floating Content
  </div>
</div>
```

### 4. Service Mode

```typescript
import { NgxFloatingService } from 'ngx-floating';

export class YourComponent {
  constructor(private floatingService: NgxFloatingService) {}

  createFloating() {
    this.floatingService.create('floating-id', {
      at: targetElement,
      movable: true,
      offset: { top: 0, right: 0 },
      content: 'Floating Content' // Supports string, template ref, or component
    });
  }

  toggleVisibility() {
    this.floatingService.show('floating-id'); // Show
    this.floatingService.hide('floating-id'); // Hide
  }

  cleanup() {
    this.floatingService.destroy('floating-id'); // Destroy
  }
}
```

---

## 📚 API Reference

### `NgxFloatingComponent` / `NgxFloatingDirective`

| Property         | Type                          | Default                  | Description                                                                 |
|------------------|-------------------------------|--------------------------|-----------------------------------------------------------------------------|
| `at`             | `HTMLElement`                 | Required                 | Target element for positioning                                              |
| `movable`        | `boolean`                     | `false`                  | Enable drag-and-drop functionality                                         |
| `offset`         | `FloatingOffset`              | `{ top: 0 }`             | Positioning offsets                                                        |
| `boundary`       | `HTMLElement` \| `Boundary`   | `documentElement`        | Boundary element to constrain movement                                      |
| `ignoreBoundary` | `boolean`                     | `false`                  | Disable boundary constraints                                               |
| `zIndex`         | `number`                      | `2`                      | Z-index of the floating element                                            |
| `isVisible`      | `boolean`                     | `true`                   | Control visibility                                                         |
| `content`        | `TemplateRef` \| `Type` \| `string` | -                        | Content (Service mode only)                                                |

#### `FloatingOffset` Interface

```typescript
interface FloatingOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  inner?: boolean; // Position relative to the inner area of the target
}
```

### `NgxFloatingService` Methods

| Method     | Parameters                      | Description                              |
|------------|---------------------------------|------------------------------------------|
| `create`   | `(id: string, options: NgxFloatingServiceOptions)` | Create a floating instance               |
| `destroy`  | `(id: string)`                  | Destroy a floating instance              |
| `show`     | `(id: string)`                  | Show the floating element                |
| `hide`     | `(id: string)`                  | Hide the floating element                |
| `reset`    | `(id: string)`                  | Reset position to initial state          |
| `get`      | `(id: string)`                  | Retrieve a floating instance by ID       |

---

## 🛠 Development

1. Clone the repository:
```bash
git clone https://github.com/wh131462/ngx-floating.git
```

2. Install dependencies:
```bash
npm install
```

3. Start the dev server:
```bash
npm start
```

4. Build the library:
```bash
npm run build
```

---

## 🌐 Live Demo

Explore interactive examples at the [Demo Page](https://wh131462.github.io/ngx-floating).

---

## 📜 License

MIT © 2025 [Eternal Heart](https://github.com/wh131462)
