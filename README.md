# mappersQuest
This repository contains the backend and frontend for a demonstration of working with geoJSON

The working app can be found [here] (https://geojsontesting.herokuapp.com/)

Functionality

1. Displaying polygons
    
    Polygons saved in the database are shown when the app is first loaded. Polygons which are result of set operations are displayed in blue.  

2. Get random polygons

    Pressing the **Get Random polygon** generates a random polygon in the current bounds on the map. This is done to more easily provide polygons for testing instead of having to manually enter them

3. Get GeoJSON

    GeoJSON can also be retrieved from a url by entering it in the input box and pressing **Get!**. Two sample ones are https://geojson-testing.s3-us-west-1.amazonaws.com/sample2.json and
    https://geojson-testing.s3-us-west-1.amazonaws.com/sample3.json

4. Union/Intersect

    Once a polygon has been loaded, clicking on it reveals a popup. Clicking on Add to Union or Add to Intersect, selects that polygon for the operation. Select as many polygons as needed and then press **Union** or **Intersect** to perform that operation. The resulting polygon is displaced in blue on the map. 

5. Saving polygons

    Any polygon can be saved from the popup which is revealed upon clicking it. Once a polygon is saved, it will be displayed every time the application is loaded. 

6. Remove polygon

    Pressing Remove, clears the polygon from the map. If a polygon has already been saved, then Remove will only hide it for the current session, it will be redisplayed if the application is loaded again


System Design

The frontend is written using html and jquery. The backend is an Express app. This was done to quickly create a basic backend that could serve up the API and connect to the database. 
The database is a mongoDb instance running in a MongoDB cluster. The choice to store the geoJSON object was either a PostGres database since that has support for geographical data through postGIS or mongoDB which also allows for indexing on geoJSON. Storing the geoJSON directly was going to be easier for this application, which is why it was chosen. 

The main external package used is Turf which makes it extremely simple to do union and intersect operations than having to write them myself, especially as with geospatial data you have to account for the curvature. During development, the cdn serving the package actually went down, so I used browserify to create a local copy and used that instead. This also reduces load time for the page since this package can now be locally cached and we do not have to retrieve it everytime. 

 Other packages used are geojson-validation to validate geoJSONs and geojson-random to reliably generate random polygons which made testing a lot easier. 

The biggest challenges were wrangling with the geoJSON to understand their structure as well as defining the scope of the application. Initially, there was no support for MultiPolygons created due to the set operations but this was added since MultiPolygons would definitely be created. 



