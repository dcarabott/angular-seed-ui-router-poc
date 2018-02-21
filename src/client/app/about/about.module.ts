import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about.component';
import { UIRouterModule } from '@uirouter/angular';
import { ABOUT_STATES } from './about.routes';

@NgModule({
  imports     : [CommonModule,
    UIRouterModule.forChild({
      states: ABOUT_STATES
    })],
  declarations: [AboutComponent],
  exports     : [AboutComponent]
})
export class AboutModule {
}
