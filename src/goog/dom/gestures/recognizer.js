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

goog.provide('goog.dom.gestures.CallbackFunction');
goog.provide('goog.dom.gestures.Recognizer');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.dom.gestures.State');
goog.require('goog.dom.gestures.TouchView');


/**
 * A callback function that receives the gesture that originated the call.
 * @typedef {function(!goog.dom.gestures.Recognizer)}
 */
goog.dom.gestures.CallbackFunction;



/**
 * Abstract base type for gesture recognizers.
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Element} target Target DOM element.
 */
goog.dom.gestures.Recognizer = function(target) {
  goog.base(this);

  /**
   * Target DOM element.
   * @private
   * @type {!Element}
   */
  this.target_ = target;

  /**
   * Target touch view.
   * @private
   * @type {!goog.dom.gestures.TouchView}
   */
  this.view_ = goog.dom.gestures.TouchView.getInstance(this.target_);

  /**
   * Whether the recognizer is actively listening for gestures.
   * @private
   * @type {boolean}
   */
  this.enabled_ = true;

  /**
   * Current state of the state machine.
   * @private
   * @type {goog.dom.gestures.State}
   */
  this.state_ = goog.dom.gestures.State.POSSIBLE;

  /**
   * X offset of the gesture from the top-left of the container element.
   * @private
   * @type {number}
   */
  this.offsetX_ = 0;

  /**
   * Y offset of the gesture from the top-left of the container element.
   * @private
   * @type {number}
   */
  this.offsetY_ = 0;

  /**
   * X offset of the gesture from the top-left of the visible window.
   * @private
   * @type {number}
   */
  this.clientX_ = 0;

  /**
   * Y offset of the gesture from the top-left of the visible window.
   * @private
   * @type {number}
   */
  this.clientY_ = 0;

  /**
   * X offset of the gesture from the top-left of the page.
   * @private
   * @type {number}
   */
  this.pageX_ = 0;

  /**
   * Y offset of the gesture from the top-left of the page.
   * @private
   * @type {number}
   */
  this.pageY_ = 0;

  /**
   * Listeners for recognizer updates.
   * @private
   * @type {!Array.<!goog.dom.gestures.Recognizer.Listener_>}
   */
  this.listeners_ = [];

  // TODO(benvanik): chaining (require failure of another gesture, for 2x tap)
  // TODO(benvanik): cancel touches in the target that the recognizer eats
  // TODO(benvanik): delay touches to the target until failure, if desired

  // All ready - add to view
  this.view_.addGestureRecognizer(this);
};
goog.inherits(goog.dom.gestures.Recognizer, goog.Disposable);


/**
 * @override
 */
goog.dom.gestures.Recognizer.prototype.disposeInternal = function() {
  // This will handle failing the gesture gracefully
  this.setEnabled(false);

  // Remove from view -- note that this may cause the view to be disposed
  this.view_.removeGestureRecognizer(this);

  goog.base(this, 'disposeInternal');
};


/**
 * @return {!Element} The target DOM element this recognizer is attached to.
 */
goog.dom.gestures.Recognizer.prototype.getTarget = function() {
  return this.target_;
};


/**
 * @return {!goog.dom.gestures.TouchView} The touch view this recognizer is
 *     attached to.
 */
goog.dom.gestures.Recognizer.prototype.getView = function() {
  return this.view_;
};


/**
 * @return {boolean} Whether the recognizer is listening for gestures.
 */
goog.dom.gestures.Recognizer.prototype.isEnabled = function() {
  return this.enabled_;
};


/**
 * Sets whether the recognizer is attempting to recognize gestures.
 * If a recognizer is disabled and there are chained recognizers, they will all
 * operate as if the recognizer is always failing.
 * @param {boolean} value Whether to enable the recognizer.
 */
goog.dom.gestures.Recognizer.prototype.setEnabled = function(value) {
  if (this.enabled_ == value) {
    return;
  }
  this.enabled_ = value;

  // If we are in the middle of a gesture, fail
  // This will allow for the proper chaining logic
  if (this.state_ != goog.dom.gestures.State.POSSIBLE) {
    this.setState(goog.dom.gestures.State.FAILED);
  }
};


/**
 * @return {goog.dom.gestures.State} Current state of the state machine.
 */
goog.dom.gestures.Recognizer.prototype.getState = function() {
  return this.state_;
};


/**
 * Transitions the state machine to a new state.
 * @protected
 * @param {goog.dom.gestures.State} value The new state machine state.
 */
