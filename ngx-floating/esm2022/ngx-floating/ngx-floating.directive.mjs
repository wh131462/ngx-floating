import { Directive, Input } from '@angular/core';
import { NgxFloatingComponent } from './ngx-floating.component';
import * as i0 from "@angular/core";
export class NgxFloatingDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWZsb2F0aW5nLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYnMvbmd4LWZsb2F0aW5nL3NyYy9uZ3gtZmxvYXRpbmcvbmd4LWZsb2F0aW5nLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTBELFNBQVMsRUFBeUMsS0FBSyxFQUErQyxNQUFNLGVBQWUsQ0FBQztBQUM3TCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7QUFNaEUsTUFBTSxPQUFPLG9CQUFvQjtJQVc3QixZQUNZLFVBQXNCLEVBQ3RCLHdCQUFrRCxFQUNsRCxNQUFzQixFQUN0QixRQUFrQjtRQUhsQixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQWRyQixnQkFBVyxHQUFZLElBQUksQ0FBQztRQUM1QixZQUFPLEdBQVksS0FBSyxDQUFDO1FBSXpCLG1CQUFjLEdBQVksS0FBSyxDQUFDO0lBVXRDLENBQUM7SUFFSixRQUFRO1FBQ0osSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0I7UUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUI7WUFBRSxPQUFPO1FBRXBDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2xELENBQUM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdB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QUNILElBQUk7UUFDQSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNBLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxjQUFjO1FBQ1YsSUFBSSxDQUFDLGlCQUFpQixFQUFFLHNCQUFzQixFQUFFLENBQUM7SUFDckQsQ0FBQzsrR0FuSFEsb0JBQW9CO21HQUFwQixvQkFBb0I7OzRGQUFwQixvQkFBb0I7a0JBSmhDLFNBQVM7bUJBQUM7b0JBQ1AsUUFBUSxFQUFFLGVBQWU7b0JBQ3pCLFVBQVUsRUFBRSxJQUFJO2lCQUNuQjswS0FFWSxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLE9BQU87c0JBQWYsS0FBSztnQkFDRyxFQUFFO3NCQUFWLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csY0FBYztzQkFBdEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcGxpY2F0aW9uUmVmLCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIENvbXBvbmVudFJlZiwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFbWJlZGRlZFZpZXdSZWYsIEluamVjdG9yLCBJbnB1dCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2ltcGxlQ2hhbmdlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmd4RmxvYXRpbmdDb21wb25lbnQgfSBmcm9tICcuL25neC1mbG9hdGluZy5jb21wb25lbnQnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tuZ3hGbG9hdGluZ10nLFxuICAgIHN0YW5kYWxvbmU6IHRydWVcbn0pXG5leHBvcnQgY2xhc3MgTmd4RmxvYXRpbmdEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgICBASW5wdXQoKSBuZ3hGbG9hdGluZzogYm9vbGVhbiA9IHRydWU7XG4gICAgQElucHV0KCkgbW92YWJsZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIGF0PzogSFRNTEVsZW1lbnQ7XG4gICAgQElucHV0KCkgb2Zmc2V0OiBhbnk7XG4gICAgQElucHV0KCkgYm91bmRhcnk6IGFueTtcbiAgICBASW5wdXQoKSBpZ25vcmVCb3VuZGFyeTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBmbG9hdGluZ0NvbXBvbmVudD86IE5neEZsb2F0aW5nQ29tcG9uZW50O1xuICAgIHByaXZhdGUgY29tcG9uZW50UmVmPzogQ29tcG9uZW50UmVmPE5neEZsb2F0aW5nQ29tcG9uZW50PjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgIHByaXZhdGUgYXBwUmVmOiBBcHBsaWNhdGlvblJlZixcbiAgICAgICAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3JcbiAgICApIHt9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMubmd4RmxvYXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRmxvYXRpbmdDb21wb25lbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmZsb2F0aW5nQ29tcG9uZW50KSByZXR1cm47XG5cbiAgICAgICAgaWYgKGNoYW5nZXNbJ21vdmFibGUnXSkge1xuICAgICAgICAgICAgdGhpcy5mbG9hdGluZ0NvbXBvbmVudC5tb3ZhYmxlID0gdGhpcy5tb3ZhYmxlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzWydhdCddKSB7XG4gICAgICAgICAgICB0aGlzLmZsb2F0aW5nQ29tcG9uZW50LmF0ID0gdGhpcy5hdCB8fCB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlc1snb2Zmc2V0J10pIHtcbiAgICAgICAgICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnQub2Zmc2V0ID0gdGhpcy5vZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXNbJ2JvdW5kYXJ5J10pIHtcbiAgICAgICAgICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnQuYm91bmRhcnkgPSB0aGlzLmJvdW5kYXJ5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzWydpZ25vcmVCb3VuZGFyeSddKSB7XG4gICAgICAgICAgICB0aGlzLmZsb2F0aW5nQ29tcG9uZW50Lmlnbm9yZUJvdW5kYXJ5ID0gdGhpcy5pZ25vcmVCb3VuZGFyeTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLmRlc3Ryb3lGbG9hdGluZ0NvbXBvbmVudCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlRmxvYXRpbmdDb21wb25lbnQoKSB7XG4gICAgICAgIC8vIOWIm+W7uue7hOS7tuW3peWOglxuICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5ID0gdGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoTmd4RmxvYXRpbmdDb21wb25lbnQpO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu657uE5Lu2XG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmID0gY29tcG9uZW50RmFjdG9yeS5jcmVhdGUodGhpcy5pbmplY3Rvcik7XG4gICAgICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudFJlZi5pbnN0YW5jZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9rue7hOS7tuWxnuaAp1xuICAgICAgICB0aGlzLmZsb2F0aW5nQ29tcG9uZW50LmF0ID0gdGhpcy5hdCB8fCB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5mbG9hdGluZ0NvbXBvbmVudC5tb3ZhYmxlID0gdGhpcy5tb3ZhYmxlO1xuICAgICAgICBpZiAodGhpcy5vZmZzZXQpIHRoaXMuZmxvYXRpbmdDb21wb25lbnQub2Zmc2V0ID0gdGhpcy5vZmZzZXQ7XG4gICAgICAgIGlmICh0aGlzLmJvdW5kYXJ5KSB0aGlzLmZsb2F0aW5nQ29tcG9uZW50LmJvdW5kYXJ5ID0gdGhpcy5ib3VuZGFyeTtcbiAgICAgICAgdGhpcy5mbG9hdGluZ0NvbXBvbmVudC5pZ25vcmVCb3VuZGFyeSA9IHRoaXMuaWdub3JlQm91bmRhcnk7XG5cbiAgICAgICAgLy8g5bCG57uE5Lu25re75Yqg5YiwRE9NXG4gICAgICAgIGNvbnN0IGRvbUVsZW0gPSAodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb21FbGVtKTtcblxuICAgICAgICAvLyDlsIbnu4Tku7bmt7vliqDliLBBcHBsaWNhdGlvblJlZlxuICAgICAgICB0aGlzLmFwcFJlZi5hdHRhY2hWaWV3KHRoaXMuY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlc3Ryb3lGbG9hdGluZ0NvbXBvbmVudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50UmVmKSB7XG4gICAgICAgICAgICAvLyDku45ET03kuK3np7vpmaTnu4Tku7ZcbiAgICAgICAgICAgIGNvbnN0IGRvbUVsZW0gPSAodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIGRvbUVsZW0ucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgIC8vIOS7jkFwcGxpY2F0aW9uUmVm5Lit5YiG56a76KeG5Zu+XG4gICAgICAgICAgICB0aGlzLmFwcFJlZi5kZXRhY2hWaWV3KHRoaXMuY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcblxuICAgICAgICAgICAgLy8g6ZSA5q+B57uE5Lu2XG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudFJlZi5kZXN0cm95KCk7XG5cbiAgICAgICAgICAgIC8vIOa4heeQhuW8leeUqFxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRSZWYgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLmZsb2F0aW5nQ29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6YeN572u5rWu5Yqo57uE5Lu25Yiw5Yid5aeL5L2N572uXG4gICAgICovXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnQ/LnJlc2V0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5pi+56S65rWu5Yqo57uE5Lu2XG4gICAgICovXG4gICAgc2hvdygpIHtcbiAgICAgICAgdGhpcy5mbG9hdGluZ0NvbXBvbmVudD8uc2hvdygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmakOiXj+a1ruWKqOe7hOS7tlxuICAgICAqL1xuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnQ/LmhpZGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmm7TmlrDmta7liqjnu4Tku7bkvY3nva5cbiAgICAgKi9cbiAgICB1cGRhdGVQb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5mbG9hdGluZ0NvbXBvbmVudD8udXBkYXRlRmxvYXRpbmdQb3NpdGlvbigpO1xuICAgIH1cbn0iXX0=