import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

import { AboutModule } from './about/about.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';

import { UIRouter, UIRouterModule, UIView } from '@uirouter/angular';
import { APP_STATES } from './app.routes';
import { StickyStatesPlugin } from '@uirouter/sticky-states';

@NgModule({
  imports     : [
    BrowserModule,
    HttpClientModule,
    //AboutModule,
    //HomeModule,
    SharedModule.forRoot(),
    UIRouterModule.forRoot({
      states: APP_STATES,
      config: uiRouterConfigFn
    })],
  declarations: [AppComponent],
  providers   : [{
    provide : APP_BASE_HREF,
    useValue: '<%= APP_BASE %>'
  }],
  bootstrap   : [UIView]

})
export class AppModule {
}

export function uiRouterConfigFn(router: UIRouter) {
  router.urlService.config.strictMode(false);
  router.plugin(StickyStatesPlugin);
}
