import { d as defineEventHandler, a as setResponseHeader } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const sw_js_get = defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "application/javascript; charset=utf-8");
  return "self.addEventListener('install', () => self.skipWaiting());";
});

export { sw_js_get as default };
//# sourceMappingURL=sw.js.get.mjs.map
