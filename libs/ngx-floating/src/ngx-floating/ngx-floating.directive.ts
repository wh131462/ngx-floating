import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Directive, ElementRef, EmbeddedViewRef, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NgxFloatingComponent } from './ngx-floating.component';

@Directive({
  selector: '[ngxFloating]',
  standalone: true
})
export class NgxFloatingDirective implements OnInit, OnChanges, OnDestroy {
  @Input("ngxFloating") movable: boolean = false;
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
    this.createFloatingComponent();
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
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NgxFloatingComponent);
    this.componentRef = componentFactory.create(this.injector);
    this.floatingComponent = this.componentRef.instance;

    this.floatingComponent.at = this.at || this.elementRef.nativeElement;
    this.floatingComponent.movable = this.movable;
    if (this.offset) this.floatingComponent.offset = this.offset;
    if (this.boundary) this.floatingComponent.boundary = this.boundary;
    this.floatingComponent.ignoreBoundary = this.ignoreBoundary;
    const parent = this.elementRef.nativeElement.parentElement;
    this.floatingComponent.contentContainer.nativeElement.appendChild(this.elementRef.nativeElement);
    parent.appendChild(this.componentRef.location.nativeElement);
    this.appRef.attachView(this.componentRef.hostView);
  }

  private destroyFloatingComponent() {
    if (this.componentRef) {
      const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      domElem.remove();
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = undefined;
      this.floatingComponent = undefined;
    }
  }

  reset() {
    this.floatingComponent?.reset();
  }

  show() {
    this.floatingComponent?.show();
  }

  hide() {
    this.floatingComponent?.hide();
  }

  updatePosition() {
    this.floatingComponent?.updateFloatingPosition();
  }
}
