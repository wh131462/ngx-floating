import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { NgxFloatingComponent } from './ngx-floating.component';
import { Boundary, FloatingOffset } from './ngx-floating.component';
interface NgxFloatingServiceOptions {
    at?: HTMLElement;
    movable?: boolean;
    offset?: FloatingOffset;
    boundary?: Boundary;
    ignoreBoundary?: boolean;
}


@Injectable({
    providedIn: 'root'
})
export class NgxFloatingService {
    private floatingComponents: Map<string, NgxFloatingComponent> = new Map();

    /**
     * 创建一个浮动组件
     * @param id 组件唯一标识
     * @param options 配置选项
     */
    create(id: string, options:NgxFloatingServiceOptions = {}) {
        if (this.floatingComponents.has(id)) {
            throw new Error(`浮动组件 ${id} 已存在`);
        }

        const component = new NgxFloatingComponent(document.createElement('div') as any, document.createElement('div') as any);
        component.at = options.at;
        component.movable = options.movable || false;
        if (options.offset) component.offset = options.offset;
        if (options.boundary) component.boundary = options.boundary;
        component.ignoreBoundary = options.ignoreBoundary || false;
        this.floatingComponents.set(id, component);
        return component;
    }

    /**
     * 获取指定ID的浮动组件
     * @param id 组件唯一标识
     */
    get(id: string): NgxFloatingComponent | undefined {
        return this.floatingComponents.get(id);
    }

    /**
     * 销毁指定ID的浮动组件
     * @param id 组件唯一标识
     */
    destroy(id: string) {
        const component = this.floatingComponents.get(id);
        if (component) {
            component.ngOnDestroy();
            this.floatingComponents.delete(id);
        }
    }

    /**
     * 销毁所有浮动组件
     */
    destroyAll() {
        this.floatingComponents.forEach(component => component.ngOnDestroy());
        this.floatingComponents.clear();
    }

    /**
     * 显示指定ID的浮动组件
     * @param id 组件唯一标识
     */
    show(id: string) {
        this.floatingComponents.get(id)?.show();
    }

    /**
     * 隐藏指定ID的浮动组件
     * @param id 组件唯一标识
     */
    hide(id: string) {
        this.floatingComponents.get(id)?.hide();
    }

    /**
     * 重置指定ID的浮动组件位置
     * @param id 组件唯一标识
     */
    reset(id: string) {
        this.floatingComponents.get(id)?.reset();
    }

    /**
     * 更新指定ID的浮动组件位置
     * @param id 组件唯一标识
     */
    updatePosition(id: string) {
        this.floatingComponents.get(id)?.updateFloatingPosition();
    }
}
