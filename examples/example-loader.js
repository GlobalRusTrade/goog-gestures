/**
 * Copyright 2012 Google, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview A simple loader used for importing the library in example
 *     scripts. Real applications should always use the compiled js file in a
 *     <script> tag to ensure efficient loading (or better yet, use
 *     Closure Compiler and include the library directly, greatly reducing the
 *     size of your final JS).
 */

function prepareExample(exampleCallback) {
  var doc = window.document;
  var head = doc.getElementsByTagName('head')[0];

  var devMode = window.location.search.indexOf('uncompiled') != -1;

  if (devMode) {
    // Dev mode - use uncompiled sources/deps/etc
    window.CLOSURE_NO_DEPS = true;
    doc.writeln('<script src="../third_party/closure-library/closure/goog/base.js"></script>');
    doc.writeln('<script src="../gestures_js_uncompiled-deps.js"></script>');
    doc.writeln('<script>goog.require("goog.events.gestures");</script>');

    // Super hacky, but required to ensure all of the goog.require magic works
    window.__exampleCallback = exampleCallback;
    doc.writeln('<script>__exampleCallback();</script>');
  } else {
    // Compiled mode - just the release library with exports
    var script = doc.createElement('script');
    script.src = '../gestures_js_compiled.js';
    script.addEventListener('load', function() {
      exampleCallback.call(window);
    }, false);
    head.appendChild(script);
  }
};
