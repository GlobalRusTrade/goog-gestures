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

goog.provide('goog.events.gestures.Direction');


// TODO(benvanik): consider making the values here degrees, which would allow
//     for recognizers to have 8-way support or event arbitrary detection.


/**
 * A direction as indicated by a gesture.
 * @enum {number}
 */
goog.events.gestures.Direction = {
  /**
   * No direction was indicated.
   */
  NONE: 0,

  /**
   * The gesture moved up.
   */
  UP: 1,

  /**
   * The gesture moved right.
   */
  RIGHT: 2,

  /**
   * The gesture moved down.
   */
  DOWN: 3,

  /**
   * The gesture moved left.
   */
  LEFT: 4
};

