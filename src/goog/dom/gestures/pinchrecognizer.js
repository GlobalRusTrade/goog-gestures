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

goog.provide('goog.dom.gestures.PinchRecognizer');

goog.require('goog.asserts');
goog.require('goog.dom.gestures.Recognizer');
goog.require('goog.dom.gestures.State');



/**
 * A pinch gesture recognizer.
 * @constructor
 * @extends {goog.dom.gestures.Recognizer}
 * @param {!Element} target DOM element to attach to.
 */
goog.dom.gestures.PinchRecognizer = function(target) {
  goog.base(this, target);

  /**
   * Minimum number of touches required for the gesture to recognize.
   * @private
   * @type {number}
   */
  this.minTouchCount_ = 2;

  /**
   * Maximum number of touches required for the gesture to recognize.
   * @private
   * @type {number}
   */
  this.maxTouchCount_ = Number.MAX_VALUE;

  /**
   * Number of pixels of movement in a touch to activate the gesture.
   * @private
   * @type {number}
   */
  this.moveHysteresis_ = goog.dom.gestures.PinchRecognizer.DEFAULT_HYSTERESIS_;

  /**
   * The distanc ebetween the active touches when the pinch began, in px.
   * @private
   * @type {number}
   */
  this.lastDistance_ = 0;

  /**
   * The current distance between the active touches, in px.
   * @private
   * @type {number}
   */
  this.distance_ = 0;

  /**
   * Current scale velocity. Basically {@code scale/lastScale}.
   * @private
   * @type {number}
   */
  this.velocity_ = 0;

  /**
   * Touches that are being tracked for movement, mapped by identifier.
   * @private
   * @type {!Object.<{
   *   identifier: number,
   *   lastX: number,
   *   lastY: number,
   *   distance: number
   * }>}
   */
  this.trackedTouches_ = {};
};
goog.inherits(goog.dom.gestures.PinchRecognizer, goog.dom.gestures.Recognizer);


/**
 * Default movement hysteresis.
 * A touch must move more than this for the gesture to recognize.
 * @private
 * @const
 * @type {number}
 */
goog.dom.gestures.PinchRecognizer.DEFAULT_HYSTERESIS_ = 10;


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.dom.gestures.PinchRecognizer.prototype.getMinimumTouchCount = function() {
  return this.minTouchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New tap count value, >= 2.
 */
goog.dom.gestures.PinchRecognizer.prototype.setMinimumTouchCount =
    function(value) {
  goog.asserts.assert(this.getState() == goog.dom.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 2);
  goog.asserts.assert(value <= this.maxTouchCount_);
  this.minTouchCount_ = value;
};


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.dom.gestures.PinchRecognizer.prototype.getMaximumTouchCount = function() {
  return this.maxTouchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 2.
 */
goog.dom.gestures.PinchRecognizer.prototype.setMaximumTouchCount =
    function(value) {
  goog.asserts.assert(this.getState() == goog.dom.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 2);
  goog.asserts.assert(this.maxTouchCount_ >= value);
  this.maxTouchCount_ = value;
};


/**
 * @return {number} The current scaling factor.
 */
goog.dom.gestures.PinchRecognizer.prototype.getScale = function() {
  return this.distance_ / this.lastDistance_;
};


/**
 * @return {number} The current velocity of the pinch.
 */
goog.dom.gestures.PinchRecognizer.prototype.getVelocity = function() {
  return this.velocity_;
};


/**
 * @override
 */
goog.dom.gestures.PinchRecognizer.prototype.reset = function() {
  this.lastDistance_ = 0;
  this.distance_ = 0;
  this.velocity_ = 0;
  this.trackedTouches_ = {};
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.dom.gestures.PinchRecognizer.prototype.touchesBegan = function(e) {
  this.updateLocation(e.targetTouches);

  // Stash touch start for distance calculations
  for (var n = 0; n < e.changedTouches.length; n++) {
    var touch = e.changedTouches[n];
    this.trackedTouches_[touch.identifier] = {
      identifier: touch.identifier,
      lastX: touch.pageX,
      lastY: touch.pageY,
      distance: 0
    };
  }

  if (this.getState() == goog.dom.gestures.State.CHANGED) {
    if (e.targetTouches.length > this.maxTouchCount_) {
      // Exceeded touch count, stop recognizing
      this.setState(goog.dom.gestures.State.ENDED);
      this.reset();
      return;
    }
  }
};


/**
 * @override
 */
goog.dom.gestures.PinchRecognizer.prototype.touchesMoved = function(e) {
  // Ignore if out of touch range
  if (e.targetTouches.length < this.minTouchCount_ ||
      e.targetTouches.length > this.maxTouchCount_) {
    return;
  }

  // Update centroid
  this.updateLocation(e.targetTouches);

  // Calculate distance
  // Always use the first two touches - not ideal, but good enough
  this.lastDistance_ = this.distance_;
  var touch0 = e.targetTouches[0];
  var touch1 = e.targetTouches[1];
  var tdx = touch1.pageX - touch0.pageX;
  var tdy = touch1.pageY - touch0.pageY;
  this.distance_ = Math.sqrt(tdx * tdx + tdy * tdy);
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
      // May have been cleared - re-add
      trackedTouch = {
        identifier: touch.identifier,
        lastX: touch.pageX,
        lastY: touch.pageY,
        distance: 0
      };
      this.trackedTouches_[touch.identifier] = trackedTouch;
    }

    // Compute distance moved
    var dx = touch.pageX - trackedTouch.lastX;
    var dy = touch.pageY - trackedTouch.lastY;
    trackedTouch.lastX = touch.pageX;
    trackedTouch.lastY = touch.pageY;
    trackedTouch.distance += Math.sqrt(dx * dx + dy * dy);
    if (trackedTouch.distance > this.moveHysteresis_) {
      anyMovedEnough = true;
    }
  }

  // Begin if we have moved far enough
  if (this.getState() == goog.dom.gestures.State.POSSIBLE && anyMovedEnough) {
    // Moved far enough, start (or try to)
    this.lastDistance_ = this.distance_;
    this.setState(goog.dom.gestures.State.BEGAN);
    if (this.getState() == goog.dom.gestures.State.BEGAN) {
      this.setState(goog.dom.gestures.State.CHANGED);
    }
  } else if (this.getState() == goog.dom.gestures.State.CHANGED &&
      this.distance_ != this.lastDistance_) {
    // Normal update
    this.setState(goog.dom.gestures.State.CHANGED);
  }
};


/**
 * @override
 */
goog.dom.gestures.PinchRecognizer.prototype.touchesEnded = function(e) {
  if (this.getState() == goog.dom.gestures.State.CHANGED) {
    if (e.targetTouches.length >= this.minTouchCount_) {
      // Still have some valid touches
      this.updateLocation(e.targetTouches);

      // Reset distance when touches change
      var touch0 = e.targetTouches[0];
      var touch1 = e.targetTouches[1];
      var tdx = touch1.pageX - touch0.pageX;
      var tdy = touch1.pageY - touch0.pageY;
      var newDistance = Math.sqrt(tdx * tdx + tdy * tdy);
      this.distance_ = this.lastDistance_ = newDistance;
    } else {
      // Not enough touches
      this.setState(goog.dom.gestures.State.ENDED);
      this.reset();
    }
  }
};


/**
 * @override
 */
goog.dom.gestures.PinchRecognizer.prototype.touchesCancelled = function(e) {
  if (this.getState() == goog.dom.gestures.State.CHANGED) {
    this.setState(goog.dom.gestures.State.CANCELLED);
    this.reset();
  }
};
