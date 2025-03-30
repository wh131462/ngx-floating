import { AfterViewInit, ChangeDetectorRef, ComponentFactoryResolver, ElementRef, OnChanges, OnDestroy, Renderer2, SimpleChanges, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
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
export declare class NgxFloatingComponent implements AfterViewInit, OnChanges, OnDestroy {
    private cdr;
    private renderer;
    private componentFactoryResolver;
    movable: boolean;
    /**
     * 目标元素，用于定位浮动组件的位置。
     * 如果不设置，浮动组件将以整个窗口作为参考对象。
     */
    at?: HTMLElement;
    offset: FloatingOffset;
    zIndex: number;
    isVisible: boolean;
    boundary: Boundary;
    ignoreBoundary: boolean;
    content?: TemplateRef<any> | Type<any> | string;
    positionStyle: {
        [key: string]: string;
    };
    private relativePosition?;
    private boundaryRect?;
    private floatRect?;
    private atRect?;
    private observer;
    floatingRef: ElementRef;
    componentContainer: ViewContainerRef;
    private isDragging;
    private startX;
    private startY;
    private componentRef?;
    constructor(cdr: ChangeDetectorRef, renderer: Renderer2, componentFactoryResolver: ComponentFactoryResolver);
    get cursor(): "move" | "default";
    get isHidden(): "hidden" | "visible";
    ngOnChanges(changes: SimpleChanges): void;
    isTemplateRef(content: any): content is TemplateRef<any>;
    isComponent(content: any): content is Type<any>;
    isString(content: any): content is string;
    private renderComponent;
    private validateOffset;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    /**
     * 显示浮动组件
     */
    show(): void;
    /**
     * 隐藏浮动组件
     */
    hide(): void;
    /**
     * 重置浮动组件到初始位置
     */
    reset(): void;
    private initObserver;
    private updatePosition;
    private calcRects;
    private calcBoundaryRect;
    private applyPosition;
    private applyBoundary;
    private initDragEvents;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    /**
     * 更新浮动组件位置
     */
    updateFloatingPosition(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxFloatingComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxFloatingComponent, "ngx-floating", never, { "movable": { "alias": "movable"; "required": false; }; "at": { "alias": "at"; "required": false; }; "offset": { "alias": "offset"; "required": false; }; "zIndex": { "alias": "zIndex"; "required": false; }; "isVisible": { "alias": "isVisible"; "required": false; }; "boundary": { "alias": "boundary"; "required": false; }; "ignoreBoundary": { "alias": "ignoreBoundary"; "required": false; }; "content": { "alias": "content"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_movable: string | boolean;
}
