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

hg.addData(geojson)

L.geoJson(geojson).addTo(map)

map.addLayer(openstreetmap).fitBounds(bounds)
