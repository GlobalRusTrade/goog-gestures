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

goog.provide('goog.events.gestures.PinchRecognizer');

goog.require('goog.asserts');
goog.require('goog.events.gestures.Recognizer');
goog.require('goog.events.gestures.State');
goog.require('goog.events.gestures.utils');



/**
 * A pinch gesture recognizer.
 * @param {!Element} target DOM element to attach to.
 * @constructor
 * @extends {goog.events.gestures.Recognizer}
 */
goog.events.gestures.PinchRecognizer = function(target) {
  goog.base(this, target);

  this.setMovementThreshold(goog.events.gestures.utils.MOVEMENT_HYSTERESIS);

  /**
   * Minimum number of touches required for the gesture to recognize.
   * @type {number}
   * @private
   */
  this.minTouchCount_ = 2;

  /**
   * Maximum number of touches required for the gesture to recognize.
   * @type {number}
   * @private
   */
  this.maxTouchCount_ = Number.MAX_VALUE;

  /**
   * Accumulated scale over the life of the gesture. Always relative to 1.
   * @type {number}
   * @private
   */
  this.scale_ = 1;

  /**
   * The current distance between the active touches, in px.
   * @type {number}
   * @private
   */
  this.distance_ = 0;

  /**
   * The distance between the active touches when the pinch began, in px.
   * @type {number}
   * @private
   */
  this.lastDistance_ = 0;

  /**
   * Current scale velocity.
   * @type {number}
   * @private
   */
  this.velocity_ = 0;

  /**
   * Touches that are being tracked for movement, mapped by identifier.
   * @type {!Object.<{
   *   identifier: number,
   *   lastX: number,
   *   lastY: number,
   *   distance: number
   * }>}
   * @private
   */
  this.trackedTouches_ = {};
};
goog.inherits(goog.events.gestures.PinchRecognizer,
    goog.events.gestures.Recognizer);


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.events.gestures.PinchRecognizer.prototype.getMinimumTouchCount =
    function() {
  return this.minTouchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New tap count value, >= 2.
 */
goog.events.gestures.PinchRecognizer.prototype.setMinimumTouchCount =
    function(value) {
  goog.asserts.assert(this.getState() == goog.events.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 2);
  goog.asserts.assert(value <= this.maxTouchCount_);
  this.minTouchCount_ = value;
};


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.events.gestures.PinchRecognizer.prototype.getMaximumTouchCount =
    function() {
  return this.maxTouchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 2.
 */
goog.events.gestures.PinchRecognizer.prototype.setMaximumTouchCount =
    function(value) {
  goog.asserts.assert(this.getState() == goog.events.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 2);
  goog.asserts.assert(this.maxTouchCount_ >= value);
  this.maxTouchCount_ = value;
};


/**
 * @return {number} The accumulated change in scaling factor for the gesture.
 */
goog.events.gestures.PinchRecognizer.prototype.getScaling = function() {
  return this.scale_;
};


/**
 * @return {number} The change in scaling factor.
 */
goog.events.gestures.PinchRecognizer.prototype.getScalingDelta = function() {
  return this.distance_ / this.lastDistance_;
};


/**
 * @return {number} The current velocity of the pinch.
 */
goog.events.gestures.PinchRecognizer.prototype.getVelocity = function() {
  return this.velocity_;
};


/**
 * @override
 */
goog.events.gestures.PinchRecognizer.prototype.reset = function() {
  this.scale_ = 1;
  this.distance_ = 0;
  this.lastDistance_ = 0;
  this.velocity_ = 0;
  this.trackedTouches_ = {};
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.events.gestures.PinchRecognizer.prototype.touchesBegan = function(e) {
  this.updateLocation(e.targetTouches);

  // Stash touch start for distance calculations.
  for (var n = 0; n < e.changedTouches.length; n++) {
    var touch = e.changedTouches[n];
    this.trackedTouches_[touch.identifier] = {
      identifier: touch.identifier,
      lastX: touch.pageX,
      lastY: touch.pageY,
      distance: 0
    };
  }

  if (this.getState() == goog.events.gestures.State.CHANGED) {
    if (e.targetTouches.length > this.maxTouchCount_) {
      // Exceeded touch count, stop recognizing.
      this.setState(goog.events.gestures.State.ENDED);
      this.reset();
      return;
    }
  }
};


/**
 * @override
 */
goog.events.gestures.PinchRecognizer.prototype.touchesMoved = function(e) {
  // Ignore if out of touch range.
  if (e.targetTouches.length < this.minTouchCount_ ||
      e.targetTouches.length > this.maxTouchCount_) {
    return;
  }

  // Update centroid.
  this.updateLocation(e.targetTouches);

  // Calculate distance.
  // Always use the first two touches - not ideal, but good enough.
  this.lastDistance_ = this.distance_;
  var touch0 = e.targetTouches[0];
  var touch1 = e.targetTouches[1];
  var tdx = touch1.pageX - touch0.pageX;
  var tdy = touch1.pageY - touch0.pageY;
  this.distance_ = Math.sqrt(tdx * tdx + tdy * tdy);

  // TODO(benvanik): a real velocity.
  if (this.lastDistance_) {
    this.velocity_ = this.distance_ / this.lastDistance_;
  } else {
    this.velocity_ = 0;
  }

  // Update all touches
  // TODO(benvanik): abort this check once we find the first two touches?
  var anyMovedEnough = false;
  for (var n = 0; n < e.targetTouches.length; n++) {
    var touch = e.targetTouches[n];
    var trackedTouch = this.trackedTouches_[touch.identifier];
    if (!trackedTouch) {
      // May have been cleared - re-add.
      trackedTouch = {
        identifier: touch.identifier,
        lastX: touch.pageX,
        lastY: touch.pageY,
        distance: 0
      };
      this.trackedTouches_[touch.identifier] = trackedTouch;
    }

    // Compute distance moved.
    var dx = touch.pageX - trackedTouch.lastX;
    var dy = touch.pageY - trackedTouch.lastY;
    trackedTouch.lastX = touch.pageX;
    trackedTouch.lastY = touch.pageY;
    trackedTouch.distance += Math.sqrt(dx * dx + dy * dy);
    if (trackedTouch.distance > this.getMovementThreshold()) {
      anyMovedEnough = true;
    }
  }

  // Begin if we have moved far enough.
  if (this.getState() == goog.events.gestures.State.POSSIBLE &&
      anyMovedEnough) {
    // Moved far enough, start (or try to).
    this.lastDistance_ = this.distance_;
    this.setState(goog.events.gestures.State.BEGAN);
    if (this.getState() == goog.events.gestures.State.BEGAN) {
      this.scale_ *= this.distance_ / this.lastDistance_;
      this.setState(goog.events.gestures.State.CHANGED);
    }
  } else if (this.getState() == goog.events.gestures.State.CHANGED &&
      this.distance_ != this.lastDistance_) {
    // Normal update.
    this.scale_ *= this.distance_ / this.lastDistance_;
    this.setState(goog.events.gestures.State.CHANGED);
  }
};


/**
 * @override
 */
goog.events.gestures.PinchRecognizer.prototype.touchesEnded = function(e) {
  if (this.getState() == goog.events.gestures.State.CHANGED) {
    if (e.targetTouches.length >= this.minTouchCount_) {
      // Still have some valid touches.
      this.updateLocation(e.targetTouches);

      // Reset distance when touches change.
      var touch0 = e.targetTouches[0];
      var touch1 = e.targetTouches[1];
      var tdx = touch1.pageX - touch0.pageX;
      var tdy = touch1.pageY - touch0.pageY;
      var newDistance = Math.sqrt(tdx * tdx + tdy * tdy);
      this.distance_ = this.lastDistance_ = newDistance;
    } else {
      // Not enough touches.
      this.setState(goog.events.gestures.State.ENDED);
      this.reset();
    }
  }
};


/**
 * @override
 */
goog.events.gestures.PinchRecognizer.prototype.touchesCancelled = function(e) {
  if (this.getState() == goog.events.gestures.State.CHANGED) {
    this.setState(goog.events.gestures.State.CANCELLED);
    this.reset();
  }
};
