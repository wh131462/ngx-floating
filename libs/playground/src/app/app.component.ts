import {Component, ElementRef, ViewChild, AfterViewInit, ViewChildren, QueryList, TemplateRef} from '@angular/core';
import { NgxFloatingComponent, NgxFloatingService, NgxFloatingDirective } from "ngx-floating";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxFloatingComponent, NgxFloatingDirective],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('at2') at2!: ElementRef;
  @ViewChild('at2Template') serviceContent!: TemplateRef<any>;
  @ViewChild('directiveTarget') directiveTarget!: ElementRef;
  @ViewChildren('floating1, floating2, floating3') floatingComponents!: QueryList<NgxFloatingComponent>;
  private floatingId = 'service-floating';
  isMovable = true;
  ignoreBoundary = false;
  offset = { top: 10, left: 10, inner: true };
  constructor(private floatingService: NgxFloatingService) {}
  ngAfterViewInit() {
  }

  createFloating() {
    if (!this.at2) return;
    this.floatingService.create(this.floatingId,  {
      at: this.at2.nativeElement,
      content: this.serviceContent,
      movable: true,
      offset: { top: 50, left: 50, inner: true },
    });
  }

  toggleFloating() {
    const floating = this.floatingService.get(this.floatingId);
    if (floating?.isVisible) {
      console.log(floating?.isVisible);
      this.floatingService.hide(this.floatingId);
    } else {
      this.floatingService.show(this.floatingId);
    }
  }

  destroyFloating() {
    this.floatingService.destroy(this.floatingId);
  }

  toggleAllFloating() {
    const components = this.floatingComponents.toArray();
    const allVisible = components.every(comp => comp.isVisible);

    components.forEach(comp => {
      if (allVisible) {
        comp.hide();
      } else {
        comp.show();
      }
    });
  }

}
