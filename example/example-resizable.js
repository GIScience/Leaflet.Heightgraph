const map = new L.Map("map")

const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr = "Map data © <a href=\"https://openstreetmap.org\">OpenStreetMap</a> contributors"

const openstreetmap = L.tileLayer(url, {
    id: "openstreetmap",
    attribution: attr
})

const bounds = new L.LatLngBounds(new L.LatLng(47.323989, 8.108683), new L.LatLng(46.96485, 8.029803))

const hg = L.control.heightgraph({
    mappings: colorMappings,
    translation: {
        distance: "My custom distance"
    },
    expandCallback(expand) {
        console.log("Expand: "+expand)
    }
})

hg.addTo(map)

hg.addData(geojson1)

L.geoJson(geojson1).addTo(map)

map.addLayer(openstreetmap).fitBounds(bounds)

$('.heightgraph').resizable({
    handles: 'w, n, nw',
    minWidth: 380,
    minHeight: 140,
    stop: function(event, ui) {
        // Remove the size/position of the UI element (.heightgraph .leaflet-control) because
        // it should be sized dynamically based on its contents. Giving it a fixed size causes
        // the toggle icon to be in the wrong place when the height graph is minimized.
        ui.element.css({ "width": "", "height": "", "left": "", "top": "" });
    },
    resize: function(event, ui) {

        if(ui.originalPosition.left !== ui.position.left || ui.originalPosition.top !== ui.position.top) {
            // left/upper edge was dragged => only keep size change since we're sticking to the right/bottom
            ui.position.left = 0;
            ui.position.top = 0;
        }

        hg.resize(ui.size);
    },
});
