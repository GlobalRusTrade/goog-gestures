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

goog.provide('goog.dom.gestures.exports');

goog.require('goog.dom.gestures');
goog.require('goog.dom.gestures.PanRecognizer');
goog.require('goog.dom.gestures.PinchRecognizer');
goog.require('goog.dom.gestures.Recognizer');
goog.require('goog.dom.gestures.State');
goog.require('goog.dom.gestures.TapRecognizer');


/**
 * @define {boolean} Whether to enable exporting of the goog.dom.gestures
 *     types and namespace.
 *
 * This should only be enabled in builds of the standalone library. If you're
 * including this code with it enabled in Closurized javascript then you'll
 * prevent renaming.
 */
goog.dom.gestures.exports.ENABLE_EXPORTS = false;


if (goog.dom.gestures.exports.ENABLE_EXPORTS) {
  // Root namespace
  goog.exportSymbol('goog.dom.gestures', goog.dom.gestures);
  goog.exportProperty(
      goog.dom.gestures, 'createPanGesture',
      goog.dom.gestures.createPanGesture);
  goog.exportProperty(
      goog.dom.gestures, 'createTapGesture',
      goog.dom.gestures.createTapGesture);

  // State
  goog.exportSymbol('goog.dom.gestures.State', goog.dom.gestures.State);
  goog.exportProperty(
      goog.dom.gestures.State, 'POSSIBLE',
      goog.dom.gestures.State.POSSIBLE);
  goog.exportProperty(
      goog.dom.gestures.State, 'BEGAN',
      goog.dom.gestures.State.BEGAN);
  goog.exportProperty(
      goog.dom.gestures.State, 'CHANGED',
      goog.dom.gestures.State.CHANGED);
  goog.exportProperty(
      goog.dom.gestures.State, 'ENDED',
      goog.dom.gestures.State.ENDED);
  goog.exportProperty(
      goog.dom.gestures.State, 'CANCELLED',
      goog.dom.gestures.State.CANCELLED);
  goog.exportProperty(
      goog.dom.gestures.State, 'FAILED',
      goog.dom.gestures.State.FAILED);
  goog.exportProperty(
      goog.dom.gestures.State, 'RECOGNIZED',
      goog.dom.gestures.State.RECOGNIZED);

  // Recognizer
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'getTarget',
      goog.dom.gestures.Recognizer.prototype.getTarget);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'isEnabled',
      goog.dom.gestures.Recognizer.prototype.isEnabled);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'setEnabled',
      goog.dom.gestures.Recognizer.prototype.setEnabled);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'getState',
      goog.dom.gestures.Recognizer.prototype.getState);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'getOffsetX',
      goog.dom.gestures.Recognizer.prototype.getOffsetX);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'getOffsetY',
      goog.dom.gestures.Recognizer.prototype.getOffsetY);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'getClientX',
      goog.dom.gestures.Recognizer.prototype.getClientX);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'getClientY',
      goog.dom.gestures.Recognizer.prototype.getClientY);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'getPageX',
      goog.dom.gestures.Recognizer.prototype.getPageX);
  goog.exportProperty(
      goog.dom.gestures.Recognizer.prototype, 'getPageY',
      goog.dom.gestures.Recognizer.prototype.getPageY);

  // PanRecognizer
  goog.exportProperty(
      goog.dom.gestures.PanRecognizer.prototype, 'setMinimumTouchCount',
      goog.dom.gestures.PanRecognizer.prototype.setMinimumTouchCount);
  goog.exportProperty(
      goog.dom.gestures.PanRecognizer.prototype, 'setMaximumTouchCount',
      goog.dom.gestures.PanRecognizer.prototype.setMaximumTouchCount);
  goog.exportProperty(
      goog.dom.gestures.PanRecognizer.prototype, 'getTranslateX',
      goog.dom.gestures.PanRecognizer.prototype.getTranslateX);
  goog.exportProperty(
      goog.dom.gestures.PanRecognizer.prototype, 'getTranslateY',
      goog.dom.gestures.PanRecognizer.prototype.getTranslateY);

  // PinchRecognizer
  goog.exportProperty(
      goog.dom.gestures.PinchRecognizer.prototype, 'setMinimumTouchCount',
      goog.dom.gestures.PinchRecognizer.prototype.setMinimumTouchCount);
  goog.exportProperty(
      goog.dom.gestures.PinchRecognizer.prototype, 'setMaximumTouchCount',
      goog.dom.gestures.PinchRecognizer.prototype.setMaximumTouchCount);
  goog.exportProperty(
      goog.dom.gestures.PinchRecognizer.prototype, 'getScale',
      goog.dom.gestures.PinchRecognizer.prototype.getScale);
  goog.exportProperty(
      goog.dom.gestures.PinchRecognizer.prototype, 'getVelocity',
      goog.dom.gestures.PinchRecognizer.prototype.getVelocity);

  // TapRecognizer
  goog.exportProperty(
      goog.dom.gestures.TapRecognizer.prototype, 'setTapCount',
      goog.dom.gestures.TapRecognizer.prototype.setTapCount);
  goog.exportProperty(
      goog.dom.gestures.TapRecognizer.prototype, 'setTouchCount',
      goog.dom.gestures.TapRecognizer.prototype.setTouchCount);
}
