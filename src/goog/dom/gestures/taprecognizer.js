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

goog.provide('goog.dom.gestures.TapRecognizer');

goog.require('goog.asserts');
goog.require('goog.dom.gestures.Recognizer');
goog.require('goog.dom.gestures.State');



/**
 * An N-tap gesture recognizer.
 * @constructor
 * @extends {goog.dom.gestures.Recognizer}
 * @param {!Element} target DOM element to attach to.
 */
goog.dom.gestures.TapRecognizer = function(target) {
  goog.base(this, target);

  /**
   * Number of taps required for the gesture to recognize.
   * @private
   * @type {number}
   */
  this.tapCount_ = 1;

  /**
   * Number of touches required for the gesture to recognize.
   * @private
   * @type {number}
   */
  this.touchCount_ = 1;

  /**
   * Number of pixels of movement in a touch to cancel the tap.
   * @private
   * @type {number}
   */
  this.moveHysteresis_ = 6;

  /**
   * Tracks information about each touch, such as distance moved/start point.
   * The hash is keyed on {@code Touch.identifier}.
   * @private
   * @type {!Object.<{
   *   lastX: number,
   *   lastY: number,
   *   distance: number
   * }>}
   */
  this.touchTrackers_ = {};
};
goog.inherits(goog.dom.gestures.TapRecognizer, goog.dom.gestures.Recognizer);


/**
 * @return {number} Number of taps required for the gesture recognize.
 */
goog.dom.gestures.TapRecognizer.prototype.getTapCount = function() {
  return this.tapCount_;
};


/**
 * Sets the number of taps required for the gesture to recognize.
 * @param {number} value New tap count value, >= 1.
 */
goog.dom.gestures.TapRecognizer.prototype.setTapCount = function(value) {
  goog.asserts.assert(this.getState() == goog.dom.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.tapCount_ = value;
};


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.dom.gestures.TapRecognizer.prototype.getTouchCount = function() {
  return this.touchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 1.
 */
goog.dom.gestures.TapRecognizer.prototype.setTouchCount = function(value) {
  goog.asserts.assert(this.getState() == goog.dom.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.touchCount_ = value;
};


/**
 * @override
 */
goog.dom.gestures.TapRecognizer.prototype.reset = function() {
  // There may be a less-garbagy way, but I don't know it
  this.touchTrackers_ = {};
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.dom.gestures.TapRecognizer.prototype.touchesBegan = function(e) {
  if (this.getState() != goog.dom.gestures.State.POSSIBLE) {
    return;
  }

  if (e.touches.length > this.touchCount_) {
    // Exceeded touch count, no way to recognize
    this.setState(goog.dom.gestures.State.FAILED);
    return;
  }

  // Start tracking the touches
  for (var n = 0; n < e.changedTouches.length; n++) {
    var touch = e.changedTouches[n];
    this.touchTrackers_[touch.identifier] = {
      lastX: touch.pageX,
      lastY: touch.pageY,
      distance: 0
    };
  }
};


/**
 * @override
 */
goog.dom.gestures.TapRecognizer.prototype.touchesMoved = function(e) {
  if (this.getState() != goog.dom.gestures.State.POSSIBLE) {
    return;
  }

  for (var n = 0; n < e.changedTouches.length; n++) {
    var touch = e.changedTouches[n];
    var tracker = this.touchTrackers_[touch.identifier];
    if (!tracker) {
      continue;
    }
    var dx = touch.pageX - tracker.lastX;
    var dy = touch.pageY - tracker.lastY;
    tracker.lastX = touch.pageX;
    tracker.lastY = touch.pageY;
    tracker.distance += Math.sqrt(dx * dx + dy * dy);
    if (tracker.distance > this.moveHysteresis_) {
      // Touch has moved too much - fail
      this.setState(goog.dom.gestures.State.FAILED);
      return;
    }
  }
};


/**
 * @override
 */
goog.dom.gestures.TapRecognizer.prototype.touchesEnded = function(e) {
  if (this.getState() == goog.dom.gestures.State.POSSIBLE) {
    // TODO(benvanik): tap count
    // TODO(benvanik): touch count
    if (e.touches.length + e.changedTouches.length == this.touchCount_) {
      this.setState(goog.dom.gestures.State.RECOGNIZED);
    }
  }

  if (!e.touches.length) {
    this.reset();
  }
};


/**
 * @override
 */
goog.dom.gestures.TapRecognizer.prototype.touchesCancelled = function(e) {
  this.setState(goog.dom.gestures.State.FAILED);
  this.reset();
};
