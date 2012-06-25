@ECHO OFF

REM Copyright 2012 Google Inc. All Rights Reserved.
REM
REM goog-gestures Windows setup script
REM
REM This script will install all dependencies to the system (that it can).
REM The dependencies are all global.
REM
REM Requires:
REM - Git 1.7.5+
REM - Python 2.7+
REM - Python easy_install:  http://pypi.python.org/pypi/setuptools

REM TODO(benvanik): check python/node versions

ECHO.
REM ============================================================================
REM Closure linter
REM ============================================================================
ECHO Installing Closure linter...

easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz

ECHO.
REM ============================================================================
REM Closure Compiler
REM ============================================================================
ECHO Grabbing latest Closure compiler...

REM TODO(benvanik): download compiler-latest (somehow?)

ECHO.
REM ============================================================================
REM Python dependencies
REM ============================================================================
ECHO Installing Python packages...

FOR %%P IN (anvil-build) DO easy_install %%P

ECHO.
