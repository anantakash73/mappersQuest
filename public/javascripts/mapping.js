// Declare global variables which will be used by the functions to handle map state
var union_polygons = []
var intersect_polygons = []
var holding = [0]
var layers = [0]


var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
var operationStyle = {
    "fillCcolor": "#4C4CAD",
    "weight": 7,
    "fillOpacity": 0.85

}
var mymap;


// Helper functions for polygon functionality
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

// Main function that does the union/intersect
// It works by first converting the selected polygons into turf objects and then doing the required operation
// If there is a result, it is added to the map
function doOperation(operationType) {
    let operation
    let operation_result
    let operation_polygons
    if (operationType === "union") {
        operation = turf.union
        operation_polygons = union_polygons
        union_polygons = []
    } else if (operationType === "intersect") {
        operation = turf.intersect
        operation_polygons = intersect_polygons
        intersect_polygons = []
    } else {
        console.log("invalid operation")
    }
    operation_polygons.forEach((current_feature) => {
        if (current_feature.geometry.type === 'Polygon') {
            if (operation_result === undefined) operation_result = turf.helpers.polygon(current_feature.geometry.coordinates)
            else operation_result = operation(operation_result, turf.helpers.polygon(current_feature.geometry.coordinates))
        } else if (current_feature.geometry.type === 'MultiPolygon') {
            if (operation_result === undefined) operation_result = turf.helpers.multiPolygon(current_feature.geometry.coordinates)
            else operation_result = operation(operation_result, turf.helpers.multiPolygon(current_feature.geometry.coordinates))
        }

    })

    if (operation_result !== null) {
        operation_result.properties['setOperation'] = true

        L.geoJSON(operation_result, {
            style: operationStyle,
            maxZoom: 18,
            onEachFeature: onEachFeature

        }).addTo(mymap);
    } else { // there is no union/intersect between the selected polygons
        alert("This operation returns no result")
    }




}

function doUnion() {

    doOperation("union")
}

function doIntersect() {
    doOperation("intersect")
}

// This event handler adds the polygon to a list that is used to keep track of the current polygon
function whenClicked(e) {
    //union_polygons.push(e.target.feature)
    holding[0] = e.target.feature
    layers[0] = e.target
    console.log("Added to holding")
}

// This function handles the display of all objects retrived from the database
function polygonSuccess(geojson) {
    let features = geojson.polygons
    features.forEach((feature) => {
        L.geoJSON(feature, {
            style: feature.properties.setOperation ? operationStyle : myStyle,
            maxZoom: 18,
            onEachFeature: onEachFeature
        }).addTo(mymap)

    })
}

// This function creates the popup for each polygon
function onEachFeature(feature, layer) {
    layer.on({
        click: whenClicked
    })

    let popupContent = "<div> <button onclick='addToUnion()'>Add to Union</button> <button onclick='addToIntersect()'>Add to Intersect</button> <button onclick='savePolygon()'>Save</button> <button onclick='removePolygon()'>Remove</button></div>"
    layer.bindPopup(popupContent)
}

// The following function interface directly with the API

// Save polygon to the db
function savePolygon() {
    $.post({
        url: "/api/savePolygon",
        data: JSON.stringify(holding[0]),
        contentType: 'application/json',
        success: (err, data) => {
            if (!err) console.log(data)
        }
    })
}

// Get random polygon
function getRandom() {
    $.post({
        url: "/api/getRandomPolygon",
        data: JSON.stringify(mymap.getBounds()),
        contentType: 'application/json',
        success: polygonSuccess

    })
}

// Gets saved polygons from db
async function showPolygons() {
    await $.get({
        url: '/api/showPolygons',
        success: polygonSuccess

    })
}

// Gets featureCollection from the url specified
function getJSON(url) {
    $.get({
        url: "/api/getJSON",
        data: { url: url },
        success: (data) => {
            let geoJsonFeatures = JSON.parse(data)

            polygonSuccess({ "polygons": geoJsonFeatures.features })

        }

    }).fail((err) => {
        alert("Invalid address for geojson")
    })
}

// document.ready block creates the initial map
$(document).ready(function() {
    console.log("ready!");

    mymap = L.map('mapid').setView([51.505, -0.09], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoiYW5hbnRha2FzaDczIiwiYSI6ImNrNGZ2cmp0ZTBzeHcza253MTl3MmJzYnoifQ.Q7IgAAde4q72TFra8SG4CA'
    }).addTo(mymap);

    // Loads sample set
    showPolygons()

});