goog.dom.gestures.Recognizer.prototype.setState = function(value) {
  window.console.log('setState(' + value + ')');

  // Verify state transition is valid - this may assert
  if (!this.isValidTransition_(this.state_, value)) {
    return;
  }
  this.state_ = value;

  // Callback
  this.issueCallback();
};


/**
 * Validates that the given state machine transition is legal.
 * @private
 * @param {goog.dom.gestures.State} oldState Previous state machine state.
 * @param {goog.dom.gestures.State} newState Desired state machine state.
 * @return {boolean} True if the given transition is valid.
 */
goog.dom.gestures.Recognizer.prototype.isValidTransition_ =
    function(oldState, newState) {
  // NOTE: we assert here as well as check so that we can behave correctly in
  //     compiled mode as well as have good asserts in debug.
  var valid = true;
  switch (newState) {
    case goog.dom.gestures.State.POSSIBLE:
      break;
    case goog.dom.gestures.State.BEGAN:
      goog.asserts.assert(oldState == goog.dom.gestures.State.POSSIBLE);
      valid = oldState == goog.dom.gestures.State.POSSIBLE;
      break;
    case goog.dom.gestures.State.CHANGED:
      goog.asserts.assert(
          oldState == goog.dom.gestures.State.BEGAN ||
          oldState == goog.dom.gestures.State.CHANGED);
      valid =
          oldState == goog.dom.gestures.State.BEGAN ||
          oldState == goog.dom.gestures.State.CHANGED;
      break;
    case goog.dom.gestures.State.ENDED:
    case goog.dom.gestures.State.RECOGNIZED:
      goog.asserts.assert(
          oldState == goog.dom.gestures.State.POSSIBLE ||
          oldState == goog.dom.gestures.State.BEGAN ||
          oldState == goog.dom.gestures.State.CHANGED);
      valid =
          oldState == goog.dom.gestures.State.POSSIBLE ||
          oldState == goog.dom.gestures.State.BEGAN ||
          oldState == goog.dom.gestures.State.CHANGED;
      break;
    case goog.dom.gestures.State.CANCELLED:
      goog.asserts.assert(
          oldState == goog.dom.gestures.State.BEGAN ||
          oldState == goog.dom.gestures.State.CHANGED);
      valid =
          oldState == goog.dom.gestures.State.BEGAN ||
          oldState == goog.dom.gestures.State.CHANGED;
      break;
    case goog.dom.gestures.State.FAILED:
      goog.asserts.assert(oldState == goog.dom.gestures.State.POSSIBLE);
      valid = oldState == goog.dom.gestures.State.POSSIBLE;
      break;
  }
  return valid;
};


/**
 * @return {number} X offset of the gesture from the top-left of the container
 *     element.
 */
goog.dom.gestures.Recognizer.prototype.getOffsetX = function() {
  return this.offsetX_;
};


/**
 * @return {number} Y offset of the gesture from the top-left of the container
 *     element.
 */
goog.dom.gestures.Recognizer.prototype.getOffsetY = function() {
  return this.offsetY_;
};


/**
 * @return {number} X offset of the gesture from the top-left of the browser
 *     window.
 */
goog.dom.gestures.Recognizer.prototype.getClientX = function() {
  return this.clientX_;
};


/**
 * @return {number} Y offset of the gesture from the top-left of the browser
 *     window.
 */
goog.dom.gestures.Recognizer.prototype.getClientY = function() {
  return this.clientY_;
};


/**
 * @return {number} X offset of the gesture from the top-left of the page.
 */
goog.dom.gestures.Recognizer.prototype.getPageX = function() {
  return this.pageX_;
};


/**
 * @return {number} Y offset of the gesture from the top-left of the page.
 */
goog.dom.gestures.Recognizer.prototype.getPageY = function() {
  return this.pageY_;
};


/**
 * Resets all state to the default values.
 * This will be called when the state machine transitions back to
 * {@see goog.dom.gestures.State.POSSIBLE}.
 * @protected
 */
goog.dom.gestures.Recognizer.prototype.reset = function() {
  this.setState(goog.dom.gestures.State.POSSIBLE);
  this.updateLocation();
};


/**
 * Adds a new listener.
 * This must only be called when the recognizer is in the
 * {@see goog.dom.gestures.State.POSSIBLE} state.
 * @param {!goog.dom.gestures.CallbackFunction} callback Callback function.
 * @param {Object=} opt_scope Scope that the callback will be called in.
 */
goog.dom.gestures.Recognizer.prototype.addListener =
    function(callback, opt_scope) {
  goog.asserts.assert(this.state_ == goog.dom.gestures.State.POSSIBLE);
  this.listeners_.push(
      new goog.dom.gestures.Recognizer.Listener_(callback, opt_scope));
};


