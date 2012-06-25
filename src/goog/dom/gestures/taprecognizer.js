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
  this.moveHysteresis_ = goog.dom.gestures.TapRecognizer.DEFAULT_HYSTERESIS_;

  /**
   * The total distance the center has moved, in px.
   * @private
   * @type {number}
   */
  this.centroidDistance_ = 0;
};
goog.inherits(goog.dom.gestures.TapRecognizer, goog.dom.gestures.Recognizer);


/**
 * Default movement hysteresis.
 * If the touch centroid moves more than this the gesture will fail to
 * recognize.
 * @private
 * @const
 * @type {number}
 */
goog.dom.gestures.TapRecognizer.DEFAULT_HYSTERESIS_ = 40;


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
  this.centroidDistance_ = 0;
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.dom.gestures.TapRecognizer.prototype.touchesBegan = function(e) {
  if (this.getState() != goog.dom.gestures.State.POSSIBLE) {
    return;
  }

  if (e.targetTouches.length > this.touchCount_) {
    // Exceeded touch count, no way to recognize
    this.setState(goog.dom.gestures.State.FAILED);
    return;
  }

  this.updateLocation(e.targetTouches);
};


/**
 * @override
 */
goog.dom.gestures.TapRecognizer.prototype.touchesMoved = function(e) {
  if (this.getState() != goog.dom.gestures.State.POSSIBLE) {
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
  if (this.centroidDistance_ >= this.moveHysteresis_) {
    // Touch has moved too much - fail
    this.setState(goog.dom.gestures.State.FAILED);
    return;
  }
};


/**
 * @override
 */
goog.dom.gestures.TapRecognizer.prototype.touchesEnded = function(e) {
  if (this.getState() == goog.dom.gestures.State.POSSIBLE) {
    // TODO(benvanik): tap count
    // TODO(benvanik): touch count
    if (e.targetTouches.length + e.changedTouches.length == this.touchCount_) {
      this.setState(goog.dom.gestures.State.RECOGNIZED);
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
goog.dom.gestures.TapRecognizer.prototype.touchesCancelled = function(e) {
  this.setState(goog.dom.gestures.State.CANCELLED);
  this.reset();
};
