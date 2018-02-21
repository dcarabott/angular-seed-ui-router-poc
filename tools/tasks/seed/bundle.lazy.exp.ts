import { appendFileSync } from 'fs';
import { join } from 'path';
import * as Builder from 'systemjs-builder';

import Config from '../../config';
import * as utils from 'gulp-util';

const BUNDLER_OPTIONS = {
  format: 'cjs',
  minify: true,
  mangle: false
};

interface Bundle {
  path: string;
  module: string;
}

const normalizeConfig = (bundles: any[]) => {
  bundles = bundles.map((b: any) => b.path);
  return bundles.map((b: string) => {
    if (!b.endsWith('.js')) {
      b += '.module.ngfactory.js';
    }
    return b;
  });
};


//const addExtensions = `
//System.config({ defaultJSExtensions: true });
//(function () {
//  Object.keys(System.defined).forEach(function (m) {
//    if (!/\.js$/.test(m)) {
//      System.defined[m + '.js'] = System.defined[m];
//    }
//  });
//}());
//`;
const config = JSON.parse(JSON.stringify(Config.SYSTEM_BUILDER_CONFIG));
delete config.paths;
const addExtensions = `
$traceurRuntime = {
  typeof: function (a) {
    return typeof a;
  }
};
System.config(${JSON.stringify(config, null, 2)});
`;

const bundleMain = () => {
  const builder = new Builder(Config.SYSTEM_BUILDER_CONFIG);
  const mainpath = join(Config.TMP_DIR, Config.BOOTSTRAP_FACTORY_PROD_MODULE);
  const outpath = join(Config.JS_DEST, Config.JS_PROD_APP_BUNDLE);
  return builder
    .bundle(mainpath,
      outpath,
      Object.assign({ format: 'umd', sourceMaps: true }, BUNDLER_OPTIONS))
    .then((res: any) => {
      appendFileSync(outpath, `\nSystem.import('${mainpath}.js');${addExtensions}`);
      return res.modules;
    });
};

const bundleModule = (config: Bundle[], exclude: string[], bundle: string) => {
  utils.log('Bundling module with entry file', bundle);
  let builder = new Builder(Config.SYSTEM_BUILDER_CONFIG);
  let all = join(Config.TMP_DIR, Config.BOOTSTRAP_DIR);
  let bootstrap = join(Config.TMP_DIR, Config.BOOTSTRAP_DIR, bundle);
  const parts = bundle.split('/');
  parts.pop();
  let bootstrapDir = join(Config.TMP_DIR, Config.BOOTSTRAP_DIR, parts.join('/'));
  let expression = `${bootstrap} - (${all}/**/*.js - ${bootstrapDir}/**/*.js)`;
  if (exclude.length) {
    expression += ` - ${exclude.join(' - ')}`;
  }
  //console.log(bundle);
  return builder
    .buildStatic(
      expression,
      join(Config.JS_DEST, '..', Config.BOOTSTRAP_DIR, bundle),
      Object.assign({}, BUNDLER_OPTIONS, { format: 'umd', sourceMaps: true }))
    .then((res: any) => {
      console.log(res.modules);
      console.log('Bundled', bundle);
      return res;
    });
};

/**
 * Executes the build process, bundling the JavaScript files using the SystemJS builder.
 */
export = (done: any) => {
  const config = normalizeConfig(Config.BUNDLES);
  bundleMain()
    .then((bundled: string[]) => Promise.all(config.map(bundleModule.bind(null, config, bundled))))
    .then(() => done())
    .catch((e: any) => done(e));
};
