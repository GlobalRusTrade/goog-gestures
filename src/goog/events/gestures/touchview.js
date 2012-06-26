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

goog.provide('goog.events.gestures.TouchView');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events.EventType');
goog.require('goog.events.gestures.State');



/**
 * A wrapper for DOM elements that ensures consistent event handling.
 * Touch view instances are created only as needed and disposed when no longer
 * used. They are stored as properties on the DOM elements, and as such are at
 * risk for leaking. It is up to application authors to properly manage the
 * lifetime of their gestures (disposing them when no longer needed) to ensure
 * that leaks do not occur.
 *
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Element} target Target DOM element.
 */
goog.events.gestures.TouchView = function(target) {
  goog.base(this);

  /**
   * Target DOM element.
   * @private
   * @type {!Element}
   */
  this.target_ = target;

  /**
   * All recognizers attached to this view.
   * @private
   * @type {!Array.<!goog.events.gestures.Recognizer>}
   */
  this.recognizers_ = [];

  /**
   * All currently bound event handlers.
   * This should only be manipulated by {@see #bindAllEvents_}.
   * @private
   * @type {!Array.<!{eventType: string, listener: !Function}>}
   */
  this.boundHandlers_ = [];

  // Bind to the target DOM element
  goog.asserts.assert(
      !this.target_[goog.events.gestures.TouchView.DOM_PROPERTY_]);
  this.target_[goog.events.gestures.TouchView.DOM_PROPERTY_] = this;

  // Bind all events
  // The expectation is that if we are created we will be using them soon
  this.bindAllEvents_();
};
goog.inherits(goog.events.gestures.TouchView, goog.Disposable);


/**
 * @override
 */
goog.events.gestures.TouchView.prototype.disposeInternal = function() {
  // Cleanup any recognizers (if they exist)
  this.removeAllGestureRecognizers();

  // Unbind all events
  this.unbindAllEvents_();

  // Remove from the DOM
  goog.asserts.assert(
      this.target_[goog.events.gestures.TouchView.DOM_PROPERTY_]);
  delete this.target_[goog.events.gestures.TouchView.DOM_PROPERTY_];

  goog.base(this, 'disposeInternal');
};


/**
 * Property name used on DOM elements to store touch view instances.
 * Hopefully this never conflicts with anyone.
 * @private
 * @const
 * @type {string}
 */
goog.events.gestures.TouchView.DOM_PROPERTY_ = 'gdg_view';


/**
 * Gets an existing {@see goog.events.gestures.TouchView} wrapper for the given
 * DOM element or creates a new one.
 * @param {!Element} target Target DOM element.
 * @return {!goog.events.gestures.TouchView} A view wrapper.
 */
goog.events.gestures.TouchView.getInstance = function(target) {
  var view = /** @type {goog.events.gestures.TouchView} */ (
      target[goog.events.gestures.TouchView.DOM_PROPERTY_]);
  if (view) {
    return view;
  }
  return new goog.events.gestures.TouchView(target);
};


/**
 * Disposes the touch view on the given DOM element, if it exists.
 * @param {!Element} target Target DOM element.
 */
goog.events.gestures.TouchView.disposeInstance = function(target) {
  var view = /** @type {goog.events.gestures.TouchView} */ (
      target[goog.events.gestures.TouchView.DOM_PROPERTY_]);
  if (view) {
    // Dispose and remove from the element
    goog.dispose(view);
  }
};


/**
 * @return {!Element} Target DOM element.
 */
goog.events.gestures.TouchView.prototype.getTarget = function() {
  return this.target_;
};


/**
 * Adds a new gesture recognizer to this view.
 * @param {!goog.events.gestures.Recognizer} recognizer Recognizer to add.
 */
goog.events.gestures.TouchView.prototype.addGestureRecognizer =
    function(recognizer) {
  goog.asserts.assert(!recognizer.isDisposed());
  goog.asserts.assert(!goog.array.contains(this.recognizers_, recognizer));
  this.recognizers_.push(recognizer);
};


/**
 * Removes a gesture recognizer from this view.
 * @param {!goog.events.gestures.Recognizer} recognizer Recognizer to remove.
 */
