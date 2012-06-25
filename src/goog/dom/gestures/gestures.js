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

goog.provide('goog.dom.gestures');

goog.require('goog.dom.gestures.TapRecognizer');


/**
 * Creates a new {@see goog.dom.gestures.TapRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!goog.dom.gestures.CallbackFunction} callback Function called on each
 *     gesture action.
 * @param {Object=} opt_scope Scope that the callback will be called in.
 * @return {!goog.dom.gestures.TapRecognizer} A new bound gesture instance.
 */
goog.dom.gestures.createTapGesture = function(target, callback, opt_scope) {
  var recognizer = new goog.dom.gestures.TapRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};
