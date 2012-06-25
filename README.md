goog-gestures
=============

A simple Closure touch gesture library. This will hopefully be merged into the
Closure Library at some point, but is here to play with until I can get it good
enough to justify getting it included :)

More info forthcoming as I actually build something.

## Setup

Wanna play around?

```
# ensure you have python and easy_install!
# clone the repo
git clone https://github.com/benvanik/goog-gestures.git
cd goog-gestures/
# run the setup script to initialize the repo and dependencies
sudo ./tools/setup.sh
# start a local webserver on :8080
anvil serve
# build debug, open http://localhost:8080/examples/example1.html?uncompiled
anvil build :debug
# build release, open http://localhost:8080/examples/example1.html
anvil build :release
# deploy a release build
anvil deploy -o /tmp/goog-gestures-release/ :release
```

## Contributing

Have a fix or feature? Submit a pull request - I love them!
Note that I do keep to the [style_guide](https://github.com/benvanik/games-framework/blob/master/docs/style_guide.md),
so please check it out first!

As this is a Google project, you *must* first e-sign the
[Google Contributor License Agreement](http://code.google.com/legal/individual-cla-v1.0.html) before I can accept any
code. It takes only a second and basically just says you won't sue us or claim copyright of your submitted code.

## License

All code except dependencies under third_party/ is licensed under the permissive Apache 2.0 license.
Feel free to fork/rip/etc and use as you wish!

## Credits

Code by [Ben Vanik](http://noxa.org). See [AUTHORS](https://github.com/benvanik/goog-gestures/blob/master/AUTHORS) for additional contributors.
