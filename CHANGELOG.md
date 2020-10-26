# Changelog
All notable changes to this project will be documented in this file.

## v1.4.0 (XXXX)

**Added**
- Option pass a callback function in the mappings object. This can be used for path details that have many possible values. See the example mappings.js for an example ([#103](https://github.com/GIScience/Leaflet.Heightgraph/issues/103)).
- Add choose selection callback to remember what attribute index was selected ([#104](https://github.com/GIScience/Leaflet.Heightgraph/issues/104)).
- Add `selectedAttributeIdx` to options to allow choosing a different attribute index than 0 ([#105](https://github.com/GIScience/Leaflet.Heightgraph/issues/105)).

## v1.3.3 (2020-10-21)

**Added**
- human readable label in the data (see example/data.js) ([#99](https://github.com/GIScience/Leaflet.Heightgraph/issues/99))

**Fixed**
- undefined event ([#102](https://github.com/GIScience/Leaflet.Heightgraph/issues/102))

## v1.3.2 (2020-07-31)

**Changed**
- module field path in package.json

## v1.3.1 (2020-07-30)

**Fixed**
- using margin width and height in tick and grid generation ([#87](https://github.com/GIScience/Leaflet.Heightgraph/issues/87))

## v1.3.0 (2020-07-30)

**Changed**
- calculation of elevation bounds to a simpler method
- README.md height graph image

**Fixed**
- resize() resets chosen category ([#97](https://github.com/GIScience/Leaflet.Heightgraph/issues/97))
- overlapping axis ticks for small heightgraph size ([#87](https://github.com/GIScience/Leaflet.Heightgraph/issues/87))

## v1.2.0 (2020-07-25)

**Added**
- click option to legend to keep it open

**Fixed**
- hg.addData toggles expand/minimize ([#94](https://github.com/GIScience/Leaflet.Heightgraph/issues/94))
- resizing with less than 2 parameters crops height graph ([#93](https://github.com/GIScience/Leaflet.Heightgraph/issues/93))
- graphStyle not adjusting legend items([#89](https://github.com/GIScience/Leaflet.Heightgraph/issues/89))
- zooming out when changing category ([#90](https://github.com/GIScience/Leaflet.Heightgraph/issues/90))
- disappearing category selection arrows on resize ([#92](https://github.com/GIScience/Leaflet.Heightgraph/issues/92))

**Security**
- update dependencies
- `npm audit fix` lodash issues

## v1.1.0 (2020-07-05)

**Added**
- `graphStyle` option to customize the graph style ([PR #85](https://github.com/GIScience/Leaflet.Heightgraph/pull/85))
- `expandControls` option to hide the close button and expand by default ([PR #82](https://github.com/GIScience/Leaflet.Heightgraph/pull/82))
- `resize` method for dynamic resizing of the heightgraph ([#78](https://github.com/GIScience/Leaflet.Heightgraph/issues/78))
- `mapMousemoveHandler` method for handling a mousemove event to show the graph- and optionally the map-marker ([PR #82](https://github.com/GIScience/Leaflet.Heightgraph/pull/82))
- `mapMouseoutHandler` method for handling the mouseout event, removing the markers ([PR #82](https://github.com/GIScience/Leaflet.Heightgraph/pull/82))

**Changed**
- `addData` method functionality ([#37](https://github.com/GIScience/Leaflet.Heightgraph/issues/37)):
    - instead of removing and adding the whole height graph only the data
    is cleared and replaced, keeping the L.control.heightgraph instance
    - mappings for subsequent data sets need to be specified during
    initialization of the height graph
- dependencies to latest ([#83](https://github.com/GIScience/Leaflet.Heightgraph/issues/83))
- prefixed class names ([#65](https://github.com/GIScience/Leaflet.Heightgraph/issues/65))

**Removed**
- unused dependencies: bower, concurrently & connect-modrewrite

## v1.0.0 (2020-06-26)

**Added**
- rollup for building and bundling d3 ([#45](https://github.com/GIScience/Leaflet.Heightgraph/issues/45))
- modularization
- `es-dev-server` (replaces lite-server) for development

**Changed**
- folder structure

**Removed**
- removed d3 dependency
- grunt as task runner
- unused dev-dependencies
- lite-server

## v0.4.1 (2019-11-15)

**Added**
- `xTick` and `yTick` option to set axis tick frequency

## v0.4.0 (2019-11-14)

**Added**
- `highlightStyle` options parameter to customize the highlighting style
for the 'elevation above' feature (horizontal line)
- more documentation to README.md
- babel transpiler
([#70](https://github.com/GIScience/Leaflet.Heightgraph/issues/70))
- minified script versions and `img` folder to distribution folder

**Changed**
- highlighting geometry type from multiPolyline to multiple L.polylines
- default values for `height` and `margins` to the ones that are actually stated in the readme
- osm tile provider to `https` instead of `http`

**Fixed**
- security issues
([#66](https://github.com/GIScience/Leaflet.Heightgraph/issues/66))
- some console error where `this._pointG` was undefined

## v0.3.0 (2019-10-29)

**Added**
- Karma test runner
- Coverage report
- ES6 Support
- height selection on drag

**Fixed**
- option initialization on `addData()` call
- `_fitSection()` not working with round-trips
- index.html not working with undefined mappings
- horizontal line for height selection jumping on reselect
([#42](https://github.com/GIScience/Leaflet.Heightgraph/issues/42))

**Changed**
- version of `d3`, `grunt-contrib-jasmine` and `Leaflet` to latest
- eol to LF in all files
- dependency source from bower to node

## 0.2.0 (2019-08-23)

**API Changes**

* The class name `focus` was renamed to `focusbox`.
`focus` might be used in many other frameworks and could lead to css conflicts.
Please make sure you update the .css when updating the .js!
([#43](https://github.com/GIScience/Leaflet.Heightgraph/pull/64) by 
[boldtrn](https://github.com/boldtrn)).

## 0.1.3 (2019-07-17)

**Improvements**

* Allow customizing x and y axis ticks
([#61](https://github.com/GIScience/Leaflet.Heightgraph/pull/61) by
[boldtrn](https://github.com/boldtrn)).

## 0.1.2 (2019-07-17)

**Improvements**

* Callback for the expand state
([#58](https://github.com/GIScience/Leaflet.Heightgraph/pull/58) by
[boldtrn](https://github.com/boldtrn)).

## 0.1.1 (2019-07-17)

**Improvements**

* Allow defining translations for labels
([#53](https://github.com/GIScience/Leaflet.Heightgraph/pull/53) by
[boldtrn](https://github.com/boldtrn)).

## 0.1.0 (2019-06-22)

**Improvements**

* Allow toggling the heightgraph on Android
([#44](https://github.com/GIScience/Leaflet.Heightgraph/pull/44) by
[boldtrn](https://github.com/boldtrn)).
* Improve horizontal drag
([#42](https://github.com/GIScience/Leaflet.Heightgraph/pull/42) by
[boldtrn](https://github.com/boldtrn)).

**API Changes**

* The width and height of the heightgraph now define the size of the heightgraph,
and not the size of the heightgraph+margins.
You might want to updated your height and width values
([#43](https://github.com/GIScience/Leaflet.Heightgraph/pull/43) by
[boldtrn](https://github.com/boldtrn)).
* The dependencies were refined, if you were using the plugin before,
you might want to recheck that you are using the correct dependencies.
