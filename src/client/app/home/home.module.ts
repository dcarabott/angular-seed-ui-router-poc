import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { NameListService } from '../shared/name-list/name-list.service';
import { HOME_STATES } from './home.routes';
import { UIRouterModule } from '@uirouter/angular';

@NgModule({
  imports     : [SharedModule,
    UIRouterModule.forChild({
      states: HOME_STATES
    })],
  declarations: [HomeComponent],
  exports     : [HomeComponent],
  providers   : [NameListService]
})
export class HomeModule {
}
