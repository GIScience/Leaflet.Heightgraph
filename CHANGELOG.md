0.2.0 (2019-08-23)

**API Changes**

* The class name `focus` was renamed to `focusbox`. `focus` might be used in many other frameworks and could lead to css conflicts. Please make sure you update the .css when updating the .js! ([#43](https://github.com/GIScience/Leaflet.Heightgraph/pull/64) by [boldtrn](https://github.com/boldtrn)).

0.1.3 (2019-07-17)

**Improvements**

* Allow customizing x and y axis ticks ([#61](https://github.com/GIScience/Leaflet.Heightgraph/pull/61) by [boldtrn](https://github.com/boldtrn)).

0.1.2 (2019-07-17)

**Improvements**

* Callback for the expand state ([#58](https://github.com/GIScience/Leaflet.Heightgraph/pull/58) by [boldtrn](https://github.com/boldtrn)).

0.1.1 (2019-07-17)

**Improvements**

* Allow defining translations for labels ([#53](https://github.com/GIScience/Leaflet.Heightgraph/pull/53) by [boldtrn](https://github.com/boldtrn)).

0.1.0 (2019-06-22)

**Improvements**

* Allow toggling the heightgraph on Android ([#44](https://github.com/GIScience/Leaflet.Heightgraph/pull/44) by [boldtrn](https://github.com/boldtrn)).
* Improve horizontal drag ([#42](https://github.com/GIScience/Leaflet.Heightgraph/pull/42) by [boldtrn](https://github.com/boldtrn)).

**API Changes**

* The width and height of the heightgraph now define the size of the heightgraph, and not the size of the heightgraph+margins. You might want to updated your height and width values ([#43](https://github.com/GIScience/Leaflet.Heightgraph/pull/43) by [boldtrn](https://github.com/boldtrn)).
* The dependencies were refined, if you were using the plugin before, you might want to recheck that you are using the correct dependencies.