import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Directive, ElementRef, EmbeddedViewRef, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NgxFloatingComponent } from './ngx-floating.component';

@Directive({
    selector: '[ngxFloating]',
    standalone: true
})
export class NgxFloatingDirective implements OnInit, OnChanges, OnDestroy {
    @Input() ngxFloating: boolean = true;
    @Input() movable: boolean = false;
    @Input() at?: HTMLElement;
    @Input() offset: any;
    @Input() boundary: any;
    @Input() ignoreBoundary: boolean = false;

    private floatingComponent?: NgxFloatingComponent;
    private componentRef?: ComponentRef<NgxFloatingComponent>;

    constructor(
        private elementRef: ElementRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
    ) {}

    ngOnInit() {
        if (this.ngxFloating) {
            this.createFloatingComponent();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.floatingComponent) return;

        if (changes['movable']) {
            this.floatingComponent.movable = this.movable;
        }
        if (changes['at']) {
            this.floatingComponent.at = this.at || this.elementRef.nativeElement;
        }
        if (changes['offset']) {
            this.floatingComponent.offset = this.offset;
        }
        if (changes['boundary']) {
            this.floatingComponent.boundary = this.boundary;
        }
        if (changes['ignoreBoundary']) {
            this.floatingComponent.ignoreBoundary = this.ignoreBoundary;
        }
    }

    ngOnDestroy() {
        this.destroyFloatingComponent();
    }

    private createFloatingComponent() {
        // 创建组件工厂
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NgxFloatingComponent);
        
        // 创建组件
        this.componentRef = componentFactory.create(this.injector);
        this.floatingComponent = this.componentRef.instance;
        
        // 设置组件属性
        this.floatingComponent.at = this.at || this.elementRef.nativeElement;
        this.floatingComponent.movable = this.movable;
        if (this.offset) this.floatingComponent.offset = this.offset;
        if (this.boundary) this.floatingComponent.boundary = this.boundary;
        this.floatingComponent.ignoreBoundary = this.ignoreBoundary;

        // 将组件添加到DOM
        const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);

        // 将组件添加到ApplicationRef
        this.appRef.attachView(this.componentRef.hostView);
    }

    private destroyFloatingComponent() {
        if (this.componentRef) {
            // 从DOM中移除组件
            const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
            domElem.remove();

            // 从ApplicationRef中分离视图
            this.appRef.detachView(this.componentRef.hostView);

            // 销毁组件
            this.componentRef.destroy();

            // 清理引用
            this.componentRef = undefined;
            this.floatingComponent = undefined;
        }
    }

    /**
     * 重置浮动组件到初始位置
     */
    reset() {
        this.floatingComponent?.reset();
    }

    /**
     * 显示浮动组件
     */
    show() {
        this.floatingComponent?.show();
    }

    /**
     * 隐藏浮动组件
     */
    hide() {
        this.floatingComponent?.hide();
    }

    /**
     * 更新浮动组件位置
     */
    updatePosition() {
        this.floatingComponent?.updateFloatingPosition();
    }
}