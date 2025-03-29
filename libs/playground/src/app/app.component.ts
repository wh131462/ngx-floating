import { Component, ElementRef, ViewChild, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { NgxFloatingComponent, NgxFloatingService } from "ngx-floating";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxFloatingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('at2') at2!: ElementRef;
  @ViewChild('serviceContent') serviceContent!: ElementRef;
  @ViewChildren('floating1, floating2, floating3') floatingComponents!: QueryList<NgxFloatingComponent>;

  private floatingId = 'service-floating';

  constructor(private floatingService: NgxFloatingService) {}

  ngAfterViewInit() {
    this.initServiceFloating();
  }

  private initServiceFloating() {
    if (!this.at2) return;
    this.floatingService.create(this.floatingId,  {
      at: this.at2.nativeElement,
      movable: true,
      offset: { top: 50, left: 50 },
    });
  }

  toggleFloating() {
    const floating = this.floatingService.get(this.floatingId);
    if (floating?.isVisible) {
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
