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

goog.provide('goog.dom.gestures.RotationRecognizer');

goog.require('goog.dom.gestures.Recognizer');
goog.require('goog.dom.gestures.State');



/**
 * A rotation gesture recognizer.
 * @constructor
 * @extends {goog.dom.gestures.Recognizer}
 * @param {!Element} target DOM element to attach to.
 */
goog.dom.gestures.RotationRecognizer = function(target) {
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
  this.moveHysteresis_ = goog.dom.gestures.RotationRecognizer.DEFAULT_HYSTERESIS_;

  /**
   * The previous angle of rotation, in radians.
   * @private
   * @type {number}
   */
  this.lastAngle_ = 0;

  /**
   * The current rotation angle between the active touches, in radians.
   * @private
   * @type {number}
   */
  this.angle_ = 0;

  /**
   * Current rotation velocity.
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
goog.inherits(goog.dom.gestures.RotationRecognizer, goog.dom.gestures.Recognizer);


/**
 * Default movement hysteresis.
 * A touch must move more than this for the gesture to recognize.
 * @private
 * @const
 * @type {number}
 */
goog.dom.gestures.RotationRecognizer.DEFAULT_HYSTERESIS_ = 10;


/**
 * @return {number} The change in rotation angle, in radians.
 */
goog.dom.gestures.RotationRecognizer.prototype.getAngle = function() {
  return this.angle_;
};


/**
 * @return {number} The current velocity of the rotation.
 */
goog.dom.gestures.RotationRecognizer.prototype.getVelocity = function() {
  return this.velocity_;
};


/**
 * @override
 */
goog.dom.gestures.RotationRecognizer.prototype.reset = function() {
  this.lastAngle_ = 0;
  this.angle_ = 0;
  this.velocity_ = 0;
  this.trackedTouches_ = {};
  goog.base(this, 'reset');
};


/**
 * Gets the angle between two touches.
 * @private
 * @param {!Touch} touch0 First touch.
 * @param {!Touch} touch1 Second touch.
 * @return {number} Angle between the two touches, in radians.
 */
goog.dom.gestures.RotationRecognizer.prototype.angleBetweenTouches_ =
    function(touch0, touch1) {
  // Note that we may not have been tracking the touch - treat it as a no-op
  var trackedTouch0 = this.trackedTouches_[touch0.identifier];
  var trackedTouch1 = this.trackedTouches_[touch1.identifier];
  if (!trackedTouch0 || !trackedTouch1) {
    return 0;
  }

  var line0p0x = trackedTouch0.lastX;
  var line0p0y = trackedTouch0.lastY;
  var line0p1x = trackedTouch1.lastX;
  var line0p1y = trackedTouch1.lastY;
  var line1p0x = touch0.pageX;
  var line1p0y = touch0.pageY;
  var line1p1x = touch1.pageX;
  var line1p1y = touch1.pageY;

  // Code adapted from Jeff Lamarche's blog
  // https://github.com/jlamarche/Old-Blog-Code/blob/master/Better%20Rotate/Classes/RotateViewController.h
  var a = line0p1x - line0p0x;
  var b = line0p1y - line0p0y;
  var c = line1p1x - line1p0x;
  var d = line1p1y - line1p0y;
  var line0slope = (line0p1y - line0p0y) / (line0p1x - line0p0x);
  var line1slope = (line1p1y - line1p0y) / (line1p1x - line1p0x);
  if (line0slope == line1slope) {
    return 0;
  }
  var angle = Math.acos(
      (a * c + b * d) / (Math.sqrt(a * a + b * b) * Math.sqrt(c * c + d * d)));
  return line1slope > line0slope ? angle : -angle;
};


/**
 * @override
 */
goog.dom.gestures.RotationRecognizer.prototype.touchesBegan = function(e) {
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
goog.dom.gestures.RotationRecognizer.prototype.touchesMoved = function(e) {
  // Ignore if out of touch range
  if (e.targetTouches.length < this.minTouchCount_ ||
      e.targetTouches.length > this.maxTouchCount_) {
    return;
  }

  // Update centroid
  this.updateLocation(e.targetTouches);

  // Calculate angle
  // Always use the first two touches - not ideal, but good enough
  this.lastAngle_ = this.angle_;
  var touch0 = e.targetTouches[0];
  var touch1 = e.targetTouches[1];
  this.angle_ = this.angleBetweenTouches_(touch0, touch1);

  // TODO(benvanik): a real velocity
  if (this.lastAngle_) {
    this.velocity_ = this.angle_ / this.lastAngle_;
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
    this.lastAngle_ = this.angle_;
    this.setState(goog.dom.gestures.State.BEGAN);
    if (this.getState() == goog.dom.gestures.State.BEGAN) {
      this.setState(goog.dom.gestures.State.CHANGED);
    }
  } else if (this.getState() == goog.dom.gestures.State.CHANGED &&
      this.angle_) {
    // Normal update
    this.setState(goog.dom.gestures.State.CHANGED);
  }
};


/**
 * @override
 */
goog.dom.gestures.RotationRecognizer.prototype.touchesEnded = function(e) {
  if (this.getState() == goog.dom.gestures.State.CHANGED) {
    if (e.targetTouches.length >= this.minTouchCount_) {
      // Still have some valid touches
      this.updateLocation(e.targetTouches);

      // Reset angle when touches change
      var touch0 = e.targetTouches[0];
      var touch1 = e.targetTouches[1];
      var newAngle = this.angleBetweenTouches_(touch0, touch1);
      this.angle_ = this.lastAngle_ = newAngle;
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
goog.dom.gestures.RotationRecognizer.prototype.touchesCancelled = function(e) {
  if (this.getState() == goog.dom.gestures.State.CHANGED) {
    this.setState(goog.dom.gestures.State.CANCELLED);
    this.reset();
  }
};
