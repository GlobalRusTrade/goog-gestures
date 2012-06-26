New Recognizers
===============

* LongPressRecognizer

Recognizer Additions
====================

* Support isEnabled (currently ignored)
* Support double/N taps in TapRecognizer
* Velocity:
    * PanRecognizer (getVelocityX|Y)
    * PinchRecognizer
    * RotateRecognizer
* Factor swipe speed into precision required

Behavior
========

* Pan/scroll cancellation
    * iOS behaves weird on taps/swipes when scrolling
    * iOS scrolls when moving the complex box

Performance/Reuse
=================

This are speculative, but would help when many gestures are attached.

* Cache the first use of updateLocation on a view for the given touch set (perf)
* Adding touch deltas/distance on all touches (code size/perf)
