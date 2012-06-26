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

goog.provide('goog.events.gestures.PanRecognizer');

goog.require('goog.asserts');
goog.require('goog.events.gestures.Recognizer');
goog.require('goog.events.gestures.State');
goog.require('goog.events.gestures.utils');



/**
 * A pan gesture recognizer.
 * @constructor
 * @extends {goog.events.gestures.Recognizer}
 * @param {!Element} target DOM element to attach to.
 */
goog.events.gestures.PanRecognizer = function(target) {
  goog.base(this, target);

  this.setMovementThreshold(goog.events.gestures.utils.MOVEMENT_HYSTERESIS / 2);

  /**
   * Minimum number of touches required for the gesture to recognize.
   * @private
   * @type {number}
   */
  this.minTouchCount_ = 1;

  /**
   * Maximum number of touches required for the gesture to recognize.
   * @private
   * @type {number}
   */
  this.maxTouchCount_ = Number.MAX_VALUE;

  /**
   * Translation X of the last change.
   * @private
   * @type {number}
   */
  this.translationX_ = 0;

  /**
   * Translation Y of the last change.
   * @private
   * @type {number}
   */
  this.translationY_ = 0;

  /**
   * Last translation X.
   * @private
   * @type {number}
   */
  this.lastTranslationX_ = 0;

  /**
   * Last translation Y.
   * @private
   * @type {number}
   */
  this.lastTranslationY_ = 0;

  /**
   * X of the centroid when the gesture first began.
   * @private
   * @type {number}
   */
  this.centroidStartX_ = 0;

  /**
   * Y of the centroid when the gesture first began.
   * @private
   * @type {number}
   */
  this.centroidStartY_ = 0;

  /**
   * Current shift accumulation in centroid offset X.
   * @private
   * @type {number}
   */
  this.centroidShiftX_ = 0;

  /**
   * Current shift accumulation in centroid offset Y.
   * @private
   * @type {number}
   */
  this.centroidShiftY_ = 0;

  /**
   * The total distance the center has moved, in px.
   * @private
   * @type {number}
   */
  this.centroidDistance_ = 0;
};
goog.inherits(goog.events.gestures.PanRecognizer,
    goog.events.gestures.Recognizer);


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.events.gestures.PanRecognizer.prototype.getMinimumTouchCount = function() {
  return this.minTouchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 1.
 */
goog.events.gestures.PanRecognizer.prototype.setMinimumTouchCount =
    function(value) {
  goog.asserts.assert(this.getState() == goog.events.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.minTouchCount_ = value;
};


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.events.gestures.PanRecognizer.prototype.getMaximumTouchCount = function() {
  return this.maxTouchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 1.
 */
goog.events.gestures.PanRecognizer.prototype.setMaximumTouchCount =
    function(value) {
  goog.asserts.assert(this.getState() == goog.events.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  goog.asserts.assert(this.maxTouchCount_ >= value);
  this.maxTouchCount_ = value;
};


/**
 * @return {number} The amount of translation on X since the gesture began.
 */
goog.events.gestures.PanRecognizer.prototype.getTranslationX = function() {
  return this.translationX_;
};


/**
 * @return {number} The amount of translation on Y since the gesture began.
 */
goog.events.gestures.PanRecognizer.prototype.getTranslationY = function() {
  return this.translationY_;
};


/**
 * @return {number} The change of translation on X.
 */
goog.events.gestures.PanRecognizer.prototype.getTranslationDeltaX = function() {
  return this.translationX_ - this.lastTranslationX_;
};


/**
 * @return {number} The change of translation on Y.
 */
goog.events.gestures.PanRecognizer.prototype.getTranslationDeltaY = function() {
  return this.translationY_ - this.lastTranslationY_;
};


/**
 * Updates the current translation variables.
 * Sets delta values, so only call once per update.
 * @private
 */
goog.events.gestures.PanRecognizer.prototype.updateTranslation_ = function() {
  this.lastTranslationX_ = this.translationX_;
  this.lastTranslationY_ = this.translationY_;
  this.translationX_ =
      this.getPageX() - this.centroidStartX_ + this.centroidShiftX_;
  this.translationY_ =
      this.getPageY() - this.centroidStartY_ + this.centroidShiftY_;
};


/**
 * @override
 */
goog.events.gestures.PanRecognizer.prototype.reset = function() {
  this.translationX_ = this.translationY_ = 0;
  this.lastTranslationX_ = this.lastTranslationY_ = 0;
  this.centroidStartX_ = this.centroidStartY_ = 0;
  this.centroidShiftX_ = this.centroidShiftY_ = 0;
  this.centroidDistance_ = 0;
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.events.gestures.PanRecognizer.prototype.touchesBegan = function(e) {
  var oldPageX = this.getPageX();
  var oldPageY = this.getPageY();
  this.updateLocation(e.targetTouches);

  if (this.getState() == goog.events.gestures.State.CHANGED) {
    // New touch while recognizing, shift centroid
    this.centroidShiftX_ -= this.getPageX() - oldPageX;
    this.centroidShiftY_ -= this.getPageY() - oldPageY;
    this.updateTranslation_();

    if (e.targetTouches.length > this.maxTouchCount_) {
      // Exceeded touch count, stop recognizing
      this.setState(goog.events.gestures.State.ENDED);
      this.reset();
      return;
    }
  }
};


/**
 * @override
 */
goog.events.gestures.PanRecognizer.prototype.touchesMoved = function(e) {
  // Ignore if out of touch range
  if (e.targetTouches.length < this.minTouchCount_ ||
      e.targetTouches.length > this.maxTouchCount_) {
    return;
  }

  // Grab the latest centroid position
  var oldPageX = this.getPageX();
  var oldPageY = this.getPageY();
  this.updateLocation(e.targetTouches);
  var pageX = this.getPageX();
  var pageY = this.getPageY();

  // Compute distance moved
  var dx = pageX - oldPageX;
  var dy = pageY - oldPageY;
  this.centroidDistance_ += Math.sqrt(dx * dx + dy * dy);

  // Begin if we have moved far enough
  if (this.getState() == goog.events.gestures.State.POSSIBLE &&
      this.centroidDistance_ > this.getMovementThreshold()) {
    // Moved far enough, start (or try to)
    this.centroidStartX_ = pageX;
    this.centroidStartY_ = pageY;
    this.centroidShiftX_ = this.centroidShiftY_ = 0;
    this.updateTranslation_();
    this.setState(goog.events.gestures.State.BEGAN);
    if (this.getState() == goog.events.gestures.State.BEGAN) {
      this.setState(goog.events.gestures.State.CHANGED);
    }
  } else if ((dx || dy) &&
      this.getState() == goog.events.gestures.State.CHANGED) {
    // Normal update
    this.updateTranslation_();
    this.setState(goog.events.gestures.State.CHANGED);
  }
};


/**
 * @override
 */
goog.events.gestures.PanRecognizer.prototype.touchesEnded = function(e) {
  if (this.getState() == goog.events.gestures.State.CHANGED) {
    if (e.targetTouches.length >= this.minTouchCount_) {
      // Still have some valid touches - shift centroid
      var oldPageX = this.getPageX();
      var oldPageY = this.getPageY();
      this.updateLocation(e.targetTouches);
      this.centroidShiftX_ -= this.getPageX() - oldPageX;
      this.centroidShiftY_ -= this.getPageY() - oldPageY;
      this.updateTranslation_();
    } else {
      // Not enough touches
      this.setState(goog.events.gestures.State.ENDED);
      this.reset();
    }
  }
};


/**
 * @override
 */
goog.events.gestures.PanRecognizer.prototype.touchesCancelled = function(e) {
  if (this.getState() == goog.events.gestures.State.CHANGED) {
    this.setState(goog.events.gestures.State.CANCELLED);
    this.reset();
  }
};
