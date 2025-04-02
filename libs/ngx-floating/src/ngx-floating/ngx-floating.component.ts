import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

export type Boundary = HTMLElement | {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export interface FloatingOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  inner?: boolean;
}

export interface RelativePosition {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

@Component({
  selector: 'ngx-floating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ngx-floating.component.html',
  styleUrls: ['./ngx-floating.component.scss']
})
export class NgxFloatingComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({transform: (value: string | boolean) => (typeof value == 'boolean' ? value : value === 'true' || value === 'movable')})
  movable = false;
  /**
   * 目标元素，用于定位浮动组件的位置。
   * 如果不设置，浮动组件将以整个窗口作为参考对象。
   */
  @Input() at?: HTMLElement;
  @Input() offset: FloatingOffset = {top: 0};
  @Input() zIndex: number = 2;
  @Input() isVisible = true;
  @Input() boundary: Boundary = document.documentElement;
  @Input() ignoreBoundary = false;
  @Input() content?: TemplateRef<any> | Type<any> | string;

  @ViewChild("contentContainer", {read: ElementRef, static: true}) public contentContainer!: ElementRef;
  get hasBoundary(){
    return this.boundary && this.boundary !== document.documentElement;
  }
  // 改为变量存储样式
  positionStyle: { [key: string]: string } = {position: 'fixed'};
  private relativePosition?: RelativePosition;
  private boundaryRect?: DOMRect;
  private floatRect?: DOMRect;
  private atRect?: DOMRect;
  private observer: ResizeObserver;

  @ViewChild('floatingRef', {static: true}) floatingRef!: ElementRef;
  @ViewChild('componentContainer', {read: ViewContainerRef}) componentContainer!: ViewContainerRef;

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private componentRef?: ComponentRef<any>;

  constructor(
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.observer = new ResizeObserver(() => this.updatePosition());
  }

  @HostBinding('style.cursor') get cursor() {
    return this.movable ? 'move' : 'default';
  }

  @HostBinding('style.visibility')
  get isHidden() {
    return !this.isVisible ? 'hidden' : 'visible';
  }

  ngOnChanges(changes: SimpleChanges): void {
    const needsUpdate = ['at', 'offset', 'boundary'].some(key => changes[key]);
    if (needsUpdate) {
      this.updatePosition();
    }

    if (changes['content'] && this.content) {
      if (this.isComponent(this.content)) {
        this.renderComponent(this.content as Type<any>);
      }
    }
  }

  isTemplateRef(content: any): content is TemplateRef<any> {
    return content instanceof TemplateRef;
  }

  isComponent(content: any): content is Type<any> {
    return typeof content === 'function';
  }

  isString(content: any): content is string {
    return typeof content === 'string';
  }

