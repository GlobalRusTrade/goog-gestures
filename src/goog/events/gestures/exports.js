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

goog.provide('goog.events.gestures.exports');

goog.require('goog.events.gestures');
goog.require('goog.events.gestures.Direction');
goog.require('goog.events.gestures.PanRecognizer');
goog.require('goog.events.gestures.PinchRecognizer');
goog.require('goog.events.gestures.Recognizer');
goog.require('goog.events.gestures.RotationRecognizer');
goog.require('goog.events.gestures.State');
goog.require('goog.events.gestures.SwipeRecognizer');
goog.require('goog.events.gestures.TapRecognizer');


/**
 * @define {boolean} Whether to enable exporting of the goog.events.gestures
 *     types and namespace.
 *
 * This should only be enabled in builds of the standalone library. If you're
 * including this code with it enabled in Closurized javascript then you'll
 * prevent renaming.
 */
goog.events.gestures.exports.ENABLE_EXPORTS = false;


if (goog.events.gestures.exports.ENABLE_EXPORTS) {
  // Root namespace
  goog.exportSymbol(
      'goog.events.gestures.attachPanGesture',
      goog.events.gestures.attachPanGesture);
  goog.exportSymbol(
      'goog.events.gestures.attachPinchGesture',
      goog.events.gestures.attachPinchGesture);
  goog.exportSymbol(
      'goog.events.gestures.attachRotationGesture',
      goog.events.gestures.attachRotationGesture);
  goog.exportSymbol(
      'goog.events.gestures.attachSwipeGesture',
      goog.events.gestures.attachSwipeGesture);
  goog.exportSymbol(
      'goog.events.gestures.attachTapGesture',
      goog.events.gestures.attachTapGesture);
  goog.exportSymbol(
      'goog.events.gestures.unattachAllGestures',
      goog.events.gestures.unattachAllGestures);
  goog.exportSymbol(
      'goog.events.gestures.allowSimultaneousRecognition',
      goog.events.gestures.allowSimultaneousRecognition);

  // State
  goog.exportSymbol(
      'goog.events.gestures.State',
      goog.events.gestures.State);
  goog.exportProperty(
      goog.events.gestures.State, 'POSSIBLE',
      goog.events.gestures.State.POSSIBLE);
  goog.exportProperty(
      goog.events.gestures.State, 'BEGAN',
      goog.events.gestures.State.BEGAN);
  goog.exportProperty(
      goog.events.gestures.State, 'CHANGED',
      goog.events.gestures.State.CHANGED);
  goog.exportProperty(
      goog.events.gestures.State, 'ENDED',
      goog.events.gestures.State.ENDED);
  goog.exportProperty(
      goog.events.gestures.State, 'CANCELLED',
      goog.events.gestures.State.CANCELLED);
  goog.exportProperty(
      goog.events.gestures.State, 'FAILED',
      goog.events.gestures.State.FAILED);
  goog.exportProperty(
      goog.events.gestures.State, 'RECOGNIZED',
      goog.events.gestures.State.RECOGNIZED);

  // Direction
  goog.exportSymbol(
      'goog.events.gestures.Direction',
      goog.events.gestures.Direction);
  goog.exportProperty(
      goog.events.gestures.Direction, 'NONE',
      goog.events.gestures.Direction.NONE);
  goog.exportProperty(
      goog.events.gestures.Direction, 'UP',
      goog.events.gestures.Direction.NONE);
  goog.exportProperty(
      goog.events.gestures.Direction, 'RIGHT',
      goog.events.gestures.Direction.NONE);
  goog.exportProperty(
      goog.events.gestures.Direction, 'DOWN',
      goog.events.gestures.Direction.NONE);
  goog.exportProperty(
      goog.events.gestures.Direction, 'LEFT',
      goog.events.gestures.Direction.NONE);

  // Recognizer
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getTarget',
      goog.events.gestures.Recognizer.prototype.getTarget);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getMovementThreshold',
      goog.events.gestures.Recognizer.prototype.getMovementThreshold);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'setMovementThreshold',
      goog.events.gestures.Recognizer.prototype.setMovementThreshold);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'isEnabled',
      goog.events.gestures.Recognizer.prototype.isEnabled);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'setEnabled',
      goog.events.gestures.Recognizer.prototype.setEnabled);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getState',
      goog.events.gestures.Recognizer.prototype.getState);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getOffsetX',
      goog.events.gestures.Recognizer.prototype.getOffsetX);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getOffsetY',
      goog.events.gestures.Recognizer.prototype.getOffsetY);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getClientX',
      goog.events.gestures.Recognizer.prototype.getClientX);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getClientY',
      goog.events.gestures.Recognizer.prototype.getClientY);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getPageX',
      goog.events.gestures.Recognizer.prototype.getPageX);
  goog.exportProperty(
      goog.events.gestures.Recognizer.prototype, 'getPageY',
      goog.events.gestures.Recognizer.prototype.getPageY);

  // PanRecognizer
  goog.exportProperty(
      goog.events.gestures.PanRecognizer.prototype, 'setMinimumTouchCount',
      goog.events.gestures.PanRecognizer.prototype.setMinimumTouchCount);
  goog.exportProperty(
      goog.events.gestures.PanRecognizer.prototype, 'setMaximumTouchCount',
      goog.events.gestures.PanRecognizer.prototype.setMaximumTouchCount);
  goog.exportProperty(
      goog.events.gestures.PanRecognizer.prototype, 'getTranslationX',
      goog.events.gestures.PanRecognizer.prototype.getTranslationX);
  goog.exportProperty(
      goog.events.gestures.PanRecognizer.prototype, 'getTranslationY',
      goog.events.gestures.PanRecognizer.prototype.getTranslationY);

  // PinchRecognizer
  goog.exportProperty(
      goog.events.gestures.PinchRecognizer.prototype, 'setMinimumTouchCount',
      goog.events.gestures.PinchRecognizer.prototype.setMinimumTouchCount);
  goog.exportProperty(
      goog.events.gestures.PinchRecognizer.prototype, 'setMaximumTouchCount',
      goog.events.gestures.PinchRecognizer.prototype.setMaximumTouchCount);
  goog.exportProperty(
      goog.events.gestures.PinchRecognizer.prototype, 'getScaling',
      goog.events.gestures.PinchRecognizer.prototype.getScaling);
  goog.exportProperty(
      goog.events.gestures.PinchRecognizer.prototype, 'getScalingDelta',
      goog.events.gestures.PinchRecognizer.prototype.getScalingDelta);
  goog.exportProperty(
      goog.events.gestures.PinchRecognizer.prototype, 'getVelocity',
      goog.events.gestures.PinchRecognizer.prototype.getVelocity);

  // RotationRecognizer
  goog.exportProperty(
      goog.events.gestures.RotationRecognizer.prototype, 'getRotation',
      goog.events.gestures.RotationRecognizer.prototype.getRotation);
  goog.exportProperty(
      goog.events.gestures.RotationRecognizer.prototype, 'getRotationDelta',
      goog.events.gestures.RotationRecognizer.prototype.getRotationDelta);
  goog.exportProperty(
      goog.events.gestures.RotationRecognizer.prototype, 'getVelocity',
      goog.events.gestures.RotationRecognizer.prototype.getVelocity);

  // SwipeRecognizer
  goog.exportProperty(
      goog.events.gestures.SwipeRecognizer.prototype, 'setTouchCount',
      goog.events.gestures.SwipeRecognizer.prototype.setTouchCount);
  goog.exportProperty(
      goog.events.gestures.SwipeRecognizer.prototype, 'getDirection',
      goog.events.gestures.SwipeRecognizer.prototype.getDirection);

  // TapRecognizer
  goog.exportProperty(
      goog.events.gestures.TapRecognizer.prototype, 'setTapCount',
      goog.events.gestures.TapRecognizer.prototype.setTapCount);
  goog.exportProperty(
      goog.events.gestures.TapRecognizer.prototype, 'setTouchCount',
      goog.events.gestures.TapRecognizer.prototype.setTouchCount);
}