goog.events.gestures.TouchView.prototype.removeGestureRecognizer =
    function(recognizer) {
  goog.asserts.assert(goog.array.contains(this.recognizers_, recognizer));
  goog.array.remove(this.recognizers_, recognizer);
  goog.dispose(recognizer);
  if (!this.recognizers_.length) {
    // last recognizer removed - no need to keep this around
    goog.dispose(this);
  }
};


/**
 * Removes all gesture recognizers from this view.
 */
goog.events.gestures.TouchView.prototype.removeAllGestureRecognizers =
    function() {
  goog.disposeAll(this.recognizers_);
  this.recognizers_.length = 0;
  goog.dispose(this);
};


/**
 * Gets a list of all gesture recognizers currently attached to the view.
 * The returned list should not be modified and may change at any time.
 * @return {!Array.<!goog.events.gestures.Recognizer>} All recognizers attached
 *     to this view.
 */
goog.events.gestures.TouchView.prototype.getGestureRecognizers = function() {
  return this.recognizers_;
};


/**
 * Binds all event handlers.
 * @private
 */
goog.events.gestures.TouchView.prototype.bindAllEvents_ = function() {
  // NOTE: we do not use goog.events.* here, as it adds a significant amount of
  //     overhead to each event. We are less concerned with browser event
  //     normalization and more about manipulating them quickly.
  // NOTE: we avoid using goog.bind here as bind has very bad call-through perf.

  // Unbind first
  if (this.boundHandlers_.length) {
    this.unbindAllEvents_();
  }

  var recognizers = this.recognizers_;
  /**
   * @param {!TouchEvent} e Event.
   */
  function dispatchEvent(e) {
    // TODO(benvanik): better logging switch
    if (goog.DEBUG) {
      window.console.log(e.type, e);
    }

    var preventDefault = false;
    for (var n = 0; n < recognizers.length; n++) {
      var recognizer = recognizers[n];
      switch (e.type) {
        case goog.events.EventType.TOUCHSTART:
          recognizer.touchesBegan(e);
          break;
        case goog.events.EventType.TOUCHMOVE:
          recognizer.touchesMoved(e);
          break;
        case goog.events.EventType.TOUCHEND:
          recognizer.touchesEnded(e);
          break;
        case goog.events.EventType.TOUCHCANCEL:
          recognizer.touchesCancelled(e);
          break;
      }

      // TODO(benvanik): let the gesture define whether they want to prevent
      //     default - maybe even a settable attribute
      var state = recognizer.getState();
      switch (state) {
        case goog.events.gestures.State.BEGAN:
        case goog.events.gestures.State.CHANGED:
        case goog.events.gestures.State.ENDED:
          preventDefault = true;
          break;
      }
    }

    if (preventDefault) {
      e.preventDefault();
    }
  };

  // Bind all events
  this.bindEventHandler_(goog.events.EventType.TOUCHSTART, dispatchEvent);
  this.bindEventHandler_(goog.events.EventType.TOUCHMOVE, dispatchEvent);
  this.bindEventHandler_(goog.events.EventType.TOUCHEND, dispatchEvent);
  this.bindEventHandler_(goog.events.EventType.TOUCHCANCEL, dispatchEvent);
};


/**
 * Binds an event handler to the target and registers it for unbinding.
 * @private
 * @param {string} eventType Event type name.
 * @param {!Function} listener Event listener.
 */
goog.events.gestures.TouchView.prototype.bindEventHandler_ =
    function(eventType, listener) {
  this.boundHandlers_.push({
    eventType: eventType,
    listener: listener
  });
  this.target_.addEventListener(eventType, listener, true);
};


/**
 * Unbinds all event handlers.
 * @private
 */
goog.events.gestures.TouchView.prototype.unbindAllEvents_ = function() {
  var target = this.target_;
  for (var n = 0; n < this.boundHandlers_.length; n++) {
    var handler = this.boundHandlers_[n];
    target.removeEventListener(handler.eventType, handler.listener, true);
  }
  this.boundHandlers_.length = 0;
};
