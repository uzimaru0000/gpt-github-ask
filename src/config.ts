import { resolve } from 'path';
import appRoot from 'app-root-path';

export const storePath = resolve(appRoot.path, 'tmp', 'embed');
