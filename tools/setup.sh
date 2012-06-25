#!/bin/bash

# Copyright 2012 Google Inc. All Rights Reserved.

# goog-gestures unix setup script

# This script sets up the repository and dependencies.

# Ensure running as root (or on Cygwin, where it doesn't matter)
if [ "$(id -u)" -ne 0 ]; then
  if [ ! -e "/Cygwin.bat" ]; then
    echo "This script must be run as root to install Python and system packages"
    echo "Run with sudo!"
    exit 1
  fi
fi

# ==============================================================================
# Pull in GF
# ==============================================================================
echo "Grabbing third_party/..."

sudo -u "$SUDO_USER" git submodule init
sudo -u "$SUDO_USER" git submodule update

echo ""
# ==============================================================================
# Check for Python/node/etc
# ==============================================================================
echo "Checking for dependencies..."

echo "- Python 2.6+:"
if [ ! -e "$(which python)" ]; then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "! Python not found or not in PATH - at least version 2.6 is required           !"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  exit 1
fi
PYTHON_CHECK=`python -c 'import sys; print(sys.version_info >= (2, 6) and "1" or "0")'`
PYTHON_VERSION=`python -c 'import sys; print(sys.version_info[:])'`
if [ "$PYTHON_CHECK" = "0" ]; then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "! Python is out of date - at least version 2.6 is required                     !"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "Your version: $PYTHON_VERSION"
  exit 1
fi
echo "     path: $(which python)"
echo "  version: $PYTHON_VERSION"

echo "- Python easy_install:"
if [ ! -e "$(which easy_install)" ]; then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "! easy_install not found or not in PATH                                        !"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "Grab the latest version from: http://pypi.python.org/pypi/setuptools"
  exit 1
fi
echo "     path: $(which easy_install)"

echo ""
# ==============================================================================
# Closure linter
# ==============================================================================
echo "Installing Closure linter..."

easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz

echo ""
# =============================================================================
# Closure Compiler
# =============================================================================
echo "Grabbing latest Closure compiler..."

# TODO(benvanik): compile from source
cd third_party
if [ ! -e closure-compiler ]; then
  mkdir closure-compiler
fi
cd closure-compiler
wget -nv http://closure-compiler.googlecode.com/files/compiler-latest.zip
unzip -o -q compiler-latest.zip
rm compiler-latest.zip
cd ..
cd ..

echo ""
# ==============================================================================
# Python dependencies
# ==============================================================================
echo "Installing Python packages..."

PYTHON_PACKAGES=( anvil-build )

for p in ${PYTHON_PACKAGES[@]}
do
  easy_install $p
done

echo ""
