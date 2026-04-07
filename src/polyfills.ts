// Some browser-targeted libraries still probe for the Node-style `global`.
// Angular 21 doesn't provide it by default, so map it to the browser global.
(globalThis as typeof globalThis & { global?: typeof globalThis }).global ??= globalThis;
