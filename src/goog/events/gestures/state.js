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

goog.provide('goog.events.gestures.State');


/**
 * All possible states of the recognizer state machine.
 * @enum {number}
 */
goog.events.gestures.State = {
  /**
   * The gesture is listening for touch events but has not yet recognized.
   */
  POSSIBLE: 0,

  /**
   * A continuous gesture has been recognized.
   * This is the first event in the sequence.
   */
  BEGAN: 1,

  /**
   * The continuous gesture has changed, but has not yet completed.
   */
  CHANGED: 2,

  /**
   * The continuous gesture has ended.
   * The recognizer will reset to {@see #POSSIBLE}.
   */
  ENDED: 3,

  /**
   * The gesture has been recognized.
   * The recognizer will reset to {@see #POSSIBLE}.
   * This is a synonym to {@see #ENDED}, useful for discrete gestures.
   */
  RECOGNIZED: 3,

  /**
   * The continuous gesture has been cancelled.
   * The recognizer will reset to {@see #POSSIBLE}.
   */
  CANCELLED: 4,

  /**
   * The gesture has failed recognition.
   * The recognizer will reset to {@see #POSSIBLE}.
   */
  FAILED: 5
};

