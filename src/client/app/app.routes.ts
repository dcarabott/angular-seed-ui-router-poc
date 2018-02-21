import { AppComponent } from './app.component';
import { Ng2StateDeclaration } from '@uirouter/angular';

export let APP_STATES: Ng2StateDeclaration[] = [
  {
    name     : 'app',
    url      : '/',
    component: AppComponent,
    resolve  : [
      {
        token    : 'test',
        resolveFn: testResolver
      }
    ]
  }
];

export function testResolver() {
  return new Promise((resolve, reject) => {
    resolve('test');
  });
}
