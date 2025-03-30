import { Component, ElementRef, ViewChild, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { NgxFloatingComponent, NgxFloatingService, NgxFloatingDirective } from "ngx-floating";
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

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
    NzTooltipDirective
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('directiveTarget') directiveTarget!: ElementRef;
  @ViewChildren('floating1, floating2, floating3') floatingComponents!: QueryList<NgxFloatingComponent>;
  selectedTabIndex = 0;
  isMovable = true;
  ignoreBoundary = false;
  offset = { top: 10, left: 10, inner: true };
  showCodeMap: { [key: string]: boolean } = {
    basic: false,
    directive: false,
    service: false,
    position: false,
    custom: false,
    linkage: false
  };

  codeMap = {
    basic: `<div class="range" #at1>
  <ngx-floating [at]="at1" [boundary]="at1" [movable]="true" [offset]="{ right: 10, bottom: 10, inner: true}">
    <div class="box">可移动的浮动框</div>
  </ngx-floating>
</div>`,
    directive: `<div class="range" #directiveTarget>
  <div class="box" [ngxFloating]="true" [movable]="isMovable" [at]="directiveTarget" [offset]="offset" [ignoreBoundary]="ignoreBoundary">
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
    service: `<div class="range" #at2>
  <div class="box">通过服务创建的浮动组件</div>
  <div class="controls">
    <button nz-button nzType="default" (click)="selectTab(0)">查看基础组件</button>
    <button nz-button nzType="default" (click)="selectTab(1)">查看指令用法</button>
  </div>
</div>`,
    position: `<div class="range" #at3>
  <ngx-floating [at]="at3" [boundary]="at3"  [offset]="{ top: 10, left: 10 , inner:true}">
    <div class="box">左上角</div>
  </ngx-floating>
  <ngx-floating [at]="at3" [boundary]="at3"  [offset]="{ top: 10, right: 10, inner:true }">
    <div class="box">右上角</div>
  </ngx-floating>
  <ngx-floating [at]="at3" [boundary]="at3" [offset]="{ bottom: 10, left: 10 , inner:true}">
    <div class="box">左下角</div>
  </ngx-floating>
  <ngx-floating [at]="at3"  [boundary]="at3"  [offset]="{ bottom: 10, right: 10 , inner:true}">
    <div class="box">右下角</div>
  </ngx-floating>
</div>`,
    custom: `<div class="range" #at4 [attr.data-movable]="false">
  <ngx-floating [at]="at4" [movable]="at4.getAttribute('data-movable')!" [offset]="{ top: 50, left: 50 , inner: true}" class="custom-floating">
    <div class="box custom">
      <h4>自定义样式</h4>
      <p>可以通过CSS自定义浮动组件的样式</p>
    </div>
  </ngx-floating>
</div>`,
    linkage: `<div class="range" #at5>
  <div class="controls">
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


  constructor(private floatingService: NgxFloatingService) {}

  ngAfterViewInit() {
  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
  }

  toggleCode(key: string) {
    this.showCodeMap[key] = !this.showCodeMap[key];
  }

  toggleAllFloating() {
    const components = this.floatingComponents.toArray();
    const allVisible = components.every(comp => comp.isVisible);

    components.forEach(comp => {
      if (allVisible) {
        comp.hide();
      } else {
        comp.show();
      }
    });
  }

}
