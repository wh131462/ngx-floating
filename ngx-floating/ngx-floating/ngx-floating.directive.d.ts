import { ApplicationRef, ComponentFactoryResolver, ElementRef, Injector, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NgxFloatingDirective implements OnInit, OnChanges, OnDestroy {
    private elementRef;
    private componentFactoryResolver;
    private appRef;
    private injector;
    ngxFloating: boolean;
    movable: boolean;
    at?: HTMLElement;
    offset: any;
    boundary: any;
    ignoreBoundary: boolean;
    private floatingComponent?;
    private componentRef?;
    constructor(elementRef: ElementRef, componentFactoryResolver: ComponentFactoryResolver, appRef: ApplicationRef, injector: Injector);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private createFloatingComponent;
    private destroyFloatingComponent;
    /**
     * 重置浮动组件到初始位置
     */
    reset(): void;
    /**
     * 显示浮动组件
     */
    show(): void;
    /**
     * 隐藏浮动组件
     */
    hide(): void;
    /**
     * 更新浮动组件位置
     */
    updatePosition(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxFloatingDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgxFloatingDirective, "[ngxFloating]", never, { "ngxFloating": { "alias": "ngxFloating"; "required": false; }; "movable": { "alias": "movable"; "required": false; }; "at": { "alias": "at"; "required": false; }; "offset": { "alias": "offset"; "required": false; }; "boundary": { "alias": "boundary"; "required": false; }; "ignoreBoundary": { "alias": "ignoreBoundary"; "required": false; }; }, {}, never, never, true, never>;
}
