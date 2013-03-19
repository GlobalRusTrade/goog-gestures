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

goog.provide('goog.events.gestures.SwipeRecognizer');

goog.require('goog.asserts');
goog.require('goog.events.gestures.Direction');
goog.require('goog.events.gestures.Recognizer');
goog.require('goog.events.gestures.State');
goog.require('goog.events.gestures.utils');



/**
 * A simple directional swipe gesture recognizer.
 * @param {!Element} target DOM element to attach to.
 * @constructor
 * @extends {goog.events.gestures.Recognizer}
 */
goog.events.gestures.SwipeRecognizer = function(target) {
  goog.base(this, target);

  this.setMovementThreshold(3 * goog.events.gestures.utils.MOVEMENT_HYSTERESIS);

  /**
   * Number of touches required for the gesture to recognize.
   * @type {number}
   * @private
   */
  this.touchCount_ = 1;

  /**
   * Whether the current touches are being watched as possible swipes.
   * If this is true then the start position is valid and should be used to
   * calculate distance.
   * @type {boolean}
   * @private
   */
  this.watching_ = false;

  /**
   * Time from {@code goog.now()} when the touches started being watched.
   * @type {number}
   * @private
   */
  this.startTime_ = 0;

  /**
   * Start point when recognition looks possible, X.
   * @type {number}
   * @private
   */
  this.startX_ = 0;

  /**
   * Start point when recognition looks possible, Y.
   * @type {number}
   * @private
   */
  this.startY_ = 0;

  /**
   * Recognized swipe direction.
   * @type {goog.events.gestures.Direction}
   * @private
   */
  this.direction_ = goog.events.gestures.Direction.NONE;
};
goog.inherits(goog.events.gestures.SwipeRecognizer,
    goog.events.gestures.Recognizer);


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.events.gestures.SwipeRecognizer.prototype.getTouchCount = function() {
  return this.touchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 1.
 */
goog.events.gestures.SwipeRecognizer.prototype.setTouchCount = function(value) {
  goog.asserts.assert(this.getState() == goog.events.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.touchCount_ = value;
};


/**
 * @return {goog.events.gestures.Direction} The direction of the recognized
 *     swipe gesture.
 */
goog.events.gestures.SwipeRecognizer.prototype.getDirection = function() {
  return this.direction_;
};


/**
 * @override
 */
goog.events.gestures.SwipeRecognizer.prototype.reset = function() {
  this.watching_ = false;
  this.startTime_ = 0;
  this.startX_ = this.startY_ = 0;
  this.direction_ = goog.events.gestures.Direction.NONE;
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.events.gestures.SwipeRecognizer.prototype.touchesBegan = function(e) {
  if (this.getState() != goog.events.gestures.State.POSSIBLE) {
    return;
  }

  if (e.targetTouches.length != this.touchCount_) {
    // Touch count mismatch, no way to recognize.
    this.setState(goog.events.gestures.State.FAILED);
    this.reset();
    return;
  }
};


/**
 * @override
 */
goog.events.gestures.SwipeRecognizer.prototype.touchesMoved = function(e) {
  if (this.getState() != goog.events.gestures.State.POSSIBLE) {
    return;
  }

  // Grab the latest centroid position.
  this.updateLocation(e.targetTouches);

  // If the right number of touches are down, we may be recongized.
  if (e.targetTouches.length == this.touchCount_) {
    if (!this.watching_) {
      // First time, reset start position.
      this.watching_ = true;
      this.startTime_ = goog.now();
      this.startX_ = this.getPageX();
      this.startY_ = this.getPageY();
    } else {
      // In a cycle, check for distance threshold.
      var dx = this.getPageX() - this.startX_;
      var dy = this.getPageY() - this.startY_;

      // TODO(benvanik): vary the slip allowed by the elapsed time.
      var elapsed = goog.now() - this.startTime_;
      var distanceRequired = this.getMovementThreshold();
      var slipAllowed = distanceRequired / 3;

      var direction = goog.events.gestures.Direction.NONE;
      if (dx <= -distanceRequired && Math.abs(dy) <= slipAllowed) {
        direction = goog.events.gestures.Direction.LEFT;
      } else if (dx >= distanceRequired && Math.abs(dy) <= slipAllowed) {
        direction = goog.events.gestures.Direction.RIGHT;
      } else if (dy <= -distanceRequired && Math.abs(dx) <= slipAllowed) {
        direction = goog.events.gestures.Direction.UP;
      } else if (dy >= distanceRequired && Math.abs(dx) <= slipAllowed) {
        direction = goog.events.gestures.Direction.DOWN;
      }

      if (direction != goog.events.gestures.Direction.NONE) {
        this.direction_ = direction;
        this.setState(goog.events.gestures.State.RECOGNIZED);
      }
    }
  }
};


/**
 * @override
 */
goog.events.gestures.SwipeRecognizer.prototype.touchesEnded = function(e) {
  if (!e.targetTouches.length) {
    this.reset();
  }
};


/**
 * @override
 */
goog.events.gestures.SwipeRecognizer.prototype.touchesCancelled = function(e) {
  this.reset();
};
