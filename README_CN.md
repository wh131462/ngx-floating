<div align="center">
  <h1>NGX-FLOATING</h1>
  <p>轻量强大的 Angular 浮动 UI 解决方案，支持灵活定位和拖拽功能。</p>
  <p align="center">
   <span>中文文档</span> <span> | </span> <a href="README.md">English</a>
  </p>
  
  <p align="center">
    <a href="https://www.npmjs.com/package/ngx-floating">
      <img src="https://img.shields.io/npm/v/ngx-floating.svg" alt="npm 版本">
    </a>
    <a href="https://www.npmjs.com/package/ngx-floating">
      <img src="https://img.shields.io/npm/dm/ngx-floating.svg" alt="npm 下载量">
    </a>
    <a href="https://github.com/wh131462/ngx-floating/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/ngx-floating.svg" alt="许可证">
    </a>
  </p>
</div>

---

## ✨ 特性

- 🚀 **轻量级** - 无外部依赖  
- 📦 **多种使用模式** - 组件、指令或服务  
- 🎯 **灵活定位** - 动态对齐与边界约束  
- 🖱️ **拖拽支持** - 可选移动功能  
- 🔄 **自动边界检测** - 容器内智能重定位  
- 🎨 **自定义样式** - 完全控制外观与内容  

---

## 🛠 安装

```bash
npm install ngx-floating
```

---

## 🚀 使用方法

### 1. 导入模块

```typescript
import { NgxFloatingComponent, NgxFloatingDirective } from 'ngx-floating';

@Component({
  // ...
  imports: [NgxFloatingComponent, NgxFloatingDirective],
})
```

### 2. 组件模式

```html
<div #target>
  <ngx-floating 
    [at]="target" 
    [movable]="true" 
    [offset]="{ right: 10, bottom: 10, inner: true }" 
    [boundary]="target">
    <div>浮动内容</div>
  </ngx-floating>
</div>
```

### 3. 指令模式

```html
<div #target>
  <div [ngxFloating]="true" 
       [movable]="true" 
       [at]="target" 
       [offset]="{ top: 0, right: 0 }">
    浮动内容
  </div>
</div>
```

### 4. 服务模式

```typescript
import { NgxFloatingService } from 'ngx-floating';

export class YourComponent {
  constructor(private floatingService: NgxFloatingService) {}

  createFloating() {
    this.floatingService.create('floating-id', {
      at: targetElement,
      movable: true,
      offset: { top: 0, right: 0 },
      content: '浮动内容' // 支持字符串、模板引用或组件
    });
  }

  toggleVisibility() {
    this.floatingService.show('floating-id'); // 显示
    this.floatingService.hide('floating-id'); // 隐藏
  }

  cleanup() {
    this.floatingService.destroy('floating-id'); // 销毁
  }
}
```

---

## 📚 API 参考

### `NgxFloatingComponent` / `NgxFloatingDirective`

| 属性           | 类型                          | 默认值                  | 说明                                                                 |
|----------------|-------------------------------|-------------------------|---------------------------------------------------------------------|
| `at`           | `HTMLElement`                 | 必填                    | 定位目标元素                                                        |
| `movable`      | `boolean`                     | `false`                 | 启用拖拽功能                                                        |
| `offset`       | `FloatingOffset`              | `{ top: 0 }`            | 定位偏移量                                                          |
| `boundary`     | `HTMLElement` \| `Boundary`   | `documentElement`       | 限制移动范围的边界元素                                              |
| `ignoreBoundary`| `boolean`                     | `false`                 | 忽略边界限制                                                        |
| `zIndex`       | `number`                      | `2`                     | 浮动元素的层级                                                      |
| `isVisible`    | `boolean`                     | `true`                  | 控制可见性                                                          |
| `content`      | `TemplateRef` \| `Type` \| `string` | -                     | 内容（仅服务模式可用）                                              |

#### `FloatingOffset` 接口

```typescript
interface FloatingOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  inner?: boolean; // 是否相对于目标元素内部定位
}
```

### `NgxFloatingService` 方法

| 方法        | 参数                           | 说明                     |
|------------|--------------------------------|--------------------------|
| `create`   | `(id: string, options: NgxFloatingServiceOptions)` | 创建浮动实例   |
| `destroy`  | `(id: string)`                 | 销毁浮动实例             |
| `show`     | `(id: string)`                 | 显示浮动元素             |
| `hide`     | `(id: string)`                 | 隐藏浮动元素             |
| `reset`    | `(id: string)`                 | 重置位置到初始状态       |
| `get`      | `(id: string)`                 | 根据 ID 获取浮动实例     |

---

## 🛠 开发指南

1. 克隆仓库：
```bash
git clone https://github.com/wh131462/ngx-floating.git
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

4. 构建库：
```bash
npm run build
```

---

## 🌐 在线示例

访问 [示例页面](https://wh131462.github.io/ngx-floating) 查看交互式演示。

---

## 📜 许可证

MIT © 2023 [Eternal Heart](https://github.com/wh131462)
