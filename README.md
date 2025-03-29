# NgxFloating

一个轻量级的 Angular 浮动组件库，用于创建可移动、可定位的浮动元素。

## 特性

- 🚀 轻量级，无外部依赖
- 📦 支持组件、指令和服务三种使用方式
- 🎯 灵活的位置控制和边界约束
- 🖱️ 可选的拖拽移动功能
- 🔄 自动边界检测和位置更新
- 🎨 支持自定义样式和内容渲染

## 安装

```bash
npm install ngx-floating
```

## 使用方法

### 1. 导入模块

```typescript
import { NgxFloatingComponent, NgxFloatingDirective } from 'ngx-floating';

@Component({
  // ...
  imports: [NgxFloatingComponent, NgxFloatingDirective],
})
```

### 2. 组件用法

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

### 3. 指令用法

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

### 4. 服务用法

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

  // 控制浮动组件
  toggleVisibility() {
    this.floatingService.show('floating-id'); // 显示
    this.floatingService.hide('floating-id'); // 隐藏
  }

  cleanup() {
    this.floatingService.destroy('floating-id'); // 销毁
  }
}
```

## API

### NgxFloatingComponent/Directive

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| at | HTMLElement | - | 目标元素，浮动组件将相对于该元素定位 |
| movable | boolean | false | 是否可拖拽移动 |
| offset | FloatingOffset | { top: 0 } | 位置偏移配置 |
| boundary | HTMLElement \| Boundary | document.documentElement | 边界元素，限制浮动组件的移动范围 |
| ignoreBoundary | boolean | false | 是否忽略边界限制 |
| zIndex | number | 2 | 浮动层级 |
| isVisible | boolean | true | 是否可见 |
| content | TemplateRef<any> \| Type<any> \| string | - | 内容（仅服务方式可用） |

#### FloatingOffset 类型

```typescript
interface FloatingOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  inner?: boolean; // 是否相对于目标元素内部定位
}
```

### NgxFloatingService

| 方法 | 参数 | 说明 |
|------|------|------|
| create | (id: string, options: NgxFloatingServiceOptions) | 创建浮动组件 |
| destroy | (id: string) | 销毁指定的浮动组件 |
| show | (id: string) | 显示浮动组件 |
| hide | (id: string) | 隐藏浮动组件 |
| reset | (id: string) | 重置浮动组件位置 |
| get | (id: string) | 获取浮动组件实例 |

## 开发

1. 克隆仓库
```bash
git clone https://github.com/wh131462/ngx-floating.git
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

4. 构建库
```bash
npm run build
```

## 示例

访问 [在线示例](https://wh131462.github.io/ngx-floating) 查看更多使用示例。

## 许可证

MIT