/**
 * Issues a callback to the listener on an update, optionally resetting state.
 * @protected
 * @param {boolean=} opt_reset Reset the recognizer to {@code POSSIBLE}.
 */
goog.dom.gestures.Recognizer.prototype.issueCallback = function(opt_reset) {
  // Notify all listeners
  for (var n = 0; n < this.listeners_.length; n++) {
    var listener = this.listeners_[n];
    // TODO(benvanik): protected the callbacks? Catch exceptions and rethrow
    //     after cleanup?
    listener.callback.call(listener.scope, this);
  }

  // Reset to POSSIBLE if requested
  if (opt_reset) {
    this.reset();
  }
};


/**
 * Updates the gesture location based on the given touches.
 * If there are no touches the location will be reset. If there are multiple
 * touches the centroid will be used.
 * @protected
 * @param {Array.<!TouchEvent>|TouchList=} opt_touches A list of active touches.
 */
goog.dom.gestures.Recognizer.prototype.updateLocation = function(opt_touches) {
  if (!opt_touches || !opt_touches.length) {
    // No touches - reset
    this.offsetX_ = this.offsetY_ = 0;
    this.clientX_ = this.clientY_ = 0;
    this.pageX_ = this.pageY_ = 0;
  } else if (opt_touches.length == 1) {
    // One touch - fast common case
    var touch = opt_touches[0];
    this.offsetX_ = touch.clientX - this.target_.clientLeft;
    this.offsetY_ = touch.clientY - this.target_.clientTop;
    this.clientX_ = touch.clientX;
    this.clientY_ = touch.clientY;
    this.pageX_ = touch.pageX;
    this.pageY_ = touch.pageY;
  } else {
    // Compute centroid
    // NOTE: this may be possible to optimize by doing the math once and
    //     offseting by the diff between a single touches offset/client/page
    this.offsetX_ = this.offsetY_ = 0;
    this.clientX_ = this.clientY_ = 0;
    this.pageX_ = this.pageY_ = 0;
    for (var n = 0; n < opt_touches.length; n++) {
      var touch = opt_touches[n];
      this.offsetX_ += touch.offsetX;
      this.offsetY_ += touch.offsetY;
      this.clientX_ += touch.clientX;
      this.clientY_ += touch.clientY;
      this.pageX_ += touch.pageX;
      this.pageY_ += touch.pageY;
    }
    var count = opt_touches.length;
    this.offsetX_ = (this.offsetX_ / count) - this.target_.clientLeft;
    this.offsetY_ = (this.offsetY_ / count) - this.target_.clientTop;
    this.clientX_ /= count;
    this.clientY_ /= count;
    this.pageX_ /= count;
    this.pageY_ /= count;
  }
};


/**
 * Handles new touches.
 * The event given may contain many touches; use {@code changedTouches} to find
 * the new touches.
 * @protected
 * @param {!TouchEvent} e Browser touch event.
 */
goog.dom.gestures.Recognizer.prototype.touchesBegan = goog.nullFunction;


/**
 * Handles moved touches.
 * The event given may contain many touches; use {@code changedTouches} to find
 * the moved touches.
 * @protected
 * @param {!TouchEvent} e Browser touch event.
 */
goog.dom.gestures.Recognizer.prototype.touchesMoved = goog.nullFunction;


/**
 * Handles ended touches.
 * The event given may contain many touches; use {@code changedTouches} to find
 * the ended touches.
 * @protected
 * @param {!TouchEvent} e Browser touch event.
 */
goog.dom.gestures.Recognizer.prototype.touchesEnded = goog.nullFunction;


/**
 * Handles cancelled touches.
 * The event given may contain many touches; use {@code changedTouches} to find
 * the cancelled touches.
 * @protected
 * @param {!TouchEvent} e Browser touch event.
 */
goog.dom.gestures.Recognizer.prototype.touchesCancelled = goog.nullFunction;



/**
 * A listener that receives recognizer update callbacks.
 * @private
 * @constructor
 * @param {!goog.dom.gestures.CallbackFunction} callback Callback function.
 * @param {Object=} opt_scope Scope that the callback will be called in.
 */
goog.dom.gestures.Recognizer.Listener_ = function(callback, opt_scope) {
  // NOTE: this is used instead of a goog.bind so that we retain typing on
  //       everything and avoid the currently *extremely* slow call-through
  //       of bound functions.

  /**
   * Callback function.
   * @type {!goog.dom.gestures.CallbackFunction}
   */
  this.callback = callback;

  /**
   * Scope that the callback must be called in.
   * @type {!Object}
   */
  this.scope = opt_scope || goog.global;
};
