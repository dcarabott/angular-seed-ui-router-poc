import { appendFileSync } from 'fs';
import { join } from 'path';
import * as utils from 'gulp-util';
import * as Builder from 'systemjs-builder';

import Config from '../../config';

const BUNDLER_OPTIONS = {
  format: 'umd',
  minify: false,
  mangle: false
};

interface Bundle {
  path: string;
  module: string;
}

class BundleNode {
  children: BundleNode[] = [];

  constructor(public path: string) {
  }

  isParent(node: BundleNode) {
    return node.path.startsWith(this.path);
  }
}

class BundleTree {
  roots: BundleNode[] = [];

  static buildTree(paths: string[]) {
    const tree = new BundleTree();
    paths.forEach((p: string) => {
      if (p === '/') {
        throw new Error('Invalid "/" path');
      }
    });
    paths.sort((a: string, b: string) => a.split('/').length - b.split('/').length)
      .forEach(p => tree.addNode(new BundleNode(p)));
    return tree;
  }

  addNode(node: BundleNode) {
    if (!this.roots.length) {
      this.roots.push(node);
    } else {
      const added = this.roots.some((root: BundleNode) => this.addNodeHelper(node, root));
      if (!added) {
        this.roots.push(node);
      }
    }
  }

  private addNodeHelper(node: BundleNode, context: BundleNode): boolean {
    const added: boolean = context.children.reduce((a: boolean, c: BundleNode) => {
      return a || this.addNodeHelper(node, c);
    }, false);
    if (!added && context.isParent(node)) {
      context.children.push(node);
      return true;
    }
    return added;
  }
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
  utils.log('Bundling the bootstrap bundle');
  return builder
    .bundle(mainpath,
      outpath,
      Object.assign({format: 'umd', sourceMaps: true, minify: false, mangle: false, normalize: true}, BUNDLER_OPTIONS))
    .then((res: any) => {
      utils.log('The bootstrap bundle is ready!');
      appendFileSync(outpath, `\nSystem.import('${mainpath}.js');${addExtensions}`);
      return res.modules;
    });
};

const bundleModule = (bundle: string, exclude: string[]): Promise<string[]> => {
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
  console.log(bundle);
  return builder
    .buildStatic(
      expression,
      join(Config.JS_DEST, '..', Config.BOOTSTRAP_DIR, bundle),
      Object.assign({}, BUNDLER_OPTIONS, {format: 'umd', sourceMaps: true}))
    .then((res: any) => {
      utils.log('Bundling of', bundle, 'completed!');
      return res;
    });
};

const bundleModules = (roots: BundleNode[], exclude: string[]): Promise<any> => {
  return Promise.all(roots.map((node: BundleNode) =>
    bundleModule(node.path, exclude)
      .then((directExclude: string[]) => {
        return bundleModules(node.children, exclude.concat(directExclude));
      })));
};

/**
 * Executes the build process, bundling the JavaScript files using the SystemJS builder.
 */
export = (done: any) => {
  const config = normalizeConfig(Config.BUNDLES);
  const bundleTree = BundleTree.buildTree(config);
  bundleMain()
  //.then((bundled: string[]) => bundleModules(bundleTree.roots, bundled))
  //.then(() => {
  //  let builder = new Builder(Config.SYSTEM_BUILDER_CONFIG);
  //  return builder
  //    .buildStatic(join(Config.TMP_DIR, Config.BOOTSTRAP_FACTORY_PROD_MODULE),
  //      join(Config.JS_DEST, Config.MINI_APP_BUNDLE),
  //      BUNDLER_OPTIONS);
  //})
    .then(() => done())
    .catch((e: any) => done(e));
};
