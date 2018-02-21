import { Ng2StateDeclaration } from '@uirouter/angular';
import { AboutComponent } from './about.component';

export let ABOUT_STATES: Ng2StateDeclaration[] = [
  {
    name : 'app.about',
    url  : '/about',
    views: {
      'content': {component: AboutComponent}
    }
  }
];
