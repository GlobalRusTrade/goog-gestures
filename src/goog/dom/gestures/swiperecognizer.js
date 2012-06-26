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

goog.provide('goog.dom.gestures.SwipeRecognizer');

goog.require('goog.asserts');
goog.require('goog.dom.gestures.Direction');
goog.require('goog.dom.gestures.Recognizer');
goog.require('goog.dom.gestures.State');



/**
 * A simple directional swipe gesture recognizer.
 * @constructor
 * @extends {goog.dom.gestures.Recognizer}
 * @param {!Element} target DOM element to attach to.
 */
goog.dom.gestures.SwipeRecognizer = function(target) {
  goog.base(this, target);

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
  this.moveHysteresis_ = goog.dom.gestures.SwipeRecognizer.DEFAULT_HYSTERESIS_;

  /**
   * Whether the current touches are being watched as possible swipes.
   * If this is true then the start position is valid and should be used to
   * calculate distance.
   * @private
   * @type {boolean}
   */
  this.watching_ = false;

  /**
   * Time from {@code goog.now()} when the touches started being watched.
   * @private
   * @type {number}
   */
  this.startTime_ = 0;

  /**
   * Start point when recognition looks possible, X.
   * @private
   * @type {number}
   */
  this.startX_ = 0;

  /**
   * Start point when recognition looks possible, Y.
   * @private
   * @type {number}
   */
  this.startY_ = 0;

  /**
   * Recognized swipe direction.
   * @private
   * @type {goog.dom.gestures.Direction}
   */
  this.direction_ = goog.dom.gestures.Direction.NONE;
};
goog.inherits(goog.dom.gestures.SwipeRecognizer, goog.dom.gestures.Recognizer);


/**
 * Default movement hysteresis.
 * The swipe must move more than this in a direction to recognize.
 * @private
 * @const
 * @type {number}
 */
goog.dom.gestures.SwipeRecognizer.DEFAULT_HYSTERESIS_ = 30;


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.dom.gestures.SwipeRecognizer.prototype.getTouchCount = function() {
  return this.touchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 1.
 */
goog.dom.gestures.SwipeRecognizer.prototype.setTouchCount = function(value) {
  goog.asserts.assert(this.getState() == goog.dom.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.touchCount_ = value;
};


/**
 * @return {goog.dom.gestures.Direction} The direction of the recognized swipe
 *     gesture.
 */
goog.dom.gestures.SwipeRecognizer.prototype.getDirection = function() {
  return this.direction_;
};


/**
 * @override
 */
goog.dom.gestures.SwipeRecognizer.prototype.reset = function() {
  this.watching_ = false;
  this.startTime_ = 0;
  this.startX_ = this.startY_ = 0;
  this.direction_ = goog.dom.gestures.Direction.NONE;
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.dom.gestures.SwipeRecognizer.prototype.touchesBegan = function(e) {
  if (this.getState() != goog.dom.gestures.State.POSSIBLE) {
    return;
  }

  if (e.targetTouches.length != this.touchCount_) {
    // Touch count mismatch, no way to recognize
    this.setState(goog.dom.gestures.State.FAILED);
    this.reset();
    return;
  }
};


/**
 * @override
 */
goog.dom.gestures.SwipeRecognizer.prototype.touchesMoved = function(e) {
  if (this.getState() != goog.dom.gestures.State.POSSIBLE) {
    return;
  }

  // Grab the latest centroid position
  this.updateLocation(e.targetTouches);

  // If the right number of touches are down, we may be recongized
  if (e.targetTouches.length == this.touchCount_) {
    if (!this.watching_) {
      // First time, reset start position
      this.watching_ = true;
      this.startTime_ = goog.now();
      this.startX_ = this.getPageX();
      this.startY_ = this.getPageY();
    } else {
      // In a cycle, check for distance threshold
      var dx = this.getPageX() - this.startX_;
      var dy = this.getPageY() - this.startY_;

      // TODO(benvanik): vary the slip allowed by the elapsed time
      var elapsed = goog.now() - this.startTime_;
      var distanceRequired = this.moveHysteresis_;
      var slipAllowed = distanceRequired / 3;

      var direction = goog.dom.gestures.Direction.NONE;
      if (dx <= -distanceRequired && Math.abs(dy) <= slipAllowed) {
        direction = goog.dom.gestures.Direction.LEFT;
      } else if (dx >= distanceRequired && Math.abs(dy) <= slipAllowed) {
        direction = goog.dom.gestures.Direction.RIGHT;
      } else if (dy <= -distanceRequired && Math.abs(dx) <= slipAllowed) {
        direction = goog.dom.gestures.Direction.UP;
      } else if (dy >= distanceRequired && Math.abs(dx) <= slipAllowed) {
        direction = goog.dom.gestures.Direction.DOWN;
      }

      if (direction != goog.dom.gestures.Direction.NONE) {
        this.direction_ = direction;
        this.setState(goog.dom.gestures.State.RECOGNIZED);
      }
    }
  }
};


/**
 * @override
 */
goog.dom.gestures.SwipeRecognizer.prototype.touchesEnded = function(e) {
  if (!e.targetTouches.length) {
    this.reset();
  }
};


/**
 * @override
 */
goog.dom.gestures.SwipeRecognizer.prototype.touchesCancelled = function(e) {
  this.reset();
};
