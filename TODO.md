LongPressRecognizer
TapRecognizer support double taps


cache the first use of updateLocation on a view for the given touch set,
enabling better perf when many gestures are attached

rename rotation angle/scale values to indicate that they are deltas
allow getting the accumulated values
