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

goog.require('goog.asserts');
goog.require('goog.dom.gestures.PanRecognizer');
goog.require('goog.dom.gestures.PinchRecognizer');
goog.require('goog.dom.gestures.SwipeRecognizer');
goog.require('goog.dom.gestures.TapRecognizer');


// TODO(benvanik): RotationRecognizer
// TODO(benvanik): LongPressRecognizer


/**
 * Creates a new {@see goog.dom.gestures.PanRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!goog.dom.gestures.CallbackFunction} callback Function called on each
 *     gesture action.
 * @param {Object=} opt_scope Scope that the callback will be called in.
 * @return {!goog.dom.gestures.PanRecognizer} A new bound gesture instance.
 */
goog.dom.gestures.createPanGesture = function(target, callback, opt_scope) {
  var recognizer = new goog.dom.gestures.PanRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};


/**
 * Creates a new {@see goog.dom.gestures.PinchRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!goog.dom.gestures.CallbackFunction} callback Function called on each
 *     gesture action.
 * @param {Object=} opt_scope Scope that the callback will be called in.
 * @return {!goog.dom.gestures.PinchRecognizer} A new bound gesture instance.
 */
goog.dom.gestures.createPinchGesture = function(target, callback, opt_scope) {
  var recognizer = new goog.dom.gestures.PinchRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};


/**
 * Creates a new {@see goog.dom.gestures.SwipeRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!goog.dom.gestures.CallbackFunction} callback Function called on each
 *     gesture action.
 * @param {Object=} opt_scope Scope that the callback will be called in.
 * @return {!goog.dom.gestures.SwipeRecognizer} A new bound gesture instance.
 */
goog.dom.gestures.createSwipeGesture = function(target, callback, opt_scope) {
  var recognizer = new goog.dom.gestures.SwipeRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};


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


/**
 * Allows for symmetrical simultaneous recognition of the given list of
 * gesture recognizers.
 * @param {...!goog.dom.gestures.Recognizer} var_args Recognizers that are
 *     allowed to simultaneously recognize.
 */
goog.dom.gestures.allowSimultaneousRecognition = function(var_args) {
  for (var n = 0; n < arguments.length; n++) {
    var target = /** @type {goog.dom.gestures.Recognizer} */ (arguments[n]);
    goog.asserts.assert(target);
    for (var m = 0; m < arguments.length; m++) {
      if (n != m) {
        var other = /** @type {goog.dom.gestures.Recognizer} */ (arguments[m]);
        goog.asserts.assert(other);
        target.addAllowedSimultaneousRecognizer(other);
      }
    }
  }
};
