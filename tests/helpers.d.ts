/// <reference path="../typings/tsd.d.ts" />

interface Helpers {
  isFunction(fn: () => {}): Boolean;
  isFirebaseRef(ref: Firebase): Boolean;
}

declare module 'TestHelpers' {
	export = Helpers;
}