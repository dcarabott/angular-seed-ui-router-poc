import { Component, Input } from '@angular/core';
import { Config } from './shared/config/env.config';
import './operators';

/**
 * This class represents the main application component.
 */
@Component({
  moduleId   : module.id,
  selector   : 'sd-app',
  templateUrl: 'app.component.html',
  styleUrls  : ['app.component.css']
})
export class AppComponent {

  @Input() test: string;
  test2: string;

  constructor() {
    console.log('Environment config', Config);
  }
}
