New Recognizers
===============

* LongPressRecognizer

Recognizer Additions
====================

* TapRecognizer getTranslationDeltaX|Y
* Support double/N taps in TapRecognizer
* Velocity:
    * PanRecognizer (getVelocityX|Y)
    * PinchRecognizer
    * RotationRecognizer
* Factor swipe speed into precision required

Performance/Reuse
=================

This are speculative, but would help when many gestures are attached.

* Cache the first use of updateLocation on a view for the given touch set (perf)
* Adding touch deltas/distance on all touches (code size/perf)
