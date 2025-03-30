import { Injectable } from '@angular/core';
import { NgxFloatingComponent } from './ngx-floating.component';
import * as i0 from "@angular/core";
export class NgxFloatingService {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWZsb2F0aW5nLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWJzL25neC1mbG9hdGluZy9zcmMvbmd4LWZsb2F0aW5nL25neC1mbG9hdGluZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFLTCxVQUFVLEVBSVgsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUEyQixvQkFBb0IsRUFBQyxNQUFNLDBCQUEwQixDQUFDOztBQWV4RixNQUFNLE9BQU8sa0JBQWtCO0lBRzdCLFlBQ1Usd0JBQWtELEVBQ2xELE1BQXNCLEVBQ3RCLFFBQWtCO1FBRmxCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUxwQix1QkFBa0IsR0FBb0QsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQU94RixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxFQUFVLEVBQUUsT0FBa0M7UUFDbkQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELFNBQVM7UUFDVCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3JHLE9BQU87UUFDUCxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7UUFDeEMsU0FBUztRQUNULFNBQVMsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUMxQixTQUFTLENBQUMs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LENBQUMsRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxFQUFVO1FBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDckUsQ0FBQzsrR0F4SFUsa0JBQWtCO21IQUFsQixrQkFBa0IsY0FGakIsTUFBTTs7NEZBRVAsa0JBQWtCO2tCQUg5QixVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFwcGxpY2F0aW9uUmVmLFxuICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gIENvbXBvbmVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBJbmplY3RhYmxlLFxuICBJbmplY3RvcixcbiAgVGVtcGxhdGVSZWYsXG4gIFR5cGVcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0JvdW5kYXJ5LCBGbG9hdGluZ09mZnNldCwgTmd4RmxvYXRpbmdDb21wb25lbnR9IGZyb20gJy4vbmd4LWZsb2F0aW5nLmNvbXBvbmVudCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmd4RmxvYXRpbmdTZXJ2aWNlT3B0aW9ucyB7XG4gIGF0PzogSFRNTEVsZW1lbnQ7XG4gIGNvbnRlbnQ6IFRlbXBsYXRlUmVmPGFueT4gfCBUeXBlPGFueT4gfCBzdHJpbmc7XG4gIG1vdmFibGU/OiBib29sZWFuO1xuICBvZmZzZXQ/OiBGbG9hdGluZ09mZnNldDtcbiAgYm91bmRhcnk/OiBCb3VuZGFyeTtcbiAgaWdub3JlQm91bmRhcnk/OiBib29sZWFuO1xufVxuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIE5neEZsb2F0aW5nU2VydmljZSB7XG4gIHByaXZhdGUgZmxvYXRpbmdDb21wb25lbnRzOiBNYXA8c3RyaW5nLCBDb21wb25lbnRSZWY8Tmd4RmxvYXRpbmdDb21wb25lbnQ+PiA9IG5ldyBNYXAoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIHByaXZhdGUgYXBwUmVmOiBBcHBsaWNhdGlvblJlZixcbiAgICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvclxuICApIHtcbiAgfVxuXG4gIC8qKlxuICAgKiDliJvlu7rkuIDkuKrmta7liqjnu4Tku7ZcbiAgICogQHBhcmFtIGlkIOe7hOS7tuWUr+S4gOagh+ivhlxuICAgKiBAcGFyYW0gb3B0aW9ucyDphY3nva7pgInpoblcbiAgICovXG4gIGNyZWF0ZShpZDogc3RyaW5nLCBvcHRpb25zOiBOZ3hGbG9hdGluZ1NlcnZpY2VPcHRpb25zKSB7XG4gICAgaWYgKHRoaXMuZmxvYXRpbmdDb21wb25lbnRzLmhhcyhpZCkpIHtcbiAgICAgIGNvbnNvbGUud2Fybihg5rWu5Yqo57uE5Lu2ICR7aWR9IOW3suWtmOWcqGApO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uue7hOS7tuW3peWOglxuICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnkgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShOZ3hGbG9hdGluZ0NvbXBvbmVudCk7XG4gICAgLy8g5Yib5bu657uE5Lu2XG4gICAgY29uc3QgY29tcG9uZW50UmVmID0gY29tcG9uZW50RmFjdG9yeS5jcmVhdGUodGhpcy5pbmplY3Rvcik7XG4gICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50UmVmLmluc3RhbmNlO1xuICAgIC8vIOiuvue9rue7hOS7tuWxnuaAp1xuICAgIGNvbXBvbmVudC5hdCA9IG9wdGlvbnMuYXQ7XG4gICAgY29tcG9uZW50Lm1vdmFibGUgPSBvcHRpb25zLm1vdmFibGUgfHwgZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMub2Zmc2V0KSBjb21wb25lbnQub2Zmc2V0ID0gb3B0aW9ucy5vZmZzZXQ7XG4gICAgaWYgKG9wdGlvbnMuYm91bmRhcnkpIGNvbXBvbmVudC5ib3VuZGFyeSA9IG9wdGlvbnMuYm91bmRhcnk7XG4gICAgY29tcG9uZW50Lmlnbm9yZUJvdW5kYXJ5ID0gb3B0aW9ucy5pZ25vcmVCb3VuZGFyeSB8fCBmYWxzZTtcbiAgICBjb21wb25lbnQuY29udGVudCA9IG9wdGlvbnMuY29udGVudDtcblxuICAgIC8vIOWwhue7hOS7tua3u+WKoOWIsEFwcGxpY2F0aW9uUmVmXG4gICAgdGhpcy5hcHBSZWYuYXR0YWNoVmlldyhjb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuXG4gICAgLy8g5bCG57uE5Lu25re75Yqg5YiwRE9NXG4gICAgY29uc3QgZG9tRWxlbSA9IChjb21wb25lbnRSZWYuaG9zdFZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvbUVsZW0pO1xuXG4gICAgdGhpcy5mbG9hdGluZ0NvbXBvbmVudHMuc2V0KGlkLCBjb21wb25lbnRSZWYpO1xuICAgIHJldHVybiBjb21wb25lbnQ7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5oyH5a6aSUTnmoTmta7liqjnu4Tku7ZcbiAgICogQHBhcmFtIGlkIOe7hOS7tuWUr+S4gOagh+ivhlxuICAgKi9cbiAgZ2V0KGlkOiBzdHJpbmcpOiBOZ3hGbG9hdGluZ0NvbXBvbmVudCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZmxvYXRpbmdDb21wb25lbnRzLmdldChpZCk/Lmluc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIOmUgOavgeaMh+WumklE55qE5rWu5Yqo57uE5Lu2XG4gICAqIEBwYXJhbSBpZCDnu4Tku7bllK/kuIDmoIfor4ZcbiAgICovXG4gIGRlc3Ryb3koaWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IHRoaXMuZmxvYXRpbmdDb21wb25lbnRzLmdldChpZCk7XG4gICAgaWYgKGNvbXBvbmVudFJlZikge1xuICAgICAgLy8g5LuORE9N5Lit56e76Zmk57uE5Lu2XG4gICAgICBjb25zdCBkb21FbGVtID0gKGNvbXBvbmVudFJlZi5ob3N0VmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8YW55Pikucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50O1xuICAgICAgZG9tRWxlbS5yZW1vdmUoKTtcblxuICAgICAgLy8g5LuOQXBwbGljYXRpb25SZWbkuK3liIbnprvop4blm75cbiAgICAgIHRoaXMuYXBwUmVmLmRldGFjaFZpZXcoY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcblxuICAgICAgLy8g6ZSA5q+B57uE5Lu2XG4gICAgICBjb21wb25lbnRSZWYuZGVzdHJveSgpO1xuICAgICAgdGhpcy5mbG9hdGluZ0NvbXBvbmVudHMuZGVsZXRlKGlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog6ZSA5q+B5omA5pyJ5rWu5Yqo57uE5Lu2XG4gICAqL1xuICBkZXN0cm95QWxsKCkge1xuICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnRzLmZvckVhY2goY29tcG9uZW50UmVmID0+IHtcbiAgICAgIC8vIOS7jkRPTeS4reenu+mZpOe7hOS7tlxuICAgICAgY29uc3QgZG9tRWxlbSA9IChjb21wb25lbnRSZWYuaG9zdFZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudDtcbiAgICAgIGRvbUVsZW0ucmVtb3ZlKCk7XG5cbiAgICAgIC8vIOS7jkFwcGxpY2F0aW9uUmVm5Lit5YiG56a76KeG5Zu+XG4gICAgICB0aGlzLmFwcFJlZi5kZXRhY2hWaWV3KGNvbXBvbmVudFJlZi5ob3N0Vmlldyk7XG5cbiAgICAgIC8vIOmUgOavgee7hOS7tlxuICAgICAgY29tcG9uZW50UmVmLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgICB0aGlzLmZsb2F0aW5nQ29tcG9uZW50cy5jbGVhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIOaYvuekuuaMh+WumklE55qE5rWu5Yqo57uE5Lu2XG4gICAqIEBwYXJhbSBpZCDnu4Tku7bllK/kuIDmoIfor4ZcbiAgICovXG4gIHNob3coaWQ6IHN0cmluZykge1xuICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnRzLmdldChpZCk/Lmluc3RhbmNlLnNob3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDpmpDol4/mjIflrppJROeahOa1ruWKqOe7hOS7tlxuICAgKiBAcGFyYW0gaWQg57uE5Lu25ZSv5LiA5qCH6K+GXG4gICAqL1xuICBoaWRlKGlkOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZsb2F0aW5nQ29tcG9uZW50cy5nZXQoaWQpPy5pbnN0YW5jZS5oaWRlKCk7XG4gIH1cblxuICAvKipcbiAgICog6YeN572u5oyH5a6aSUTnmoTmta7liqjnu4Tku7bkvY3nva5cbiAgICogQHBhcmFtIGlkIOe7hOS7tuWUr+S4gOagh+ivhlxuICAgKi9cbiAgcmVzZXQoaWQ6IHN0cmluZykge1xuICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnRzLmdldChpZCk/Lmluc3RhbmNlLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICog5pu05paw5oyH5a6aSUTnmoTmta7liqjnu4Tku7bkvY3nva5cbiAgICogQHBhcmFtIGlkIOe7hOS7tuWUr+S4gOagh+ivhlxuICAgKi9cbiAgdXBkYXRlUG9zaXRpb24oaWQ6IHN0cmluZykge1xuICAgIHRoaXMuZmxvYXRpbmdDb21wb25lbnRzLmdldChpZCk/Lmluc3RhbmNlLnVwZGF0ZUZsb2F0aW5nUG9zaXRpb24oKTtcbiAgfVxufVxuIl19