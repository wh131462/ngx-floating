import * as i0 from '@angular/core';
import { TemplateRef, ViewContainerRef, HostBinding, ViewChild, Input, Component, Injectable, Directive } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

class NgxFloatingComponent {
    constructor(cdr, renderer, componentFactoryResolver) {
        this.cdr = cdr;
        this.renderer = renderer;
        this.componentFactoryResolver = componentFactoryResolver;
        this.movable = false;
        this.offset = { top: 0 };
        this.zIndex = 2;
        this.isVisible = true;
        this.boundary = document.documentElement;
        this.ignoreBoundary = false;
        // 改为变量存储样式
        this.positionStyle = { position: 'fixed' };
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.observer = new ResizeObserver(() => this.updatePosition());
    }
    get cursor() {
        return this.movable ? 'move' : 'default';
    }
    get isHidden() {
        return !this.isVisible ? 'hidden' : 'visible';
    }
    ngOnChanges(changes) {
        const needsUpdate = ['at', 'offset', 'boundary'].some(key => changes[key]);
        if (needsUpdate) {
            this.updatePosition();
        }
        if (changes['content'] && this.content) {
            if (this.isComponent(this.content)) {
                this.renderComponent(this.content);
            }
        }
    }
    isTemplateRef(content) {
        return content instanceof TemplateRef;
    }
    isComponent(content) {
        return typeof content === 'function';
    }
    isString(content) {
        return typeof content === 'string';
    }
    renderComponent(component) {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        this.componentRef = this.componentContainer.createComponent(componentFactory);
        this.cdr.detectChanges();
    }
    validateOffset(offset) {
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
        if (this.movable) {
            this.initDragEvents();
        }
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
    // endregion
    initObserver() {
        const observeTargets = [
            this.at,
            this.floatingRef.nativeElement,
            this.boundary instanceof HTMLElement ? this.boundary : document.body,
            document.body
        ].filter(Boolean);
        window.addEventListener("scroll", this.updatePosition.bind(this));
        observeTargets.forEach(target => this.observer.observe(target));
    }
    updatePosition() {
        this.calcRects();
        this.calcBoundaryRect();
        this.applyPosition();
        this.applyBoundary();
        this.cdr.detectChanges();
    }
    calcRects() {
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
    calcBoundaryRect() {
        if (this.boundary instanceof HTMLElement) {
            this.boundaryRect = this.boundary.getBoundingClientRect();
        }
        else {
            this.boundaryRect = new DOMRect(this.boundary.left || 0, this.boundary.top || 0, (this.boundary.right ?? window.innerWidth) - (this.boundary.left || 0), (this.boundary.bottom ?? window.innerHeight) - (this.boundary.top || 0));
        }
    }
    applyPosition() {
        this.positionStyle = { position: 'fixed' };
        const isInner = this.offset.inner || !this.at;
        // 验证并规范化 offset 设置
        this.offset = this.validateOffset(this.offset);
        // 如果存在相对位置，使用相对位置计算
        if (this.relativePosition) {
            // 水平定位
            if ('left' in this.relativePosition) {
                const base = isInner ? this.atRect.left : this.atRect.right;
                this.positionStyle['left'] = `${base + this.relativePosition.left}px`;
            }
            else if ('right' in this.relativePosition) {
                const base = isInner ? this.atRect.right : this.atRect.left;
                const right = isInner ? this.relativePosition.right : window.innerWidth - base + this.relativePosition.right;
                this.positionStyle['left'] = `${isInner ? base - right - this.floatRect.width : window.innerWidth - right}px`;
            }
            // 垂直定位
            if ('top' in this.relativePosition) {
                const base = isInner ? this.atRect.top : this.atRect.bottom;
                this.positionStyle['top'] = `${base + this.relativePosition.top}px`;
            }
            else if ('bottom' in this.relativePosition) {
                const base = isInner ? this.atRect.bottom : this.atRect.top;
                const bottom = isInner ? this.relativePosition.bottom : window.innerHeight - base + this.relativePosition.bottom;
                this.positionStyle['top'] = `${isInner ? base - bottom - this.floatRect.height : window.innerHeight - bottom}px`;
            }
        }
        else {
            // 使用初始 offset 设置
            // 水平定位
            if (this.offset.left !== undefined) {
                const base = isInner ? this.atRect.left : this.atRect.right;
                this.positionStyle['left'] = `${base + this.offset.left}px`;
                this.relativePosition = { ...this.relativePosition ?? {}, left: this.offset.left };
            }
            else if (this.offset.right !== undefined) {
                const base = isInner ? this.atRect.right : this.atRect.left;
                const right = isInner ? this.offset.right : window.innerWidth - base + this.offset.right;
                this.positionStyle['left'] = `${isInner ? base - right - this.floatRect.width : window.innerWidth - right}px`;
                this.relativePosition = { ...this.relativePosition ?? {}, right: this.offset.right };
            }
            // 垂直定位
            if (this.offset.top !== undefined) {
                const base = isInner ? this.atRect.top : this.atRect.bottom;
                this.positionStyle['top'] = `${base + this.offset.top}px`;
                this.relativePosition = { ...this.relativePosition, top: this.offset.top };
            }
            else if (this.offset.bottom !== undefined) {
                const base = isInner ? this.atRect.bottom : this.atRect.top;
                const bottom = isInner ? this.offset.bottom : window.innerHeight - base + this.offset.bottom;
                this.positionStyle['top'] = `${isInner ? base - bottom - this.floatRect.height : window.innerHeight - bottom}px`;
                this.relativePosition = { ...this.relativePosition, bottom: this.offset.bottom };
            }
        }
    }
    applyBoundary() {
        if (!this.floatRect || this.ignoreBoundary || !this.boundary)
            return;
        const defaultBoundary = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
        const effectiveBoundary = this.boundary === document.documentElement ? defaultBoundary : (this.boundaryRect || defaultBoundary);
        // 水平约束
        if ('left' in this.positionStyle) {
            const left = Math.max(effectiveBoundary.left, Math.min(parseFloat(this.positionStyle['left']), effectiveBoundary.right - this.floatRect.width));
            this.positionStyle['left'] = `${left}px`;
        }
        else if ('right' in this.positionStyle) {
            const right = Math.max(window.innerWidth - effectiveBoundary.right, Math.min(parseFloat(this.positionStyle['right']), window.innerWidth - effectiveBoundary.left - this.floatRect.width));
            this.positionStyle['right'] = `${right}px`;
        }
        // 垂直约束
        if ('top' in this.positionStyle) {
            const top = Math.max(effectiveBoundary.top, Math.min(parseFloat(this.positionStyle['top']), effectiveBoundary.bottom - this.floatRect.height));
            this.positionStyle['top'] = `${top}px`;
        }
        else if ('bottom' in this.positionStyle) {
            const bottom = Math.max(window.innerHeight - effectiveBoundary.bottom, Math.min(parseFloat(this.positionStyle['bottom']), window.innerHeight - effectiveBoundary.top - this.floatRect.height));
            this.positionStyle['bottom'] = `${bottom}px`;
        }
    }
    initDragEvents() {
        const floatingElement = this.floatingRef.nativeElement;
        this.renderer.listen(floatingElement, 'mousedown', (e) => this.onMouseDown(e));
        this.renderer.listen(document, 'mousemove', (e) => this.onMouseMove(e));
        this.renderer.listen(document, 'mouseup', () => this.onMouseUp());
    }
    onMouseDown(event) {
        if (!this.movable)
            return;
        this.isDragging = true;
        // 记录鼠标相对于元素的偏移量
        const rect = this.floatingRef.nativeElement.getBoundingClientRect();
        this.startX = event.clientX - rect.left;
        this.startY = event.clientY - rect.top;
        event.preventDefault();
    }
    onMouseMove(event) {
        if (!this.isDragging)
            return;
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
            const newRelativePosition = {};
            // 水平方向：根据原始offset的设置决定使用left还是right
            if (this.offset.left !== undefined) {
                const base = isInner ? this.atRect.left : this.atRect.right;
                newRelativePosition.left = newLeft - base;
            }
            else if (this.offset.right !== undefined) {
                const base = isInner ? this.atRect.right : this.atRect.left;
                if (isInner) {
                    newRelativePosition.right = base - newLeft - this.floatRect.width;
                }
                else {
                    newRelativePosition.right = window.innerWidth - newLeft - base;
                }
            }
            // 垂直方向：根据原始offset的设置决定使用top还是bottom
            if (this.offset.top !== undefined) {
                const base = isInner ? this.atRect.top : this.atRect.bottom;
                newRelativePosition.top = newTop - base;
            }
            else if (this.offset.bottom !== undefined) {
                const base = isInner ? this.atRect.bottom : this.atRect.top;
                if (isInner) {
                    newRelativePosition.bottom = base - newTop - this.floatRect.height;
                }
                else {
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
    onMouseUp() {
        this.isDragging = false;
    }
    /**
     * 更新浮动组件位置
     */
    updateFloatingPosition() {
        this.updatePosition();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxFloatingComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.Renderer2 }, { token: i0.ComponentFactoryResolver }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "17.3.12", type: NgxFloatingComponent, isStandalone: true, selector: "ngx-floating", inputs: { movable: ["movable", "movable", (value) => (typeof value == 'boolean' ? value : value === 'true' || value === 'movable')], at: "at", offset: "offset", zIndex: "zIndex", isVisible: "isVisible", boundary: "boundary", ignoreBoundary: "ignoreBoundary", content: "content" }, host: { properties: { "style.cursor": "this.cursor", "style.visibility": "this.isHidden" } }, viewQueries: [{ propertyName: "floatingRef", first: true, predicate: ["floatingRef"], descendants: true, static: true }, { propertyName: "componentContainer", first: true, predicate: ["componentContainer"], descendants: true, read: ViewContainerRef }], usesOnChanges: true, ngImport: i0, template: "<!-- ngx-floating -->\n<div\n    #floatingRef\n    [ngStyle]=\"positionStyle\"\n    [style.z-index]=\"zIndex\"\n    class=\"ngx-floating\">\n    <div class=\"content\">\n        <ng-container *ngIf=\"!content\">\n            <ng-content></ng-content>\n        </ng-container>\n        <ng-container *ngIf=\"content\">\n            <ng-container *ngIf=\"isTemplateRef(content)\">\n                <ng-container *ngTemplateOutlet=\"content\"></ng-container>\n            </ng-container>\n            <ng-container *ngIf=\"isComponent(content)\">\n                <ng-container #componentContainer></ng-container>\n            </ng-container>\n            <ng-container *ngIf=\"isString(content)\">\n                {{content}}\n            </ng-container>\n        </ng-container>\n    </div>\n</div>\n", styles: [".ngx-floating{z-index:2;position:fixed;left:0;top:0;background:transparent;display:flex}.ngx-floating .content{flex:1}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "ngmodule", type: FormsModule }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxFloatingComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-floating', standalone: true, imports: [CommonModule, FormsModule], template: "<!-- ngx-floating -->\n<div\n    #floatingRef\n    [ngStyle]=\"positionStyle\"\n    [style.z-index]=\"zIndex\"\n    class=\"ngx-floating\">\n    <div class=\"content\">\n        <ng-container *ngIf=\"!content\">\n            <ng-content></ng-content>\n        </ng-container>\n        <ng-container *ngIf=\"content\">\n            <ng-container *ngIf=\"isTemplateRef(content)\">\n                <ng-container *ngTemplateOutlet=\"content\"></ng-container>\n            </ng-container>\n            <ng-container *ngIf=\"isComponent(content)\">\n                <ng-container #componentContainer></ng-container>\n            </ng-container>\n            <ng-container *ngIf=\"isString(content)\">\n                {{content}}\n            </ng-container>\n        </ng-container>\n    </div>\n</div>\n", styles: [".ngx-floating{z-index:2;position:fixed;left:0;top:0;background:transparent;display:flex}.ngx-floating .content{flex:1}\n"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.Renderer2 }, { type: i0.ComponentFactoryResolver }], propDecorators: { movable: [{
                type: Input,
                args: [{ transform: (value) => (typeof value == 'boolean' ? value : value === 'true' || value === 'movable') }]
            }], at: [{
                type: Input
            }], offset: [{
                type: Input
            }], zIndex: [{
                type: Input
            }], isVisible: [{
                type: Input
            }], boundary: [{
                type: Input
            }], ignoreBoundary: [{
                type: Input
            }], content: [{
                type: Input
            }], floatingRef: [{
                type: ViewChild,
                args: ['floatingRef', { static: true }]
            }], componentContainer: [{
                type: ViewChild,
                args: ['componentContainer', { read: ViewContainerRef }]
            }], cursor: [{
                type: HostBinding,
                args: ['style.cursor']
            }], isHidden: [{
                type: HostBinding,
                args: ['style.visibility']
            }] } });

class NgxFloatingService {
    constructor(componentFactoryResolver, appRef, injector) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.appRef = appRef;
        this.injector = injector;
        this.floatingComponents = new Map();
    }
    /**
     * 创建一个浮动组件
     * @param id 组件唯一标识
     * @param options 配置选项
     */
    create(id, options) {
        if (this.floatingComponents.has(id)) {
            console.warn(`浮动组件 ${id} 已存在`);
        }
        // 创建组件工厂
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NgxFloatingComponent);
        // 创建组件
        const componentRef = componentFactory.create(this.injector);
        const component = componentRef.instance;
        // 设置组件属性
        component.at = options.at;
        component.movable = options.movable || false;
        if (options.offset)
            component.offset = options.offset;
        if (options.boundary)
            component.boundary = options.boundary;
        component.ignoreBoundary = options.ignoreBoundary || false;
        component.content = options.content;
        // 将组件添加到ApplicationRef
        this.appRef.attachView(componentRef.hostView);
        // 将组件添加到DOM
        const domElem = componentRef.hostView.rootNodes[0];
        document.body.appendChild(domElem);
        this.floatingComponents.set(id, componentRef);
        return component;
    }
    /**
     * 获取指定ID的浮动组件
     * @param id 组件唯一标识
     */
    get(id) {
        return this.floatingComponents.get(id)?.instance;
    }
    /**
     * 销毁指定ID的浮动组件
     * @param id 组件唯一标识
     */
    destroy(id) {
        const componentRef = this.floatingComponents.get(id);
        if (componentRef) {
            // 从DOM中移除组件
            const domElem = componentRef.hostView.rootNodes[0];
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
            const domElem = componentRef.hostView.rootNodes[0];
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
    show(id) {
        this.floatingComponents.get(id)?.instance.show();
    }
    /**
     * 隐藏指定ID的浮动组件
     * @param id 组件唯一标识
     */
    hide(id) {
        this.floatingComponents.get(id)?.instance.hide();
    }
    /**
     * 重置指定ID的浮动组件位置
     * @param id 组件唯一标识
     */
    reset(id) {
        this.floatingComponents.get(id)?.instance.reset();
    }
    /**
     * 更新指定ID的浮动组件位置
     * @param id 组件唯一标识
     */
    updatePosition(id) {
        this.floatingComponents.get(id)?.instance.updateFloatingPosition();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxFloatingService, deps: [{ token: i0.ComponentFactoryResolver }, { token: i0.ApplicationRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxFloatingService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxFloatingService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i0.ComponentFactoryResolver }, { type: i0.ApplicationRef }, { type: i0.Injector }] });

class NgxFloatingDirective {
    constructor(elementRef, componentFactoryResolver, appRef, injector) {
        this.elementRef = elementRef;
        this.componentFactoryResolver = componentFactoryResolver;
        this.appRef = appRef;
        this.injector = injector;
        this.ngxFloating = true;
        this.movable = false;
        this.ignoreBoundary = false;
    }
    ngOnInit() {
        if (this.ngxFloating) {
            this.createFloatingComponent();
        }
    }
    ngOnChanges(changes) {
        if (!this.floatingComponent)
            return;
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
    createFloatingComponent() {
        // 创建组件工厂
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NgxFloatingComponent);
        // 创建组件
        this.componentRef = componentFactory.create(this.injector);
        this.floatingComponent = this.componentRef.instance;
        // 设置组件属性
        this.floatingComponent.at = this.at || this.elementRef.nativeElement;
        this.floatingComponent.movable = this.movable;
        if (this.offset)
            this.floatingComponent.offset = this.offset;
        if (this.boundary)
            this.floatingComponent.boundary = this.boundary;
        this.floatingComponent.ignoreBoundary = this.ignoreBoundary;
        // 将组件添加到DOM
        const domElem = this.componentRef.hostView.rootNodes[0];
        document.body.appendChild(domElem);
        // 将组件添加到ApplicationRef
        this.appRef.attachView(this.componentRef.hostView);
    }
    destroyFloatingComponent() {
        if (this.componentRef) {
            // 从DOM中移除组件
            const domElem = this.componentRef.hostView.rootNodes[0];
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxFloatingDirective, deps: [{ token: i0.ElementRef }, { token: i0.ComponentFactoryResolver }, { token: i0.ApplicationRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.12", type: NgxFloatingDirective, isStandalone: true, selector: "[ngxFloating]", inputs: { ngxFloating: "ngxFloating", movable: "movable", at: "at", offset: "offset", boundary: "boundary", ignoreBoundary: "ignoreBoundary" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxFloatingDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngxFloating]',
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ComponentFactoryResolver }, { type: i0.ApplicationRef }, { type: i0.Injector }], propDecorators: { ngxFloating: [{
                type: Input
            }], movable: [{
                type: Input
            }], at: [{
                type: Input
            }], offset: [{
                type: Input
            }], boundary: [{
                type: Input
            }], ignoreBoundary: [{
                type: Input
            }] } });

/*
 * Public API Surface of ngx-floating
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NgxFloatingComponent, NgxFloatingDirective, NgxFloatingService };
//# sourceMappingURL=ngx-floating.mjs.map
