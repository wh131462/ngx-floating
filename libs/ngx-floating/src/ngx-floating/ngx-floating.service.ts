import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  TemplateRef,
  Type
} from '@angular/core';
import {Boundary, FloatingOffset, NgxFloatingComponent} from './ngx-floating.component';

export interface NgxFloatingServiceOptions {
  at?: HTMLElement;
  content: TemplateRef<any> | Type<any> | string;
  movable?: boolean;
  offset?: FloatingOffset;
  boundary?: Boundary;
  ignoreBoundary?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class NgxFloatingService {
  private floatingComponents: Map<string, ComponentRef<NgxFloatingComponent>> = new Map();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
  }

  /**
   * 创建一个浮动组件
   * @param id 组件唯一标识
   * @param options 配置选项
   */
  create(id: string, options: NgxFloatingServiceOptions) {
    if (this.floatingComponents.has(id)) {
      console.warn(`浮动组件 ${id} 已存在`);
      return this.floatingComponents.get(id)!.instance;
    }

    // 创建组件工厂
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NgxFloatingComponent);
    // 创建组件
    const componentRef = componentFactory.create(this.injector);
    const component = componentRef.instance;

    // 设置组件属性
    component.at = options.at;
    component.movable = options.movable || false;
    if (options.offset) component.offset = options.offset;
    if (options.boundary) component.boundary = options.boundary;
    component.ignoreBoundary = options.ignoreBoundary || false;

    // 处理content
    if (options.content) {
      if (typeof options.content === 'string') {
        const div = document.createElement('div');
        div.innerHTML = options.content;
        component.contentContainer.nativeElement.appendChild(div);
      } else {
        component.content = options.content;
      }
    }

    // 将组件添加到DOM和ApplicationRef
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
    this.appRef.attachView(componentRef.hostView);

    // 存储组件引用
    this.floatingComponents.set(id, componentRef);
    return component;
  }

  /**
   * 获取指定ID的浮动组件
   * @param id 组件唯一标识
   */
  get(id: string): NgxFloatingComponent | undefined {
    return this.floatingComponents.get(id)?.instance;
  }

  /**
   * 销毁指定ID的浮动组件
   * @param id 组件唯一标识
   */
  destroy(id: string) {
    const componentRef = this.floatingComponents.get(id);
    if (componentRef) {
      // 从DOM中移除组件
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      domElem.remove();

      // 从ApplicationRef中分离视图
      this.appRef.detachView(componentRef.hostView);

      // 销毁组件
      componentRef.destroy();
      this.floatingComponents.delete(id);
    }
  }

  /**
   * 销毁所有浮动组件
   */
  destroyAll() {
    this.floatingComponents.forEach(componentRef => {
      // 从DOM中移除组件
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      domElem.remove();

      // 从ApplicationRef中分离视图
      this.appRef.detachView(componentRef.hostView);

      // 销毁组件
      componentRef.destroy();
    });
    this.floatingComponents.clear();
  }

  /**
   * 显示指定ID的浮动组件
   * @param id 组件唯一标识
   */
  show(id: string) {
    this.floatingComponents.get(id)?.instance.show();
  }

  /**
   * 隐藏指定ID的浮动组件
   * @param id 组件唯一标识
   */
  hide(id: string) {
    this.floatingComponents.get(id)?.instance.hide();
  }

  /**
   * 重置指定ID的浮动组件位置
   * @param id 组件唯一标识
   */
  reset(id: string) {
    this.floatingComponents.get(id)?.instance.reset();
  }

  /**
   * 更新指定ID的浮动组件位置
   * @param id 组件唯一标识
   */
  updatePosition(id: string) {
    this.floatingComponents.get(id)?.instance.updateFloatingPosition();
  }
}
