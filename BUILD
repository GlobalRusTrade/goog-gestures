# Copyright 2012 Google Inc. All Rights Reserved.

__author__ = 'benvanik@google.com (Ben Vanik)'

# Master build file for goog-gestures

# ----------------------------------------------------------------------------------------------------------------------
# Third Party
# ----------------------------------------------------------------------------------------------------------------------

# Closure Library JS files
file_set(
    name='all_closure_js',
    srcs=
        glob('third_party/closure-library/closure/goog/**/*.js') +
        glob('third_party/closure-library/third_party/closure/goog/**/*.js'))

# Files required when deploying uncompiled builds
file_set(
    name='all_uncompiled_js',
    srcs=[
        'third_party/closure-library/closure/goog/deps.js',
        'third_party/closure-library/closure/goog/bootstrap/webworkers.js',
        ])

# Closure externs files
file_set(
    name='closure_externs',
    srcs=glob('externs/**/*.js'))

# Closure Compiler JAR
file_set(
    name='closure_compiler_jar',
    srcs=['third_party/closure-compiler/compiler.jar'])
JS_COMPILER_JAR=':closure_compiler_jar'


# ----------------------------------------------------------------------------------------------------------------------
# JavaScript
# ----------------------------------------------------------------------------------------------------------------------

file_set(
    name='all_js',
    srcs=glob('src/**/*.js'))

closure_js_fixstyle(
    name='all_js_fixstyle',
    namespaces=['goog',],
    srcs=[
        ':all_js',
        ])

closure_js_lint(
    name='all_js_lint',
    namespaces=['goog',],
    srcs=[':all_js_fixstyle'])

GESTURES_JS_SRCS=[
    ':all_closure_js',
    ':all_js',
    ]

SHARED_JS_FLAGS=[
    '--define=goog.DEBUG=false',
    '--define=goog.asserts.ENABLE_ASSERTS=false',
    ]

closure_js_library(
    name='gestures_js_uncompiled',
    mode='UNCOMPILED',
    entry_points=[],
    srcs=GESTURES_JS_SRCS,
    compiler_jar=JS_COMPILER_JAR)

closure_js_library(
    name='gestures_js_compiled',
    mode='ADVANCED',
    entry_points=['goog.events.gestures.exports'],
    srcs=GESTURES_JS_SRCS,
    externs=[':closure_externs'],
    compiler_jar=JS_COMPILER_JAR,
    compiler_flags=SHARED_JS_FLAGS + [
        '--define=goog.events.gestures.exports.ENABLE_EXPORTS=true',
        ],
    wrap_with_global='window');


# ----------------------------------------------------------------------------------------------------------------------
# Static files
# ----------------------------------------------------------------------------------------------------------------------

file_set(
    name='example_files',
    srcs=glob('examples/*.*'))


# ----------------------------------------------------------------------------------------------------------------------
# Target rules
# ----------------------------------------------------------------------------------------------------------------------

file_set(
    name='lint',
    deps=':all_js_lint')

file_set(
    name='debug',
    srcs=[
        ':gestures_js_uncompiled',
        ])

file_set(
    name='release',
    srcs=[
        ':gestures_js_compiled',
        ],
    deps=[
        #':all_js_lint',
        ])

file_set(
    name='pages_release',
    srcs=[
        ':example_files',
        ':gestures_js_compiled',
        ])
