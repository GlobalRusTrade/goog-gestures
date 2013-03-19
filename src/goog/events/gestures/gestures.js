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

goog.provide('goog.events.gestures');

goog.require('goog.asserts');
goog.require('goog.events.gestures.PanRecognizer');
goog.require('goog.events.gestures.PinchRecognizer');
goog.require('goog.events.gestures.RotateRecognizer');
goog.require('goog.events.gestures.SwipeRecognizer');
goog.require('goog.events.gestures.TapRecognizer');
goog.require('goog.events.gestures.TouchView');


/**
 * Creates a new {@see goog.events.gestures.PanRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!function(this:T, !goog.events.gestures.Recognizer)} callback
 *     Function called on each gesture action.
 * @param {T=} opt_scope Scope that the callback will be called in.
 * @return {!goog.events.gestures.PanRecognizer} A new bound gesture instance.
 * @template T
 */
goog.events.gestures.attachPanGesture =
    function(target, callback, opt_scope) {
  var recognizer = new goog.events.gestures.PanRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};


/**
 * Creates a new {@see goog.events.gestures.PinchRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!function(this:T, !goog.events.gestures.Recognizer)} callback
 *     Function called on each gesture action.
 * @param {T=} opt_scope Scope that the callback will be called in.
 * @return {!goog.events.gestures.PinchRecognizer} A new bound gesture instance.
 * @template T
 */
goog.events.gestures.attachPinchGesture =
    function(target, callback, opt_scope) {
  var recognizer = new goog.events.gestures.PinchRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};


/**
 * Creates a new {@see goog.events.gestures.RotateRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!function(this:T, !goog.events.gestures.Recognizer)} callback
 *     Function called on each gesture action.
 * @param {T=} opt_scope Scope that the callback will be called in.
 * @return {!goog.events.gestures.RotateRecognizer} A new bound gesture
 *     instance.
 * @template T
 */
goog.events.gestures.attachRotateGesture =
    function(target, callback, opt_scope) {
  var recognizer = new goog.events.gestures.RotateRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};


/**
 * Creates a new {@see goog.events.gestures.SwipeRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!function(this:T, !goog.events.gestures.Recognizer)} callback
 *     Function called on each gesture action.
 * @param {T=} opt_scope Scope that the callback will be called in.
 * @return {!goog.events.gestures.SwipeRecognizer} A new bound gesture instance.
 * @template T
 */
goog.events.gestures.attachSwipeGesture =
    function(target, callback, opt_scope) {
  var recognizer = new goog.events.gestures.SwipeRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};


/**
 * Creates a new {@see goog.events.gestures.TapRecognizer}.
 *
 * @param {!Element} target DOM element to attach to.
 * @param {!function(this:T, !goog.events.gestures.Recognizer)} callback
 *     Function called on each gesture action.
 * @param {T=} opt_scope Scope that the callback will be called in.
 * @return {!goog.events.gestures.TapRecognizer} A new bound gesture instance.
 * @template T
 */
goog.events.gestures.attachTapGesture =
    function(target, callback, opt_scope) {
  var recognizer = new goog.events.gestures.TapRecognizer(target);
  recognizer.addListener(callback, opt_scope);
  return recognizer;
};


/**
 * Removes and disposes all of the gestures from the given element.
 * @param {!Element} target DOM element to clean up.
 */
goog.events.gestures.unattachAllGestures = function(target) {
  goog.events.gestures.TouchView.disposeInstance(target);
};


/**
 * Allows for symmetrical simultaneous recognition of the given list of
 * gesture recognizers.
 * @param {...!goog.events.gestures.Recognizer} var_args Recognizers that are
 *     allowed to simultaneously recognize.
 */
goog.events.gestures.allowSimultaneousRecognition = function(var_args) {
  for (var n = 0; n < arguments.length; n++) {
    var target = /** @type {goog.events.gestures.Recognizer} */ (arguments[n]);
    goog.asserts.assert(target);
    for (var m = 0; m < arguments.length; m++) {
      if (n != m) {
        var other =
            /** @type {goog.events.gestures.Recognizer} */ (arguments[m]);
        goog.asserts.assert(other);
        target.addAllowedSimultaneousRecognizer(other);
      }
    }
  }
};
