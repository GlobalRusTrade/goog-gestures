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

goog.provide('goog.events.gestures.TapRecognizer');

goog.require('goog.asserts');
goog.require('goog.events.gestures.Recognizer');
goog.require('goog.events.gestures.State');
goog.require('goog.events.gestures.utils');



/**
 * An N-tap gesture recognizer.
 * @constructor
 * @extends {goog.events.gestures.Recognizer}
 * @param {!Element} target DOM element to attach to.
 */
goog.events.gestures.TapRecognizer = function(target) {
  goog.base(this, target);

  this.setMovementThreshold(3 * goog.events.gestures.utils.MOVEMENT_HYSTERESIS);

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
   * The total distance the center has moved, in px.
   * @private
   * @type {number}
   */
  this.centroidDistance_ = 0;
};
goog.inherits(goog.events.gestures.TapRecognizer,
    goog.events.gestures.Recognizer);


/**
 * @return {number} Number of taps required for the gesture recognize.
 */
goog.events.gestures.TapRecognizer.prototype.getTapCount = function() {
  return this.tapCount_;
};


/**
 * Sets the number of taps required for the gesture to recognize.
 * @param {number} value New tap count value, >= 1.
 */
goog.events.gestures.TapRecognizer.prototype.setTapCount = function(value) {
  goog.asserts.assert(this.getState() == goog.events.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.tapCount_ = value;
};


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.events.gestures.TapRecognizer.prototype.getTouchCount = function() {
  return this.touchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 1.
 */
goog.events.gestures.TapRecognizer.prototype.setTouchCount = function(value) {
  goog.asserts.assert(this.getState() == goog.events.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.touchCount_ = value;
};


/**
 * @override
 */
goog.events.gestures.TapRecognizer.prototype.reset = function() {
  this.centroidDistance_ = 0;
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.events.gestures.TapRecognizer.prototype.touchesBegan = function(e) {
  if (this.getState() != goog.events.gestures.State.POSSIBLE) {
    return;
  }

  if (e.targetTouches.length > this.touchCount_) {
    // Exceeded touch count, no way to recognize.
    this.setState(goog.events.gestures.State.FAILED);
    return;
  }

  this.updateLocation(e.targetTouches);
};


/**
 * @override
 */
goog.events.gestures.TapRecognizer.prototype.touchesMoved = function(e) {
  if (this.getState() != goog.events.gestures.State.POSSIBLE) {
    return;
  }

  // Grab the latest centroid position.
  var oldPageX = this.getPageX();
  var oldPageY = this.getPageY();
  this.updateLocation(e.targetTouches);
  var pageX = this.getPageX();
  var pageY = this.getPageY();

  // Compute distance moved.
  var dx = pageX - oldPageX;
  var dy = pageY - oldPageY;
  this.centroidDistance_ += Math.sqrt(dx * dx + dy * dy);
  if (this.centroidDistance_ >= this.getMovementThreshold()) {
    // Touch has moved too much - fail.
    this.setState(goog.events.gestures.State.FAILED);
    return;
  }
};


/**
 * @override
 */
goog.events.gestures.TapRecognizer.prototype.touchesEnded = function(e) {
  if (this.getState() == goog.events.gestures.State.POSSIBLE) {
    // TODO(benvanik): tap count.
    // TODO(benvanik): touch count.
    if (e.targetTouches.length + e.changedTouches.length == this.touchCount_) {
      this.setState(goog.events.gestures.State.RECOGNIZED);
      this.reset();
    }
  }

  if (!e.targetTouches.length) {
    this.reset();
  }
};


/**
 * @override
 */
goog.events.gestures.TapRecognizer.prototype.touchesCancelled = function(e) {
  this.reset();
};
