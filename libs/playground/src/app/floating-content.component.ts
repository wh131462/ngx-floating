import { Component } from '@angular/core';

@Component({
  selector: 'app-floating-content',
  standalone: true,
  template: `
    <div class="box custom-component">
      <h4>组件式浮动内容</h4>
      <p>这是一个独立的Angular组件</p>
      <p>可以在多处复用这个组件作为浮动内容</p>
    </div>
  `,
  styles: [`
    .custom-component {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h4 {
      margin: 0 0 10px;
      font-size: 16px;
    }
    p {
      margin: 5px 0;
      font-size: 14px;
    }
  `]
})
export class FloatingContentComponent {}