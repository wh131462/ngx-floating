import { ApplicationRef, ComponentFactoryResolver, Injector, TemplateRef, Type } from '@angular/core';
import { Boundary, FloatingOffset, NgxFloatingComponent } from './ngx-floating.component';
import * as i0 from "@angular/core";
export interface NgxFloatingServiceOptions {
    at?: HTMLElement;
    content: TemplateRef<any> | Type<any> | string;
    movable?: boolean;
    offset?: FloatingOffset;
    boundary?: Boundary;
    ignoreBoundary?: boolean;
}
export declare class NgxFloatingService {
    private componentFactoryResolver;
    private appRef;
    private injector;
    private floatingComponents;
    constructor(componentFactoryResolver: ComponentFactoryResolver, appRef: ApplicationRef, injector: Injector);
    /**
     * 创建一个浮动组件
     * @param id 组件唯一标识
     * @param options 配置选项
     */
    create(id: string, options: NgxFloatingServiceOptions): NgxFloatingComponent;
    /**
     * 获取指定ID的浮动组件
     * @param id 组件唯一标识
     */
    get(id: string): NgxFloatingComponent | undefined;
    /**
     * 销毁指定ID的浮动组件
     * @param id 组件唯一标识
     */
    destroy(id: string): void;
    /**
     * 销毁所有浮动组件
     */
    destroyAll(): void;
    /**
     * 显示指定ID的浮动组件
     * @param id 组件唯一标识
     */
    show(id: string): void;
    /**
     * 隐藏指定ID的浮动组件
     * @param id 组件唯一标识
     */
    hide(id: string): void;
    /**
     * 重置指定ID的浮动组件位置
     * @param id 组件唯一标识
     */
    reset(id: string): void;
    /**
     * 更新指定ID的浮动组件位置
     * @param id 组件唯一标识
     */
    updatePosition(id: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxFloatingService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NgxFloatingService>;
}
