import { join } from 'path';
import * as Builder from 'systemjs-builder';

import Config from '../../config';
import * as utils from 'gulp-util';
import { appendFileSync } from "fs";

const BUNDLER_OPTIONS = {
  format: 'cjs',
  minify: true,
  mangle: false,
  sourceMaps: Config.PRESERVE_SOURCE_MAPS
};

/**
 * Executes the build process, bundling the JavaScript files using the SystemJS builder.
 */
export = (done: any) => {
  const builder = new Builder(Config.SYSTEM_BUILDER_CONFIG);
  builder
    .buildStatic(join(Config.TMP_DIR, Config.BOOTSTRAP_FACTORY_PROD_MODULE),
      join(Config.JS_DEST, Config.JS_PROD_APP_BUNDLE),
      BUNDLER_OPTIONS)
    .then(() => done())
    .catch((err: any) => done(err));
};
