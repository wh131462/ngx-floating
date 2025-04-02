import {AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {FloatingContentComponent} from './floating-content.component';
import {NgxFloatingComponent, NgxFloatingDirective, NgxFloatingService, VERSION} from "ngx-floating";
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzCodeEditorModule} from 'ng-zorro-antd/code-editor';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzSliderComponent} from "ng-zorro-antd/slider";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NgxFloatingComponent,
    NgxFloatingDirective,
    NzTabsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzCodeEditorModule,
    FormsModule,
    NzTooltipDirective,
    NzSliderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  version = VERSION;
  @ViewChild('directiveTarget') directiveTarget!: ElementRef;
  @ViewChildren('floating1, floating2, floating3') floatingComponents!: QueryList<NgxFloatingComponent>;
  selectedTabIndex = 0;
  isMovable = true;
  ignoreBoundary = false;
  offset = {top: 10, left: 10, inner: true};
  showCodeMap: { [key: string]: boolean } = {
    basic: false,
    directive: false,
    service: false,
    position: false,
    custom: false,
    linkage: false,
    template: false,
    component: false
  };

  codeMap = {
    // 基础用法：直接在组件内容中使用浮动组件
    basic: `<div class="range" #at1>
  <!-- [at]指定目标元素，[boundary]指定边界，[movable]启用拖拽，[offset]设置位置偏移 -->
  <ngx-floating [at]="at1" [boundary]="at1" [movable]="true" [offset]="{ right: 10, bottom: 10, inner: true}">
    <div class="box">可移动的浮动框</div>
  </ngx-floating>
</div>`,

    // 使用ng-template模板引用方式
    template: `<div class="range" #at2>
  <!-- 定义模板内容 -->
  <ng-template #floatingContent>
    <div class="box">使用ng-template的浮动内容</div>
  </ng-template>
  <!-- 通过[content]属性引用模板 -->
  <ngx-floating [at]="at2" [boundary]="at2" [movable]="true" [content]="floatingContent" [offset]="{ top: 10, left: 10, inner: true }">
  </ngx-floating>
</div>`,

    // 使用组件引用方式
    component: `<div class="range" #at3>
  <!-- 通过[content]属性引用组件类 -->
  <ngx-floating [at]="at3" [boundary]="at3" [movable]="true" [content]="FloatingContentComponent" [offset]="{ bottom: 10, right: 10, inner: true }">
  </ngx-floating>
</div>`,

    // 指令用法：将普通元素转换为浮动元素
    directive: `<div class="range" #directiveTarget>
  <!-- 使用ngxFloating指令，支持动态控制移动和边界约束 -->
  <div class="box" [ngxFloating]="isMovable" [at]="directiveTarget" [offset]="offset" [ignoreBoundary]="ignoreBoundary">
    使用指令的浮动元素
  </div>
  <div class="controls">
    <button nz-button nzType="default" (click)="isMovable = !isMovable">
      {{ isMovable ? '禁用' : '启用' }}移动
    </button>
    <button nz-button nzType="default" (click)="ignoreBoundary = !ignoreBoundary">
      {{ ignoreBoundary ? '启用' : '禁用' }}边界约束
    </button>
  </div>
</div>`,

    // 服务用法：通过服务动态创建和控制浮动组件
    service: `<div class="range" #at2>
  <div class="controls">
    <!-- 使用NgxFloatingService提供的方法控制浮动组件 -->
    <button nz-button nzType="default" (click)="createByService(at2)">创建浮动内容</button>
    <button nz-button nzType="default" (click)="controlServiceFloating('show')">显示</button>
    <button nz-button nzType="default" (click)="controlServiceFloating('hide')">隐藏</button>
    <button nz-button nzType="default" (click)="controlServiceFloating('reset')">重置</button>
    <button nz-button nzType="default" (click)="controlServiceFloating('updatePosition')">更新位置</button>
  </div>
</div>`,

    // 位置控制：展示不同位置的设置方式
    position: `<div class="range" #at3>
  <!-- 通过offset属性的不同组合实现四个角落的定位 -->
  <ngx-floating [at]="at3" [boundary]="at3" [offset]="{ top: 10, left: 10, inner:true}">
    <div class="box">左上角</div>
  </ngx-floating>
  <ngx-floating [at]="at3" [boundary]="at3" [offset]="{ top: 10, right: 10, inner:true }">
    <div class="box">右上角</div>
  </ngx-floating>
  <ngx-floating [at]="at3" [boundary]="at3" [offset]="{ bottom: 10, left: 10, inner:true}">
    <div class="box">左下角</div>
  </ngx-floating>
  <ngx-floating [at]="at3" [boundary]="at3" [offset]="{ bottom: 10, right: 10, inner:true}">
    <div class="box">右下角</div>
  </ngx-floating>
</div>`,

    // 自定义样式：展示如何自定义浮动组件的样式
    custom: `<div class="range" #at5>
  <!-- 使用class自定义样式，通过模板引用访问组件实例 -->
  <ngx-floating #floatingCustom [at]="at5" [offset]="{ top: 50, left: 50, inner: true}" class="custom-floating">
    <div class="box custom">
      <h4>自定义样式</h4>
      <p>可以通过CSS自定义浮动组件的样式</p>
    </div>
  </ngx-floating>
  <div class="controls">
    <button nz-button nzType="default" (click)="floatingCustom.movable = !floatingCustom.movable">{{ floatingCustom.movable ? "关闭" : "开启" }} 移动</button>
    <button nz-button nzType="default" (click)="toggleFloatingCustomBoundary(floatingCustom,at5)">{{ floatingCustom.hasBoundary ? "关闭" : "开启" }} 边界</button>
    <button nz-button nzType="default" (click)="floatingCustom.show()">显示</button>
    <button nz-button nzType="default" (click)="floatingCustom.hide()">隐藏</button>
    <button nz-button nzType="default" (click)="floatingCustom.reset()">重置</button>
  </div>
</div>`,

    // 联动控制：展示如何同时控制多个浮动组件
    linkage: `<div class="range" #at5>
  <div class="controls">
    <!-- 通过ViewChildren获取多个浮动组件实例进行统一控制 -->
    <button (click)="toggleAllFloating()">显示/隐藏所有</button>
  </div>
  <ngx-floating [at]="at5" [offset]="{ top: 30, left: 30 }" #floating1>
    <div class="box">浮动组件1</div>
  </ngx-floating>
  <ngx-floating [at]="at5" [offset]="{ top: 80, left: 80 }" #floating2>
    <div class="box">浮动组件2</div>
  </ngx-floating>
  <ngx-floating [at]="at5" [offset]="{ top: 130, left: 130 }" #floating3>
    <div class="box">浮动组件3</div>
  </ngx-floating>
</div>`
  };
  currentWidth: number = 100;
  currentOuterWidth: number = 100;
  content: any = FloatingContentComponent;

  constructor(private floatingService: NgxFloatingService) {
  }

  ngAfterViewInit() {
  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
  }

  toggleCode(key: string) {
    this.showCodeMap[key] = !this.showCodeMap[key];
  }

  createByService(at: HTMLElement) {
    this.floatingService.create('service-floating', {
      movable: true,
      at: at,
      offset: {top: 0, left: 0, inner: true},
      content: "服务创建的浮动组件"
    });
  }

  controlServiceFloating(directive: 'show' | 'hide' | 'reset' | 'updatePosition') {
    this.floatingService[directive]('service-floating');
  }

  toggleFloatingCustomBoundary(custom: NgxFloatingComponent, boundary: HTMLElement) {
    const newB = custom.hasBoundary ? document.documentElement : boundary;
    custom.updateBoundary(newB)
    console.log("切换边界", custom.hasBoundary, custom.boundary);
  }
}