  private renderComponent(component: Type<any>) {
    if (this.componentRef) {
      this.componentRef.destroy();
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    this.componentRef = this.componentContainer.createComponent(componentFactory);
    this.cdr.detectChanges();
  }

  private validateOffset(offset: FloatingOffset) {
    // 确保只能设置四个角落的位置
    const hasTop = offset.top !== undefined;
    const hasBottom = offset.bottom !== undefined;
    const hasLeft = offset.left !== undefined;
    const hasRight = offset.right !== undefined;

    // 如果同时设置了上下或左右，保留第一个设置的值
    if (hasTop && hasBottom) {
      delete offset.bottom;
    }
    if (hasLeft && hasRight) {
      delete offset.right;
    }
    // 如果没有设置任何位置，默认设置左上角
    if (!hasTop && !hasBottom && !hasLeft && !hasRight) {
      offset.top = 0;
      offset.left = 0;
    }
    return offset;
  }

  ngAfterViewInit() {
    this.initDragEvents();
    this.initObserver();
    setTimeout(() => {
      this.updatePosition();
    });
  }

  ngOnDestroy() {
    this.observer.disconnect();
    window.removeEventListener("scroll", this.updatePosition.bind(this));
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  // region 公共方法
  updateBoundary(boundary: Boundary) {
    this.boundary = boundary;
    this.updatePosition();
  }
  /**
   * 显示浮动组件
   */
  show() {
    this.isVisible = true;
  }

  /**
   * 隐藏浮动组件
   */
  hide() {
    this.isVisible = false;
    console.log("隐藏浮动组件");
  }

  /**
   * 重置浮动组件到初始位置
   */
  reset() {
    this.relativePosition = undefined;
    this.updatePosition();
  }

  /**
   * 更新浮动组件位置
   */
  updateFloatingPosition() {
    this.updatePosition();
  }
  // endregion

  private initObserver() {
    const observeTargets = [
      this.at,
      this.floatingRef.nativeElement,
      this.boundary instanceof HTMLElement ? this.boundary : document.body,
      document.body
    ].filter(Boolean);
    window.addEventListener("scroll", this.updatePosition.bind(this))
    observeTargets.forEach(target => this.observer.observe(target));
  }

  private updatePosition() {
    this.calcRects();
    this.calcBoundaryRect();
    this.applyPosition();
    this.applyBoundary();
    this.cdr.detectChanges();
  }

  private calcRects() {
    this.atRect = this.at ? this.at.getBoundingClientRect() : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    this.floatRect = this.floatingRef.nativeElement.getBoundingClientRect();

    // 检查目标元素是否在视口内
    if (this.at) {
      const viewportRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
      const isInViewport = !(this.atRect.right < 0 ||
        this.atRect.left > viewportRect.width ||
        this.atRect.bottom < 0 ||
        this.atRect.top > viewportRect.height);

      if (!isInViewport) {
        this.hide();
        return;
      }
      this.show();
    }
  }

  private calcBoundaryRect() {
    if (this.boundary instanceof HTMLElement) {
      this.boundaryRect = this.boundary.getBoundingClientRect();
    } else {
      this.boundaryRect = new DOMRect(
        this.boundary.left || 0,
        this.boundary.top || 0,
        (this.boundary.right ?? window.innerWidth) - (this.boundary.left || 0),
        (this.boundary.bottom ?? window.innerHeight) - (this.boundary.top || 0)
      );
    }
    console.log(this.boundaryRect)
  }

  private applyPosition() {
    this.positionStyle = {position: 'fixed'};
    const isInner = this.offset.inner || !this.at;

    // 验证并规范化 offset 设置
    this.offset = this.validateOffset(this.offset);

    // 如果存在相对位置，使用相对位置计算
    if (this.relativePosition) {
      // 水平定位
      if ('left' in this.relativePosition) {
        const base = this.atRect!.left;
        this.positionStyle['left'] = `${base + this.relativePosition.left!}px`;
      } else if ('right' in this.relativePosition) {
        const base = this.atRect!.right;
        const right = isInner ? this.relativePosition.right! : this.relativePosition.right!;
        this.positionStyle['left'] = `${isInner ? base - right - this.floatRect!.width : base + right}px`;
      }

      // 垂直定位
      if ('top' in this.relativePosition) {
        const base = this.atRect!.top;
        this.positionStyle['top'] = `${base + this.relativePosition.top!}px`;
      } else if ('bottom' in this.relativePosition) {
        const base = this.atRect!.bottom;
        const bottom = isInner ? this.relativePosition.bottom! : this.relativePosition.bottom!;
        this.positionStyle['top'] = `${isInner ? base - bottom - this.floatRect!.height : base + bottom}px`;
      }
    } else {
      // 使用初始 offset 设置
      // 水平定位
      if (this.offset.left !== undefined) {
        const base = this.atRect!.left;
        this.positionStyle['left'] = `${base + this.offset.left}px`;
        this.relativePosition = {...this.relativePosition ?? {}, left: this.offset.left};
      } else if (this.offset.right !== undefined) {
        const base = this.atRect!.right;
        const right = isInner ? this.offset.right : this.offset.right;
        this.positionStyle['left'] = `${isInner ? base - right - this.floatRect!.width : base + right}px`;
        this.relativePosition = {...this.relativePosition ?? {}, right: this.offset.right};
      }

      // 垂直定位
      if (this.offset.top !== undefined) {
        const base = this.atRect!.top;
        this.positionStyle['top'] = `${base + this.offset.top}px`;
        this.relativePosition = {...this.relativePosition, top: this.offset.top};
      } else if (this.offset.bottom !== undefined) {
        const base = this.atRect!.bottom;
        const bottom = isInner ? this.offset.bottom : this.offset.bottom;
        this.positionStyle['top'] = `${isInner ? base - bottom - this.floatRect!.height : base + bottom}px`;
        this.relativePosition = {...this.relativePosition, bottom: this.offset.bottom};
      }
    }
  }

  private applyBoundary() {
    if (!this.floatRect || this.ignoreBoundary || !this.boundary) return;

    const defaultBoundary = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    const effectiveBoundary = this.boundary === document.documentElement ? defaultBoundary : (this.boundaryRect || defaultBoundary);

    // 水平约束
    if ('left' in this.positionStyle) {
      const left = Math.max(
        effectiveBoundary.left,
        Math.min(
          parseFloat(this.positionStyle['left']),
          effectiveBoundary.right - this.floatRect.width
        )
      );
      this.positionStyle['left'] = `${left}px`;
    } else if ('right' in this.positionStyle) {
      const right = Math.max(
        window.innerWidth - effectiveBoundary.right,
        Math.min(
          parseFloat(this.positionStyle['right']),
          window.innerWidth - effectiveBoundary.left - this.floatRect.width
        )
      );
      this.positionStyle['right'] = `${right}px`;
    }

    // 垂直约束
    if ('top' in this.positionStyle) {
      const top = Math.max(
        effectiveBoundary.top,
        Math.min(
          parseFloat(this.positionStyle['top']),
          effectiveBoundary.bottom - this.floatRect.height
        )
      );
      this.positionStyle['top'] = `${top}px`;
    } else if ('bottom' in this.positionStyle) {
      const bottom = Math.max(
        window.innerHeight - effectiveBoundary.bottom,
        Math.min(
          parseFloat(this.positionStyle['bottom']),
          window.innerHeight - effectiveBoundary.top - this.floatRect.height
        )
      );
      this.positionStyle['bottom'] = `${bottom}px`;
    }
  }

  private initDragEvents() {
    const floatingElement = this.floatingRef.nativeElement;
    this.renderer.listen(floatingElement, 'mousedown', (e: MouseEvent) => this.onMouseDown(e));
    this.renderer.listen(document, 'mousemove', (e: MouseEvent) => this.onMouseMove(e));
    this.renderer.listen(document, 'mouseup', () => this.onMouseUp());
  }

  private onMouseDown(event: MouseEvent) {
    if (!this.movable) return;
    this.isDragging = true;

    // 记录鼠标相对于元素的偏移量
    const rect = this.floatingRef.nativeElement.getBoundingClientRect();
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;

    event.preventDefault();
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    // 计算新位置，保持鼠标相对于元素的偏移量不变
    const newLeft = event.clientX - this.startX;
    const newTop = event.clientY - this.startY;

    // 更新位置样式
    this.positionStyle = {
      position: 'fixed',
      left: `${newLeft}px`,
      top: `${newTop}px`,
    };

    // 更新相对位置，保持与原始offset设置相同的方位
    if (this.atRect) {
      const isInner = this.offset.inner || !this.at;
      const newRelativePosition: RelativePosition = {};

      // 水平方向：根据原始offset的设置决定使用left还是right
      if (this.offset.left !== undefined) {
        const base = isInner ? this.atRect.left : this.atRect.right;
        newRelativePosition.left = newLeft - base;
      } else if (this.offset.right !== undefined) {
        const base = isInner ? this.atRect.right : this.atRect.left;
        if (isInner) {
          newRelativePosition.right = base - newLeft - this.floatRect!.width;
        } else {
          newRelativePosition.right = window.innerWidth - newLeft - base;
        }
      }

      // 垂直方向：根据原始offset的设置决定使用top还是bottom
      if (this.offset.top !== undefined) {
        const base = isInner ? this.atRect.top : this.atRect.bottom;
        newRelativePosition.top = newTop - base;
      } else if (this.offset.bottom !== undefined) {
        const base = isInner ? this.atRect.bottom : this.atRect.top;
        if (isInner) {
          newRelativePosition.bottom = base - newTop - this.floatRect!.height;
        } else {
          newRelativePosition.bottom = window.innerHeight - newTop - base;
        }
      }

      this.relativePosition = newRelativePosition;

      // 只有在设置了boundary时才应用边界约束
      if (this.boundary) {
        this.applyBoundary();
      }
      this.cdr.detectChanges();
    }
  }

  private onMouseUp() {
    this.isDragging = false;
  }


}
