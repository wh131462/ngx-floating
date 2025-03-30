import { Component, HostBinding, Input, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class NgxFloatingComponent {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWZsb2F0aW5nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYnMvbmd4LWZsb2F0aW5nL3NyYy9uZ3gtZmxvYXRpbmcvbmd4LWZsb2F0aW5nLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uL2xpYnMvbmd4LWZsb2F0aW5nL3NyYy9uZ3gtZmxvYXRpbmcvbmd4LWZsb2F0aW5nLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFHTCxTQUFTLEVBSVQsV0FBVyxFQUNYLEtBQUssRUFLTCxXQUFXLEVBRVgsU0FBUyxFQUNULGdCQUFnQixFQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGdCQUFnQixDQUFDOzs7QUErQjNDLE1BQU0sT0FBTyxvQkFBb0I7SUErQi9CLFlBQ1UsR0FBc0IsRUFDdEIsUUFBbUIsRUFDbkIsd0JBQWtEO1FBRmxELFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBQ3RCLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDbkIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQWhDNUQsWUFBTyxHQUFHLEtBQUssQ0FBQztRQU1QLFdBQU0sR0FBbUIsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDLENBQUM7UUFDbEMsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixjQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLGFBQVEsR0FBYSxRQUFRLENBQUMsZUFBZSxDQUFDO1FBQzlDLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1FBR2hDLFdBQVc7UUFDWCxrQkFBYSxHQUE4QixFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQztRQVV2RCxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ25CLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxXQUFNLEdBQUcsQ0FBQyxDQUFDO1FBUWpCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELElBQWlDLE1BQU07UUFDckMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsSUFDSSxRQUFRO1FBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQy9DLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNFLElBQUksV0FBVyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFvQixDQUFDLENBQUM7WUFDbEQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsYUFBYSxDQUFDLE9BQVk7UUFDeEIsT0FBTyxPQUFPLFlBQVksV0FBVyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBWTtRQUN0QixPQUFPLE9BQU8sT0FBTyxLQUFLLFVBQVUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsUUFBUSxDQUFDLE9BQVk7UUFDbkIsT0FBTyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUM7SUFDckMsQ0FBQztJQUVPLGVBQWUsQ0FBQyxTQUFvQjtRQUMxQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFTyxjQUFjLENBQUMsTUFBc0I7UUFDM0MsZ0JBQWdCO1FBQ2hCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDO1FBQ3hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDO1FBRTVDLHlCQUF5QjtRQUN6QixJQUFJLE1BQU0sSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUN4QixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQztRQUNELElBQUksT0FBTyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO1FBQ0QscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuRCxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNmLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBQ0QsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDM0IsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFFRCxjQUFjO0lBQ2Q7O09BRUc7SUFDSCxJQUFJO1FBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7UUFDbEMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxZQUFZO0lBRUosWUFBWTtRQUNsQixNQUFNLGNBQWMsR0FBRztZQUNyQixJQUFJLENBQUMsRUFBRTtZQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYTtZQUM5QixJQUFJLENBQUMsUUFBUSxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUk7WUFDcEUsUUFBUSxDQUFDLElBQUk7U0FDZCxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDakUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVPLGNBQWM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRU8sU0FBUztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25ILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUV4RSxlQUFlO1FBQ2YsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDWixNQUFNLFlBQVksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsS0FBSztnQkFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXpDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLE9BQU87WUFDVCxDQUFDO1lBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsSUFBSSxJQUFJLENBQUMsUUFBUSxZQUFZLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzVELENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLE9BQU8sQ0FDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQ3RCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQ3RFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQ3hFLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVPLGFBQWE7UUFDbkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQztRQUN6QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFFOUMsbUJBQW1CO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0Msb0JBQW9CO1FBQ3BCLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDMUIsT0FBTztZQUNQLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTyxDQUFDLEtBQUssQ0FBQztnQkFDOUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSyxJQUFJLENBQUM7WUFDekUsQ0FBQztpQkFBTSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDNUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQzlELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQU0sQ0FBQztnQkFDL0csSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxLQUFLLElBQUksQ0FBQztZQUNqSCxDQUFDO1lBRUQsT0FBTztZQUNQLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTyxDQUFDLE1BQU0sQ0FBQztnQkFDOUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBSSxJQUFJLENBQUM7WUFDdkUsQ0FBQztpQkFBTSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQzlELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU8sQ0FBQztnQkFDbkgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQztZQUNwSCxDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixpQkFBaUI7WUFDakIsT0FBTztZQUNQLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ25DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO2dCQUM5RCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7Z0JBQzVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUMsQ0FBQztZQUNuRixDQUFDO2lCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzNDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsSUFBSSxDQUFDO2dCQUM5RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDekYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxLQUFLLElBQUksQ0FBQztnQkFDL0csSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxDQUFDO1lBQ3JGLENBQUM7WUFFRCxPQUFPO1lBQ1AsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDbEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQzlELElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDMUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFDLENBQUM7WUFDM0UsQ0FBQztpQkFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUM1QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTyxDQUFDLEdBQUcsQ0FBQztnQkFDOUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQzdGLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUM7Z0JBQ2xILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQyxDQUFDO1lBQ2pGLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLGFBQWE7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUVyRSxNQUFNLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxlQUFlLENBQUMsQ0FBQztRQUVoSSxPQUFPO1FBQ1AsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ25CLGlCQUFpQixDQUFDLElBQUksRUFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FDTixVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUN0QyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQy9DLENBQ0YsQ0FBQztZQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQztRQUMzQyxDQUFDO2FBQU0sSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ3BCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxFQUMzQyxJQUFJLENBQUMsR0FBRyxDQUNOLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQ3ZDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUNsRSxDQUNGLENBQUM7WUFDRixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsS0FBSyxJQUFJLENBQUM7UUFDN0MsQ0FBQztRQUVELE9BQU87UUFDUCxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDbEIsaUJBQWlCLENBQUMsR0FBRyxFQUNyQixJQUFJLENBQUMsR0FBRyxDQUNOLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ3JDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FDakQsQ0FDRixDQUFDO1lBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ3pDLENBQUM7YUFBTSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDMUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDckIsTUFBTSxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLEVBQzdDLElBQUksQ0FBQyxHQUFHLENBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDeEMsTUFBTSxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQ25FLENBQ0YsQ0FBQztZQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQztRQUMvQyxDQUFDO0lBQ0gsQ0FBQztJQUVPLGNBQWM7UUFDcEIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7UUFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFTyxXQUFXLENBQUMsS0FBaUI7UUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUV2QixnQkFBZ0I7UUFDaEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNwRSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUV2QyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVPLFdBQVcsQ0FBQyxLQUFpQjtRQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPO1FBRTdCLHdCQUF3QjtRQUN4QixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDNUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTNDLFNBQVM7UUFDVCxJQUFJLENBQUMsYUFBYSxHQUFHO1lBQ25CLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLElBQUksRUFBRSxHQUFHLE9BQU8sSUFBSTtZQUNwQixHQUFHLEVBQUUsR0FBRyxNQUFNLElBQUk7U0FDbkIsQ0FBQztRQUVGLDRCQUE0QjtRQUM1QixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDOUMsTUFBTSxtQkFBbUIsR0FBcUIsRUFBRSxDQUFDO1lBRWpELG9DQUFvQztZQUNwQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUNuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDNUQsbUJBQW1CLENBQUMsSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDNUMsQ0FBQztpQkFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUMzQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDNUQsSUFBSSxPQUFPLEVBQUUsQ0FBQztvQkFDWixtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBVSxDQUFDLEtBQUssQ0FBQztnQkFDckUsQ0FBQztxQkFBTSxDQUFDO29CQUNOLG1CQUFtQixDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQ2pFLENBQUM7WUFDSCxDQUFDO1lBRUQsb0NBQW9DO1lBQ3BDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2xDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUM1RCxtQkFBbUIsQ0FBQyxHQUFHLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztZQUMxQyxDQUFDO2lCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzVDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUM1RCxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUNaLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFVLENBQUMsTUFBTSxDQUFDO2dCQUN0RSxDQUFDO3FCQUFNLENBQUM7b0JBQ04sbUJBQW1CLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDbEUsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUM7WUFFNUMseUJBQXlCO1lBQ3pCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdkIsQ0FBQztZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDM0IsQ0FBQztJQUNILENBQUM7SUFFTyxTQUFTO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsc0JBQXNCO1FBQ3BCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN4QixDQUFDOytHQXRZVSxvQkFBb0I7bUdBQXBCLG9CQUFvQiwwRkFDWixDQUFDLEtBQXVCLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNLElBQUUsS0FBSyxLQUFLLFNBQVMsQ0FBQyw2ZEF1Qm5GLGdCQUFnQixrREMxRTFELGt5QkF1QkEsaUxEdUJZLFlBQVksOFhBQUUsV0FBVzs7NEZBSXhCLG9CQUFvQjtrQkFQaEMsU0FBUzsrQkFDRSxjQUFjLGNBQ1osSUFBSSxXQUNQLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQztxSkFNcEMsT0FBTztzQkFETixLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLENBQUMsS0FBdUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sSUFBRSxLQUFLLEtBQUssU0FBUyxDQUFDLEVBQUM7Z0JBTW5ILEVBQUU7c0JBQVYsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxjQUFjO3NCQUF0QixLQUFLO2dCQUNHLE9BQU87c0JBQWYsS0FBSztnQkFVb0MsV0FBVztzQkFBcEQsU0FBUzt1QkFBQyxhQUFhLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDO2dCQUNtQixrQkFBa0I7c0JBQTVFLFNBQVM7dUJBQUMsb0JBQW9CLEVBQUUsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBZXhCLE1BQU07c0JBQXRDLFdBQVc7dUJBQUMsY0FBYztnQkFLdkIsUUFBUTtzQkFEWCxXQUFXO3VCQUFDLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgQ29tcG9uZW50UmVmLFxuICBFbGVtZW50UmVmLFxuICBIb3N0QmluZGluZyxcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBSZW5kZXJlcjIsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxuICBUeXBlLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdDb250YWluZXJSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7Rm9ybXNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuZXhwb3J0IHR5cGUgQm91bmRhcnkgPSBIVE1MRWxlbWVudCB8IHtcbiAgdG9wPzogbnVtYmVyO1xuICByaWdodD86IG51bWJlcjtcbiAgYm90dG9tPzogbnVtYmVyO1xuICBsZWZ0PzogbnVtYmVyO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBGbG9hdGluZ09mZnNldCB7XG4gIHRvcD86IG51bWJlcjtcbiAgcmlnaHQ/OiBudW1iZXI7XG4gIGJvdHRvbT86IG51bWJlcjtcbiAgbGVmdD86IG51bWJlcjtcbiAgaW5uZXI/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlbGF0aXZlUG9zaXRpb24ge1xuICB0b3A/OiBudW1iZXI7XG4gIHJpZ2h0PzogbnVtYmVyO1xuICBib3R0b20/OiBudW1iZXI7XG4gIGxlZnQ/OiBudW1iZXI7XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25neC1mbG9hdGluZycsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIEZvcm1zTW9kdWxlXSxcbiAgdGVtcGxhdGVVcmw6ICcuL25neC1mbG9hdGluZy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL25neC1mbG9hdGluZy5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIE5neEZsb2F0aW5nQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBASW5wdXQoe3RyYW5zZm9ybTogKHZhbHVlOiBzdHJpbmcgfCBib29sZWFuKSA9PiAodHlwZW9mIHZhbHVlID09ICdib29sZWFuJyA/IHZhbHVlIDogdmFsdWUgPT09ICd0cnVlJ3x8dmFsdWUgPT09ICdtb3ZhYmxlJyl9KVxuICBtb3ZhYmxlID0gZmFsc2U7XG4gIC8qKlxuICAgKiDnm67moIflhYPntKDvvIznlKjkuo7lrprkvY3mta7liqjnu4Tku7bnmoTkvY3nva7jgIJcbiAgICog5aaC5p6c5LiN6K6+572u77yM5rWu5Yqo57uE5Lu25bCG5Lul5pW05Liq56qX5Y+j5L2c5Li65Y+C6ICD5a+56LGh44CCXG4gICAqL1xuICBASW5wdXQoKSBhdD86IEhUTUxFbGVtZW50O1xuICBASW5wdXQoKSBvZmZzZXQ6IEZsb2F0aW5nT2Zmc2V0ID0ge3RvcDogMH07XG4gIEBJbnB1dCgpIHpJbmRleDogbnVtYmVyID0gMjtcbiAgQElucHV0KCkgaXNWaXNpYmxlID0gdHJ1ZTtcbiAgQElucHV0KCkgYm91bmRhcnk6IEJvdW5kYXJ5ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICBASW5wdXQoKSBpZ25vcmVCb3VuZGFyeSA9IGZhbHNlO1xuICBASW5wdXQoKSBjb250ZW50PzogVGVtcGxhdGVSZWY8YW55PiB8IFR5cGU8YW55PiB8IHN0cmluZztcblxuICAvLyDmlLnkuLrlj5jph4/lrZjlgqjmoLflvI9cbiAgcG9zaXRpb25TdHlsZTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHtwb3NpdGlvbjogJ2ZpeGVkJ307XG4gIHByaXZhdGUgcmVsYXRpdmVQb3NpdGlvbj86IFJlbGF0aXZlUG9zaXRpb247XG4gIHByaXZhdGUgYm91bmRhcnlSZWN0PzogRE9NUmVjdDtcbiAgcHJpdmF0ZSBmbG9hdFJlY3Q/OiBET01SZWN0O1xuICBwcml2YXRlIGF0UmVjdD86IERPTVJlY3Q7XG4gIHByaXZhdGUgb2JzZXJ2ZXI6IFJlc2l6ZU9ic2VydmVyO1xuXG4gIEBWaWV3Q2hpbGQoJ2Zsb2F0aW5nUmVmJywge3N0YXRpYzogdHJ1ZX0pIGZsb2F0aW5nUmVmITogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZCgnY29tcG9uZW50Q29udGFpbmVyJywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSBjb21wb25lbnRDb250YWluZXIhOiBWaWV3Q29udGFpbmVyUmVmO1xuXG4gIHByaXZhdGUgaXNEcmFnZ2luZyA9IGZhbHNlO1xuICBwcml2YXRlIHN0YXJ0WCA9IDA7XG4gIHByaXZhdGUgc3RhcnRZID0gMDtcbiAgcHJpdmF0ZSBjb21wb25lbnRSZWY/OiBDb21wb25lbnRSZWY8YW55PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJcbiAgKSB7XG4gICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB0aGlzLnVwZGF0ZVBvc2l0aW9uKCkpO1xuICB9XG5cbiAgQEhvc3RCaW5kaW5nKCdzdHlsZS5jdXJzb3InKSBnZXQgY3Vyc29yKCkge1xuICAgIHJldHVybiB0aGlzLm1vdmFibGUgPyAnbW92ZScgOiAnZGVmYXVsdCc7XG4gIH1cblxuICBASG9zdEJpbmRpbmcoJ3N0eWxlLnZpc2liaWxpdHknKVxuICBnZXQgaXNIaWRkZW4oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzVmlzaWJsZT8gJ2hpZGRlbicgOiAndmlzaWJsZSc7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgY29uc3QgbmVlZHNVcGRhdGUgPSBbJ2F0JywgJ29mZnNldCcsICdib3VuZGFyeSddLnNvbWUoa2V5ID0+IGNoYW5nZXNba2V5XSk7XG4gICAgaWYgKG5lZWRzVXBkYXRlKSB7XG4gICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXNbJ2NvbnRlbnQnXSAmJiB0aGlzLmNvbnRlbnQpIHtcbiAgICAgIGlmICh0aGlzLmlzQ29tcG9uZW50KHRoaXMuY29udGVudCkpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJDb21wb25lbnQodGhpcy5jb250ZW50IGFzIFR5cGU8YW55Pik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNUZW1wbGF0ZVJlZihjb250ZW50OiBhbnkpOiBjb250ZW50IGlzIFRlbXBsYXRlUmVmPGFueT4ge1xuICAgIHJldHVybiBjb250ZW50IGluc3RhbmNlb2YgVGVtcGxhdGVSZWY7XG4gIH1cblxuICBpc0NvbXBvbmVudChjb250ZW50OiBhbnkpOiBjb250ZW50IGlzIFR5cGU8YW55PiB7XG4gICAgcmV0dXJuIHR5cGVvZiBjb250ZW50ID09PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgaXNTdHJpbmcoY29udGVudDogYW55KTogY29udGVudCBpcyBzdHJpbmcge1xuICAgIHJldHVybiB0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZyc7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQ6IFR5cGU8YW55Pikge1xuICAgIGlmICh0aGlzLmNvbXBvbmVudFJlZikge1xuICAgICAgdGhpcy5jb21wb25lbnRSZWYuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnkgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShjb21wb25lbnQpO1xuICAgIHRoaXMuY29tcG9uZW50UmVmID0gdGhpcy5jb21wb25lbnRDb250YWluZXIuY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3RvcnkpO1xuICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgdmFsaWRhdGVPZmZzZXQob2Zmc2V0OiBGbG9hdGluZ09mZnNldCkge1xuICAgIC8vIOehruS/neWPquiDveiuvue9ruWbm+S4quinkuiQveeahOS9jee9rlxuICAgIGNvbnN0IGhhc1RvcCA9IG9mZnNldC50b3AgIT09IHVuZGVmaW5lZDtcbiAgICBjb25zdCBoYXNCb3R0b20gPSBvZmZzZXQuYm90dG9tICE9PSB1bmRlZmluZWQ7XG4gICAgY29uc3QgaGFzTGVmdCA9IG9mZnNldC5sZWZ0ICE9PSB1bmRlZmluZWQ7XG4gICAgY29uc3QgaGFzUmlnaHQgPSBvZmZzZXQucmlnaHQgIT09IHVuZGVmaW5lZDtcblxuICAgIC8vIOWmguaenOWQjOaXtuiuvue9ruS6huS4iuS4i+aIluW3puWPs++8jOS/neeVmeesrOS4gOS4quiuvue9rueahOWAvFxuICAgIGlmIChoYXNUb3AgJiYgaGFzQm90dG9tKSB7XG4gICAgICBkZWxldGUgb2Zmc2V0LmJvdHRvbTtcbiAgICB9XG4gICAgaWYgKGhhc0xlZnQgJiYgaGFzUmlnaHQpIHtcbiAgICAgIGRlbGV0ZSBvZmZzZXQucmlnaHQ7XG4gICAgfVxuICAgIC8vIOWmguaenOayoeacieiuvue9ruS7u+S9leS9jee9ru+8jOm7mOiupOiuvue9ruW3puS4iuinklxuICAgIGlmICghaGFzVG9wICYmICFoYXNCb3R0b20gJiYgIWhhc0xlZnQgJiYgIWhhc1JpZ2h0KSB7XG4gICAgICBvZmZzZXQudG9wID0gMDtcbiAgICAgIG9mZnNldC5sZWZ0ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICBpZiAodGhpcy5tb3ZhYmxlKSB7XG4gICAgICB0aGlzLmluaXREcmFnRXZlbnRzKCk7XG4gICAgfVxuICAgIHRoaXMuaW5pdE9ic2VydmVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLnVwZGF0ZVBvc2l0aW9uLmJpbmQodGhpcykpO1xuICAgIGlmICh0aGlzLmNvbXBvbmVudFJlZikge1xuICAgICAgdGhpcy5jb21wb25lbnRSZWYuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHJlZ2lvbiDlhazlhbHmlrnms5VcbiAgLyoqXG4gICAqIOaYvuekuua1ruWKqOe7hOS7tlxuICAgKi9cbiAgc2hvdygpIHtcbiAgICB0aGlzLmlzVmlzaWJsZSA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICog6ZqQ6JeP5rWu5Yqo57uE5Lu2XG4gICAqL1xuICBoaWRlKCkge1xuICAgIHRoaXMuaXNWaXNpYmxlID0gZmFsc2U7XG4gICAgY29uc29sZS5sb2coXCLpmpDol4/mta7liqjnu4Tku7ZcIik7XG4gIH1cblxuICAvKipcbiAgICog6YeN572u5rWu5Yqo57uE5Lu25Yiw5Yid5aeL5L2N572uXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuICB9XG5cbiAgLy8gZW5kcmVnaW9uXG5cbiAgcHJpdmF0ZSBpbml0T2JzZXJ2ZXIoKSB7XG4gICAgY29uc3Qgb2JzZXJ2ZVRhcmdldHMgPSBbXG4gICAgICB0aGlzLmF0LFxuICAgICAgdGhpcy5mbG9hdGluZ1JlZi5uYXRpdmVFbGVtZW50LFxuICAgICAgdGhpcy5ib3VuZGFyeSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ID8gdGhpcy5ib3VuZGFyeSA6IGRvY3VtZW50LmJvZHksXG4gICAgICBkb2N1bWVudC5ib2R5XG4gICAgXS5maWx0ZXIoQm9vbGVhbik7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy51cGRhdGVQb3NpdGlvbi5iaW5kKHRoaXMpKVxuICAgIG9ic2VydmVUYXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQpKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlUG9zaXRpb24oKSB7XG4gICAgdGhpcy5jYWxjUmVjdHMoKTtcbiAgICB0aGlzLmNhbGNCb3VuZGFyeVJlY3QoKTtcbiAgICB0aGlzLmFwcGx5UG9zaXRpb24oKTtcbiAgICB0aGlzLmFwcGx5Qm91bmRhcnkoKTtcbiAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gIH1cblxuICBwcml2YXRlIGNhbGNSZWN0cygpIHtcbiAgICB0aGlzLmF0UmVjdCA9IHRoaXMuYXQgPyB0aGlzLmF0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIDogbmV3IERPTVJlY3QoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgdGhpcy5mbG9hdFJlY3QgPSB0aGlzLmZsb2F0aW5nUmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAvLyDmo4Dmn6Xnm67moIflhYPntKDmmK/lkKblnKjop4blj6PlhoVcbiAgICBpZiAodGhpcy5hdCkge1xuICAgICAgY29uc3Qgdmlld3BvcnRSZWN0ID0gbmV3IERPTVJlY3QoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICBjb25zdCBpc0luVmlld3BvcnQgPSAhKHRoaXMuYXRSZWN0LnJpZ2h0IDwgMCB8fFxuICAgICAgICB0aGlzLmF0UmVjdC5sZWZ0ID4gdmlld3BvcnRSZWN0LndpZHRoIHx8XG4gICAgICAgIHRoaXMuYXRSZWN0LmJvdHRvbSA8IDAgfHxcbiAgICAgICAgdGhpcy5hdFJlY3QudG9wID4gdmlld3BvcnRSZWN0LmhlaWdodCk7XG5cbiAgICAgIGlmICghaXNJblZpZXdwb3J0KSB7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnNob3coKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNhbGNCb3VuZGFyeVJlY3QoKSB7XG4gICAgaWYgKHRoaXMuYm91bmRhcnkgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgdGhpcy5ib3VuZGFyeVJlY3QgPSB0aGlzLmJvdW5kYXJ5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJvdW5kYXJ5UmVjdCA9IG5ldyBET01SZWN0KFxuICAgICAgICB0aGlzLmJvdW5kYXJ5LmxlZnQgfHwgMCxcbiAgICAgICAgdGhpcy5ib3VuZGFyeS50b3AgfHwgMCxcbiAgICAgICAgKHRoaXMuYm91bmRhcnkucmlnaHQgPz8gd2luZG93LmlubmVyV2lkdGgpIC0gKHRoaXMuYm91bmRhcnkubGVmdCB8fCAwKSxcbiAgICAgICAgKHRoaXMuYm91bmRhcnkuYm90dG9tID8/IHdpbmRvdy5pbm5lckhlaWdodCkgLSAodGhpcy5ib3VuZGFyeS50b3AgfHwgMClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhcHBseVBvc2l0aW9uKCkge1xuICAgIHRoaXMucG9zaXRpb25TdHlsZSA9IHtwb3NpdGlvbjogJ2ZpeGVkJ307XG4gICAgY29uc3QgaXNJbm5lciA9IHRoaXMub2Zmc2V0LmlubmVyIHx8ICF0aGlzLmF0O1xuXG4gICAgLy8g6aqM6K+B5bm26KeE6IyD5YyWIG9mZnNldCDorr7nva5cbiAgICB0aGlzLm9mZnNldCA9IHRoaXMudmFsaWRhdGVPZmZzZXQodGhpcy5vZmZzZXQpO1xuXG4gICAgLy8g5aaC5p6c5a2Y5Zyo55u45a+55L2N572u77yM5L2/55So55u45a+55L2N572u6K6h566XXG4gICAgaWYgKHRoaXMucmVsYXRpdmVQb3NpdGlvbikge1xuICAgICAgLy8g5rC05bmz5a6a5L2NXG4gICAgICBpZiAoJ2xlZnQnIGluIHRoaXMucmVsYXRpdmVQb3NpdGlvbikge1xuICAgICAgICBjb25zdCBiYXNlID0gaXNJbm5lciA/IHRoaXMuYXRSZWN0IS5sZWZ0IDogdGhpcy5hdFJlY3QhLnJpZ2h0O1xuICAgICAgICB0aGlzLnBvc2l0aW9uU3R5bGVbJ2xlZnQnXSA9IGAke2Jhc2UgKyB0aGlzLnJlbGF0aXZlUG9zaXRpb24ubGVmdCF9cHhgO1xuICAgICAgfSBlbHNlIGlmICgncmlnaHQnIGluIHRoaXMucmVsYXRpdmVQb3NpdGlvbikge1xuICAgICAgICBjb25zdCBiYXNlID0gaXNJbm5lciA/IHRoaXMuYXRSZWN0IS5yaWdodCA6IHRoaXMuYXRSZWN0IS5sZWZ0O1xuICAgICAgICBjb25zdCByaWdodCA9IGlzSW5uZXIgPyB0aGlzLnJlbGF0aXZlUG9zaXRpb24ucmlnaHQhIDogd2luZG93LmlubmVyV2lkdGggLSBiYXNlICsgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uLnJpZ2h0ITtcbiAgICAgICAgdGhpcy5wb3NpdGlvblN0eWxlWydsZWZ0J10gPSBgJHtpc0lubmVyID8gYmFzZSAtIHJpZ2h0IC0gdGhpcy5mbG9hdFJlY3QhLndpZHRoIDogd2luZG93LmlubmVyV2lkdGggLSByaWdodH1weGA7XG4gICAgICB9XG5cbiAgICAgIC8vIOWeguebtOWumuS9jVxuICAgICAgaWYgKCd0b3AnIGluIHRoaXMucmVsYXRpdmVQb3NpdGlvbikge1xuICAgICAgICBjb25zdCBiYXNlID0gaXNJbm5lciA/IHRoaXMuYXRSZWN0IS50b3AgOiB0aGlzLmF0UmVjdCEuYm90dG9tO1xuICAgICAgICB0aGlzLnBvc2l0aW9uU3R5bGVbJ3RvcCddID0gYCR7YmFzZSArIHRoaXMucmVsYXRpdmVQb3NpdGlvbi50b3AhfXB4YDtcbiAgICAgIH0gZWxzZSBpZiAoJ2JvdHRvbScgaW4gdGhpcy5yZWxhdGl2ZVBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IGJhc2UgPSBpc0lubmVyID8gdGhpcy5hdFJlY3QhLmJvdHRvbSA6IHRoaXMuYXRSZWN0IS50b3A7XG4gICAgICAgIGNvbnN0IGJvdHRvbSA9IGlzSW5uZXIgPyB0aGlzLnJlbGF0aXZlUG9zaXRpb24uYm90dG9tISA6IHdpbmRvdy5pbm5lckhlaWdodCAtIGJhc2UgKyB0aGlzLnJlbGF0aXZlUG9zaXRpb24uYm90dG9tITtcbiAgICAgICAgdGhpcy5wb3NpdGlvblN0eWxlWyd0b3AnXSA9IGAke2lzSW5uZXIgPyBiYXNlIC0gYm90dG9tIC0gdGhpcy5mbG9hdFJlY3QhLmhlaWdodCA6IHdpbmRvdy5pbm5lckhlaWdodCAtIGJvdHRvbX1weGA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIOS9v+eUqOWIneWniyBvZmZzZXQg6K6+572uXG4gICAgICAvLyDmsLTlubPlrprkvY1cbiAgICAgIGlmICh0aGlzLm9mZnNldC5sZWZ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgYmFzZSA9IGlzSW5uZXIgPyB0aGlzLmF0UmVjdCEubGVmdCA6IHRoaXMuYXRSZWN0IS5yaWdodDtcbiAgICAgICAgdGhpcy5wb3NpdGlvblN0eWxlWydsZWZ0J10gPSBgJHtiYXNlICsgdGhpcy5vZmZzZXQubGVmdH1weGA7XG4gICAgICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHsuLi50aGlzLnJlbGF0aXZlUG9zaXRpb24gPz8ge30sIGxlZnQ6IHRoaXMub2Zmc2V0LmxlZnR9O1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9mZnNldC5yaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGJhc2UgPSBpc0lubmVyID8gdGhpcy5hdFJlY3QhLnJpZ2h0IDogdGhpcy5hdFJlY3QhLmxlZnQ7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gaXNJbm5lciA/IHRoaXMub2Zmc2V0LnJpZ2h0IDogd2luZG93LmlubmVyV2lkdGggLSBiYXNlICsgdGhpcy5vZmZzZXQucmlnaHQ7XG4gICAgICAgIHRoaXMucG9zaXRpb25TdHlsZVsnbGVmdCddID0gYCR7aXNJbm5lciA/IGJhc2UgLSByaWdodCAtIHRoaXMuZmxvYXRSZWN0IS53aWR0aCA6IHdpbmRvdy5pbm5lcldpZHRoIC0gcmlnaHR9cHhgO1xuICAgICAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb24gPSB7Li4udGhpcy5yZWxhdGl2ZVBvc2l0aW9uID8/IHt9LCByaWdodDogdGhpcy5vZmZzZXQucmlnaHR9O1xuICAgICAgfVxuXG4gICAgICAvLyDlnoLnm7TlrprkvY1cbiAgICAgIGlmICh0aGlzLm9mZnNldC50b3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBiYXNlID0gaXNJbm5lciA/IHRoaXMuYXRSZWN0IS50b3AgOiB0aGlzLmF0UmVjdCEuYm90dG9tO1xuICAgICAgICB0aGlzLnBvc2l0aW9uU3R5bGVbJ3RvcCddID0gYCR7YmFzZSArIHRoaXMub2Zmc2V0LnRvcH1weGA7XG4gICAgICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHsuLi50aGlzLnJlbGF0aXZlUG9zaXRpb24sIHRvcDogdGhpcy5vZmZzZXQudG9wfTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vZmZzZXQuYm90dG9tICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgYmFzZSA9IGlzSW5uZXIgPyB0aGlzLmF0UmVjdCEuYm90dG9tIDogdGhpcy5hdFJlY3QhLnRvcDtcbiAgICAgICAgY29uc3QgYm90dG9tID0gaXNJbm5lciA/IHRoaXMub2Zmc2V0LmJvdHRvbSA6IHdpbmRvdy5pbm5lckhlaWdodCAtIGJhc2UgKyB0aGlzLm9mZnNldC5ib3R0b207XG4gICAgICAgIHRoaXMucG9zaXRpb25TdHlsZVsndG9wJ10gPSBgJHtpc0lubmVyID8gYmFzZSAtIGJvdHRvbSAtIHRoaXMuZmxvYXRSZWN0IS5oZWlnaHQgOiB3aW5kb3cuaW5uZXJIZWlnaHQgLSBib3R0b219cHhgO1xuICAgICAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb24gPSB7Li4udGhpcy5yZWxhdGl2ZVBvc2l0aW9uLCBib3R0b206IHRoaXMub2Zmc2V0LmJvdHRvbX07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhcHBseUJvdW5kYXJ5KCkge1xuICAgIGlmICghdGhpcy5mbG9hdFJlY3QgfHwgdGhpcy5pZ25vcmVCb3VuZGFyeSB8fCAhdGhpcy5ib3VuZGFyeSkgcmV0dXJuO1xuXG4gICAgY29uc3QgZGVmYXVsdEJvdW5kYXJ5ID0gbmV3IERPTVJlY3QoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgY29uc3QgZWZmZWN0aXZlQm91bmRhcnkgPSB0aGlzLmJvdW5kYXJ5ID09PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPyBkZWZhdWx0Qm91bmRhcnkgOiAodGhpcy5ib3VuZGFyeVJlY3QgfHwgZGVmYXVsdEJvdW5kYXJ5KTtcblxuICAgIC8vIOawtOW5s+e6puadn1xuICAgIGlmICgnbGVmdCcgaW4gdGhpcy5wb3NpdGlvblN0eWxlKSB7XG4gICAgICBjb25zdCBsZWZ0ID0gTWF0aC5tYXgoXG4gICAgICAgIGVmZmVjdGl2ZUJvdW5kYXJ5LmxlZnQsXG4gICAgICAgIE1hdGgubWluKFxuICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5wb3NpdGlvblN0eWxlWydsZWZ0J10pLFxuICAgICAgICAgIGVmZmVjdGl2ZUJvdW5kYXJ5LnJpZ2h0IC0gdGhpcy5mbG9hdFJlY3Qud2lkdGhcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHRoaXMucG9zaXRpb25TdHlsZVsnbGVmdCddID0gYCR7bGVmdH1weGA7XG4gICAgfSBlbHNlIGlmICgncmlnaHQnIGluIHRoaXMucG9zaXRpb25TdHlsZSkge1xuICAgICAgY29uc3QgcmlnaHQgPSBNYXRoLm1heChcbiAgICAgICAgd2luZG93LmlubmVyV2lkdGggLSBlZmZlY3RpdmVCb3VuZGFyeS5yaWdodCxcbiAgICAgICAgTWF0aC5taW4oXG4gICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLnBvc2l0aW9uU3R5bGVbJ3JpZ2h0J10pLFxuICAgICAgICAgIHdpbmRvdy5pbm5lcldpZHRoIC0gZWZmZWN0aXZlQm91bmRhcnkubGVmdCAtIHRoaXMuZmxvYXRSZWN0LndpZHRoXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICB0aGlzLnBvc2l0aW9uU3R5bGVbJ3JpZ2h0J10gPSBgJHtyaWdodH1weGA7XG4gICAgfVxuXG4gICAgLy8g5Z6C55u057qm5p2fXG4gICAgaWYgKCd0b3AnIGluIHRoaXMucG9zaXRpb25TdHlsZSkge1xuICAgICAgY29uc3QgdG9wID0gTWF0aC5tYXgoXG4gICAgICAgIGVmZmVjdGl2ZUJvdW5kYXJ5LnRvcCxcbiAgICAgICAgTWF0aC5taW4oXG4gICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLnBvc2l0aW9uU3R5bGVbJ3RvcCddKSxcbiAgICAgICAgICBlZmZlY3RpdmVCb3VuZGFyeS5ib3R0b20gLSB0aGlzLmZsb2F0UmVjdC5oZWlnaHRcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHRoaXMucG9zaXRpb25TdHlsZVsndG9wJ10gPSBgJHt0b3B9cHhgO1xuICAgIH0gZWxzZSBpZiAoJ2JvdHRvbScgaW4gdGhpcy5wb3NpdGlvblN0eWxlKSB7XG4gICAgICBjb25zdCBib3R0b20gPSBNYXRoLm1heChcbiAgICAgICAgd2luZG93LmlubmVySGVpZ2h0IC0gZWZmZWN0aXZlQm91bmRhcnkuYm90dG9tLFxuICAgICAgICBNYXRoLm1pbihcbiAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMucG9zaXRpb25TdHlsZVsnYm90dG9tJ10pLFxuICAgICAgICAgIHdpbmRvdy5pbm5lckhlaWdodCAtIGVmZmVjdGl2ZUJvdW5kYXJ5LnRvcCAtIHRoaXMuZmxvYXRSZWN0LmhlaWdodFxuICAgICAgICApXG4gICAgICApO1xuICAgICAgdGhpcy5wb3NpdGlvblN0eWxlWydib3R0b20nXSA9IGAke2JvdHRvbX1weGA7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0RHJhZ0V2ZW50cygpIHtcbiAgICBjb25zdCBmbG9hdGluZ0VsZW1lbnQgPSB0aGlzLmZsb2F0aW5nUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5yZW5kZXJlci5saXN0ZW4oZmxvYXRpbmdFbGVtZW50LCAnbW91c2Vkb3duJywgKGU6IE1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZSkpO1xuICAgIHRoaXMucmVuZGVyZXIubGlzdGVuKGRvY3VtZW50LCAnbW91c2Vtb3ZlJywgKGU6IE1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZU1vdmUoZSkpO1xuICAgIHRoaXMucmVuZGVyZXIubGlzdGVuKGRvY3VtZW50LCAnbW91c2V1cCcsICgpID0+IHRoaXMub25Nb3VzZVVwKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCkge1xuICAgIGlmICghdGhpcy5tb3ZhYmxlKSByZXR1cm47XG4gICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcblxuICAgIC8vIOiusOW9lem8oOagh+ebuOWvueS6juWFg+e0oOeahOWBj+enu+mHj1xuICAgIGNvbnN0IHJlY3QgPSB0aGlzLmZsb2F0aW5nUmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGhpcy5zdGFydFggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgIHRoaXMuc3RhcnRZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuaXNEcmFnZ2luZykgcmV0dXJuO1xuXG4gICAgLy8g6K6h566X5paw5L2N572u77yM5L+d5oyB6byg5qCH55u45a+55LqO5YWD57Sg55qE5YGP56e76YeP5LiN5Y+YXG4gICAgY29uc3QgbmV3TGVmdCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLnN0YXJ0WDtcbiAgICBjb25zdCBuZXdUb3AgPSBldmVudC5jbGllbnRZIC0gdGhpcy5zdGFydFk7XG5cbiAgICAvLyDmm7TmlrDkvY3nva7moLflvI9cbiAgICB0aGlzLnBvc2l0aW9uU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgIGxlZnQ6IGAke25ld0xlZnR9cHhgLFxuICAgICAgdG9wOiBgJHtuZXdUb3B9cHhgLFxuICAgIH07XG5cbiAgICAvLyDmm7TmlrDnm7jlr7nkvY3nva7vvIzkv53mjIHkuI7ljp/lp4tvZmZzZXTorr7nva7nm7jlkIznmoTmlrnkvY1cbiAgICBpZiAodGhpcy5hdFJlY3QpIHtcbiAgICAgIGNvbnN0IGlzSW5uZXIgPSB0aGlzLm9mZnNldC5pbm5lciB8fCAhdGhpcy5hdDtcbiAgICAgIGNvbnN0IG5ld1JlbGF0aXZlUG9zaXRpb246IFJlbGF0aXZlUG9zaXRpb24gPSB7fTtcblxuICAgICAgLy8g5rC05bmz5pa55ZCR77ya5qC55o2u5Y6f5aeLb2Zmc2V055qE6K6+572u5Yaz5a6a5L2/55SobGVmdOi/mOaYr3JpZ2h0XG4gICAgICBpZiAodGhpcy5vZmZzZXQubGVmdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGJhc2UgPSBpc0lubmVyID8gdGhpcy5hdFJlY3QubGVmdCA6IHRoaXMuYXRSZWN0LnJpZ2h0O1xuICAgICAgICBuZXdSZWxhdGl2ZVBvc2l0aW9uLmxlZnQgPSBuZXdMZWZ0IC0gYmFzZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vZmZzZXQucmlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBiYXNlID0gaXNJbm5lciA/IHRoaXMuYXRSZWN0LnJpZ2h0IDogdGhpcy5hdFJlY3QubGVmdDtcbiAgICAgICAgaWYgKGlzSW5uZXIpIHtcbiAgICAgICAgICBuZXdSZWxhdGl2ZVBvc2l0aW9uLnJpZ2h0ID0gYmFzZSAtIG5ld0xlZnQgLSB0aGlzLmZsb2F0UmVjdCEud2lkdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3UmVsYXRpdmVQb3NpdGlvbi5yaWdodCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gbmV3TGVmdCAtIGJhc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8g5Z6C55u05pa55ZCR77ya5qC55o2u5Y6f5aeLb2Zmc2V055qE6K6+572u5Yaz5a6a5L2/55SodG9w6L+Y5pivYm90dG9tXG4gICAgICBpZiAodGhpcy5vZmZzZXQudG9wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgYmFzZSA9IGlzSW5uZXIgPyB0aGlzLmF0UmVjdC50b3AgOiB0aGlzLmF0UmVjdC5ib3R0b207XG4gICAgICAgIG5ld1JlbGF0aXZlUG9zaXRpb24udG9wID0gbmV3VG9wIC0gYmFzZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vZmZzZXQuYm90dG9tICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgYmFzZSA9IGlzSW5uZXIgPyB0aGlzLmF0UmVjdC5ib3R0b20gOiB0aGlzLmF0UmVjdC50b3A7XG4gICAgICAgIGlmIChpc0lubmVyKSB7XG4gICAgICAgICAgbmV3UmVsYXRpdmVQb3NpdGlvbi5ib3R0b20gPSBiYXNlIC0gbmV3VG9wIC0gdGhpcy5mbG9hdFJlY3QhLmhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdSZWxhdGl2ZVBvc2l0aW9uLmJvdHRvbSA9IHdpbmRvdy5pbm5lckhlaWdodCAtIG5ld1RvcCAtIGJhc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gbmV3UmVsYXRpdmVQb3NpdGlvbjtcblxuICAgICAgLy8g5Y+q5pyJ5Zyo6K6+572u5LqGYm91bmRhcnnml7bmiY3lupTnlKjovrnnlYznuqbmnZ9cbiAgICAgIGlmICh0aGlzLmJvdW5kYXJ5KSB7XG4gICAgICAgIHRoaXMuYXBwbHlCb3VuZGFyeSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25Nb3VzZVVwKCkge1xuICAgIHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICB9XG5cblxuICAvKipcbiAgICog5pu05paw5rWu5Yqo57uE5Lu25L2N572uXG4gICAqL1xuICB1cGRhdGVGbG9hdGluZ1Bvc2l0aW9uKCkge1xuICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgfVxufVxuIiwiPCEtLSBuZ3gtZmxvYXRpbmcgLS0+XG48ZGl2XG4gICAgI2Zsb2F0aW5nUmVmXG4gICAgW25nU3R5bGVdPVwicG9zaXRpb25TdHlsZVwiXG4gICAgW3N0eWxlLnotaW5kZXhdPVwiekluZGV4XCJcbiAgICBjbGFzcz1cIm5neC1mbG9hdGluZ1wiPlxuICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCIhY29udGVudFwiPlxuICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cImNvbnRlbnRcIj5cbiAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCJpc1RlbXBsYXRlUmVmKGNvbnRlbnQpXCI+XG4gICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cImNvbnRlbnRcIj48L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cImlzQ29tcG9uZW50KGNvbnRlbnQpXCI+XG4gICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAjY29tcG9uZW50Q29udGFpbmVyPjwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XG4gICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiaXNTdHJpbmcoY29udGVudClcIj5cbiAgICAgICAgICAgICAgICB7e2NvbnRlbnR9fVxuICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XG4gICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgIDwvZGl2PlxuPC9kaXY+XG4iXX0=