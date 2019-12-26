var union_polygons = []
var intersect_polygons = []
var holding = [0]
var layers = [0]
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
var unionStyle = {
    "fillCcolor": "#4C4CAD",
    "weight": 7,
    "fillOpacity": 0.85

}
var mymap;

function savePolygon() {
    holding[0]['properties']['setOperation'] = true
    console.log(holding[0])
    $.post({
        url: "/api/savePolygon",
        data: JSON.stringify(holding[0]),
        contentType: 'application/json',
        success: (err, data) => {
            if (!err) console.log(data)
        }
    })
}

function removePolygon() {
    mymap.removeLayer(layers[0])
}

function addToUnion(feature) {
    union_polygons.push(holding[0])
    holding[0] = 0

}

function addToIntersect(feature) {
    intersect_polygons.push(holding[0])
    holding[0] = 0
}

function doUnion() {
    let union_poly;
    union_polygons.forEach((current_feature) => {
            if (union_poly === undefined) union_poly = turf.helpers.polygon(current_feature.geometry.coordinates)
            else union_poly = turf.union(union_poly, turf.helpers.polygon(current_feature.geometry.coordinates))
        })
        // if (union_poly === "") union_poly = turf.helpers.polygon(currentGeometry.coordinates)
        //     else union_poly = turf.union(union_poly, turf.helpers.polygon(currentGeometry.coordinates))
        //     console.log(union_poly)
    L.geoJSON(union_poly, {
        style: unionStyle,
        maxZoom: 18,
        onEachFeature: setOperation

    }).addTo(mymap);
    union_polygons = []

}

function whenClicked(e) {
    //union_polygons.push(e.target.feature)
    holding[0] = e.target.feature
    layers[0] = e.target
    console.log("Added to union list")
}

function doIntersect() {
    let intersect_poly;
    console.log(intersect_polygons)
    intersect_polygons.forEach((current_feature) => {

            if (current_feature.geometry.type === 'Polygon') {
                if (intersect_poly === undefined) intersect_poly = turf.helpers.polygon(current_feature.geometry.coordinates)
                else intersect_poly = turf.intersect(intersect_poly, turf.helpers.polygon(current_feature.geometry.coordinates))

            } else if (current_feature.geometry.type === 'MultiPolygon') {
                if (intersect_poly === undefined) intersect_poly = turf.helpers.multiPolygon(current_feature.geometry.coordinates)
                else intersect_poly = turf.intersect(intersect_poly, turf.helpers.multiPolygon(current_feature.geometry.coordinates))

            }
        })
        // if (union_poly === "") union_poly = turf.helpers.polygon(currentGeometry.coordinates)
        //     else union_poly = turf.union(union_poly, turf.helpers.polygon(currentGeometry.coordinates))

    L.geoJSON(intersect_poly, {
        style: unionStyle,
        maxZoom: 18,
        onEachFeature: setOperation
    }).addTo(mymap);
    intersect_polygons = []
}

function setOperation(feature, layer) {
    layer.on({
        click: whenClicked
    })
    let popupContent = "<div> <button onclick='savePolygon()'>Save</button> <button onclick='removePolygon()'>Remove</button> </div>"
    layer.bindPopup(popupContent)
}
async function showPolygons() {
    await $.get({
        url: '/api/showPolygons',
        success: polygonSuccess

    })
}

function polygonSuccess(geojson) {
    let features = geojson.polygons
    features.forEach((feature) => {
        console.log(feature)
        L.geoJSON(feature, {
                style: feature.properties.setOperation ? unionStyle : myStyle,
                maxZoom: 18,
                onEachFeature: onEachFeature
            }).addTo(mymap)
            // turf_polygon = new turf.helpers.polygon(feature)
            // console.log(turf_polygon)
    })
}

function onEachFeature(feature, layer) {
    layer.on({
        click: whenClicked
    })

    let popupContent = "<div> <button onclick='addToUnion()'>Union</button> <button onclick='addToIntersect()'>Intersect</button> <button onclick='savePolygon()'>Save</button> <button onclick='removePolygon()'>Remove</button></div>"
    layer.bindPopup(popupContent)
}

function getRandom() {

    $.post({
        url: "/api/getRandomPolygon",
        data: JSON.stringify(mymap.getBounds()),
        contentType: 'application/json',
        success: polygonSuccess

    })
}

// A $( document ).ready() block.
function getJSON(url) {
    $.get({
        url: "/api/getJSON",
        data: { url: url },
        success: (data) => {
            let geoJsonFeatures = JSON.parse(data)

            polygonSuccess({ "polygons": geoJsonFeatures.features })
                // if (data['type'] === "FeatureCollection")
                //     polygonSuccess({ "polygons": data.features })
                // else console.log("not a valid featureCollection")
        }

    }).fail((err) => {
        alert("Invalid address for geojson")
    })
}
$(document).ready(function() {
    console.log("ready!");

    mymap = L.map('mapid').setView([51.505, -0.09], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoiYW5hbnRha2FzaDczIiwiYSI6ImNrNGZ2cmp0ZTBzeHcza253MTl3MmJzYnoifQ.Q7IgAAde4q72TFra8SG4CA'
    }).addTo(mymap);


    //var union_poly = turf.union(turf.helpers.polygon(geoJsonFeature.features[0].coordinates), turf.helpers.polygon(geoJsonFeature.features[1].coordinates))
    var union_poly = ""
        // geoJsonFeature.features.forEach((feature) => {
        //     console.log(turf.getGeom(feature))
        //         // if (union_poly === "") union_poly = turf.helpers.polygon(feature.geometry.coordinates)
        //         // else union_poly = turf.union(union_poly, turf.helpers.polygon(feature.geometry.coordinates))
        //         // console.log(union_poly)

    //     //     // union_poly = (union_poly === "" ? turf.getGeom(feature) : turf.union(union_poly, turf.getGeom(feature)))

    // })

    var unionFunction = (geoJsonFeature) => {
        turf.geomEach(geoJsonFeature, (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) => {
            console.log(currentGeometry.coordinates)
            if (union_poly === "") union_poly = turf.helpers.polygon(currentGeometry.coordinates)
            else union_poly = turf.union(union_poly, turf.helpers.polygon(currentGeometry.coordinates))
            console.log(union_poly)
                // L.geoJSON(featureBBox, {
                //     style: myStyle,
                //     maxZoom: 18,
                // }).addTo(mymap);
        })
        L.geoJSON(union_poly, {
            style: myStyle,
            maxZoom: 18
        }).addTo(mymap)
    }

    var intersectFunction = (polygon_one, polygon_two) => {
        let intersect_poly = turf.intersect(polygon_one.coordinates, polygon_two.coordinates)

    }







    // L.geoJSON(geojson, {
    //     style: myStyle,
    //     maxZoom: 18
    // }).addTo(mymap)


    showPolygons()





    // var features = turf.featureCollection(geoJsonFeature.features)


});