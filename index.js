/*-- CONSTANTS --*/

// google maps API
const API_KEY ="AIzaSyC0HTI1ZBcWCdA-VxGzRMVvu2vrhn4vgBs";

// Neighborhood Names GIS DataSet
const URL_NEIGHNAMES = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";

//NY Districts geoshapes DataSet
const URL_GEOSHAPES = "http://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson";

//crimes in NY DataSet (API_TOKEN is for making quick queries from socrata)
const URL_CRIMES = "https://data.cityofnewyork.us/resource/9s4h-37hy.json";
const API_TOKEN = "4kcyEmNUO5eMPS726UXOmtBPF";

// Housing in NY DataSet
const URL_HOUSING = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";

/*-- GLOBAL VARIABLES --*/

//Global map
var map;

//Initial coords n' marker for NYU Stern school of business
var nyu_coordinates = {lat:40.729055, lng:-73.996523};
var nyu_marker;
var nyu_latLng;

// global object for saving district info

  // The following format will be used to encode district information:
  //
  // districtObject = {
  //   borough:"string",                 MN: manhattan, BX:bronx, BK: brooklyn, QN: queens, SI:statenIsland
  //   district:"number",                districts enumerated from 1, acording to Housing in NY dataSet
  //   units:"number",                   maximum low income units in the district acording to housing in NY dataSet
  //   safety:"number",                  # of crimes comitted on 12/31/2015 on the district, acording to crimes in NY dataSet
  //   distance:"number",                distance from the center of the district to Purdue school of business
  //   districtShape:"arrOfCoordinates", points for making the perimeter of the district acording to geoShapes dataSet
  //   polygon: "google maps polygon",   polygon or array of polygons
  //   neighborhoods:"arrOfCoordinates"  coordinates of the neighborhoods inside the district
  // };
  //
  // Each habitable district will have one of this object, they will be added to their corresponding
  // borough on the following object:

var districtInfo = {
  manhattan: [],  // 12 districts
  bronx: [],      // 12 districts
  brooklyn: [],   // 18 districts
  queens: [],     // 14 districts
  statenIsland: []//  3 districts
}; // total districts: 59

// Array for saving crimes on 12-31-2015
var crimes = [];

// Array for saving the center of NY neighborhoods
var centroids = [];

// Array for sorting districts
var districtArray = [];

//Array of colors
var color = ["#f44336","#e91e63","#9c27b0","#673ab7","#3f51b5",
"#2196F3","#87CEEB","#00bcd4","#00ffff","#009688"]

//booleans for button control
var housingPainted = false;
var safetyPainted = false;
var distancePainted = false;
var avgPainted = false;

/*-- FUNCTIONS --*/

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
    center: nyu_coordinates,
    draggable:false,
    zoom: 10,
    styles:[
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]


  });

  nyu_marker = new google.maps.Marker({
    map: map,
    position: nyu_coordinates,
    title: 'N.Y.U. stern school of business',
  });

  nyu_latLng = new google.maps.LatLng(Number(nyu_coordinates.lat), Number(nyu_coordinates.lng));

}//end of function

function getDataSets(){

  // Initialization cycles for district objects
  for(var i = 0; i < 12; i++){districtInfo.manhattan[i]={borough:"MN",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};
  for(var i = 0; i < 12; i++){districtInfo.bronx[i]={borough:"BX",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};
  for(var i = 0; i < 18; i++){districtInfo.brooklyn[i]={borough:"BK",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};
  for(var i = 0; i < 14; i++){districtInfo.queens[i]={borough:"QN",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};
  for(var i = 0; i < 3; i++){districtInfo.statenIsland[i]={borough:"SI",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};

  // The following is a call back hell. Is the best I could to request data synchronously
  var dataHousing = $.get(URL_HOUSING,function(){})
  .done(function(){

    dataHousing = dataHousing.responseJSON.data;

    for (var i = 0; i < dataHousing.length; i++) {


      var boro = dataHousing[i][19].substring(0,2);
      var district = dataHousing[i][19].substring((dataHousing[i][19].length-2),(dataHousing[i][19].length));
      var district = Number(district);
      var curUnits = Number(dataHousing[i][33]);

      switch (boro){

        case "MN":

          if(curUnits >= districtInfo.manhattan[district-1].units){
            districtInfo.manhattan[district-1].units = curUnits;
          }

        break;

        case "BX":

          if(curUnits >= districtInfo.bronx[district-1].units){
            districtInfo.bronx[district-1].units = curUnits;
          }

        break;

        case "BK":

          if(curUnits >= districtInfo.brooklyn[district-1].units){
            districtInfo.brooklyn[district-1].units = curUnits;
          }

        break;

        case "QN":

          if(curUnits >= districtInfo.queens[district-1].units){
            districtInfo.queens[district-1].units = curUnits;
          }

        break;

        case "SI":

          if(curUnits >= districtInfo.statenIsland[district-1].units){
            districtInfo.statenIsland[district-1].units = curUnits;
          }

        break;

      }//end of switch

    }//end of for

    //pull geoShapes per district
    var dataGeoShapes = $.get(URL_GEOSHAPES,function(){})
    .done(function(){

      // object with polygons/multipolygons
      var temp =$.parseJSON(dataGeoShapes.responseText);
      var polArray = temp.features;


      for(var i = 0 ; i < polArray.length ; i++){

        var boroCD = polArray[i].properties.BoroCD.toString();
        var boro = boroCD.substring(0,1);
        boro = Number(boro);

        var district = boroCD.substring(1,3);
        district = Number(district);

        var geometry = polArray[i];
        var type = geometry.geometry.type;
        var pol = [];
        //console.log(geometry);
        switch(type){
          case"MultiPolygon":
            var temp = geometry.geometry.coordinates;
            for (subArray of temp) {
              var set = [];
              for (coords of subArray[0]) {
                var latLng = {lat:coords[1],lng:coords[0]};
                set.push(latLng);
              }
              var temp_pol = new google.maps.Polygon({
                paths: set,
                visible: true
              });

              pol.push(temp_pol);
              //console.log(pol);
            }
            //console.log(temp);
          break;

          case "Polygon":
            var temp_array = geometry.geometry.coordinates[0];
            var set = [];
            for (coords of temp_array) {
              var latLng = {lat:coords[1],lng:coords[0]};
              set.push(latLng);
            }

            var temp_pol = new google.maps.Polygon({
              paths: set,
              visible: true
            });

            pol.push(temp_pol);
          break;
        }

        switch(boro){

          case 1: //manhattan

            if(district <= 12){
              districtInfo.manhattan[district-1].districtShape = geometry;
              districtInfo.manhattan[district-1].polygon = pol;
            }

          break;

          case 2: //bronx

            if(district <= 12){
              districtInfo.bronx[district-1].districtShape = geometry;
              districtInfo.bronx[district-1].polygon = pol;
            }

          break;

          case 3: //brooklyn

            if(district <= 18){
              districtInfo.brooklyn[district-1].districtShape = geometry;
              districtInfo.brooklyn[district-1].polygon = pol;
            }

          break;

          case 4: //queens

            if(district <= 14){
              districtInfo.queens[district-1].districtShape = geometry;
              districtInfo.queens[district-1].polygon = pol;
            }

          break;

          case 5: //statenIsland

            if(district <= 3){
              districtInfo.statenIsland[district-1].districtShape = geometry;
              districtInfo.statenIsland[district-1].polygon = pol;
            }

          break;

        }// end of switch

      }// end of for

      $.ajax({
          url: URL_CRIMES+'?cmplnt_fr_dt=2015-12-31T00:00:00.000',
          type: "GET",
          data: {
            "$limit" : 5000,
            "$$app_token" : API_TOKEN
          }
      }).done(function(data) {
        // crimes becomes populated
        crimes = data;

        // sort crimes alphabetically by borough
        crimes.sort(function(a,b){
          if (a.boro_nm < b.boro_nm)
            return -1;
          if (a.boro_nm > b.boro_nm)
            return 1;
          return 0;
        })

        var dataHousing = $.get(URL_NEIGHNAMES, function(){})
        .done(function(){

          for (var i = 0; i < dataHousing.responseJSON.data.length; i++) {

            var n = dataHousing.responseJSON.data[i][9];
            //parse the coordinates
            var numeritos = n.substr(n.indexOf("(")+1,(n.indexOf(")")-n.indexOf("(")-1));
            var lg = numeritos.substr(0,numeritos.indexOf(" "));
            lg = Number(lg);
            var lt = numeritos.substr(numeritos.indexOf(" ")+1,n.length/2);
            lt = Number(lt);
            //var latLng = {lat:lt, lng:lg};
            var latLng = new google.maps.LatLng(Number(lt), Number(lg));
            // get the name of neighborhood and borough
            var name = dataHousing.responseJSON.data[i][10];
            var boro = dataHousing.responseJSON.data[i][16];

            var subArray = [boro,name,latLng];
            //centroids becomes populated
            centroids.push(subArray);

          };//end of for

          centroids.sort(function(a,b){
            if (a[0] < [0])
              return -1;
            if (a[0] > b[0])
              return 1;
            return 0;
          })
          /*SPACE FOR NEXT DATASET*/

          //This function adds the crimes comitted in each district
          addCrimes();
          addDistance();
          sortDistricts();

        })

      })

    })

  });

}

function addCrimes(){
  var crimesBr = crimes.filter(function( obj ) {
    return obj.boro_nm == "BRONX" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesBr){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.bronx){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  var crimesBk = crimes.filter(function( obj ) {
    return obj.boro_nm == "BROOKLYN" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesBk){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.brooklyn){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  var crimesMn = crimes.filter(function( obj ) {
    return obj.boro_nm == "MANHATTAN" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesMn){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.manhattan){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  var crimesQn = crimes.filter(function( obj ) {
    return obj.boro_nm == "QUEENS" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesQn){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.queens){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  var crimesSi = crimes.filter(function( obj ) {
    return obj.boro_nm == "STATEN ISLAND" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesSi){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.statenIsland){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }
}

function addDistance(){
  for(hood of centroids){
    //var coords = new google.maps.LatLng(Number(hood[2].lat), Number(hood[2].lng));

    switch (hood[0]) {

      case "Bronx":
        for (district of districtInfo.bronx) {
          for (polygon of district.polygon) {
            if(google.maps.geometry.poly.containsLocation(hood[2], polygon)){
              district.neighborhoods.push(hood);
              var distance =google.maps.geometry.spherical.computeDistanceBetween(nyu_latLng, hood[2]);
              district.distance += distance;
            }
          }
        }
      break;
      case "Brooklyn":
      for (district of districtInfo.brooklyn) {
        for (polygon of district.polygon) {
          if(google.maps.geometry.poly.containsLocation(hood[2], polygon)){
            district.neighborhoods.push(hood);
            var distance =google.maps.geometry.spherical.computeDistanceBetween(nyu_latLng, hood[2]);
            district.distance += distance;
          }
        }
      }
      break;
      case "Manhattan":
      for (district of districtInfo.manhattan) {
        for (polygon of district.polygon) {
          if(google.maps.geometry.poly.containsLocation(hood[2], polygon)){
            district.neighborhoods.push(hood);
            var distance =google.maps.geometry.spherical.computeDistanceBetween(nyu_latLng, hood[2]);
            district.distance += distance;
          }
        }
      }
      break;
      case "Queens":
      for (district of districtInfo.queens) {
        for (polygon of district.polygon) {
          if(google.maps.geometry.poly.containsLocation(hood[2], polygon)){
            district.neighborhoods.push(hood);
            var distance =google.maps.geometry.spherical.computeDistanceBetween(nyu_latLng, hood[2]);
            district.distance += distance;
          }
        }
      }
      break;
      case "Staten Island":
      for (district of districtInfo.statenIsland) {
        for (polygon of district.polygon) {
          if(google.maps.geometry.poly.containsLocation(hood[2], polygon)){
            district.neighborhoods.push(hood);
            var distance =google.maps.geometry.spherical.computeDistanceBetween(nyu_latLng, hood[2]);
            district.distance += distance;
          }
        }
      }
      break;
    }
  }

  for(var i = 0; i < 12; i++){districtInfo.manhattan[i].distance /= districtInfo.manhattan[i].neighborhoods.length};
  for(var i = 0; i < 12; i++){districtInfo.bronx[i].distance /= districtInfo.bronx[i].neighborhoods.length};
  for(var i = 0; i < 18; i++){districtInfo.brooklyn[i].distance /= districtInfo.brooklyn[i].neighborhoods.length};
  for(var i = 0; i < 14; i++){districtInfo.queens[i].distance /= districtInfo.queens[i].neighborhoods.length};
  for(var i = 0; i < 3; i++){districtInfo.statenIsland[i].distance /= districtInfo.statenIsland[i].neighborhoods.length};

  //console.log(districtInfo);

}//end of function

function sortDistricts(){

  for(var i = 0; i < 12; i++){districtArray.push(districtInfo.manhattan[i])};
  for(var i = 0; i < 12; i++){districtArray.push(districtInfo.bronx[i])};
  for(var i = 0; i < 18; i++){districtArray.push(districtInfo.brooklyn[i])};
  for(var i = 0; i < 14; i++){districtArray.push(districtInfo.queens[i])};
  for(var i = 0; i < 3; i++){districtArray.push(districtInfo.statenIsland[i])};

  //sorting and creating the score for affordability
  districtArray.sort(function compare(a,b){
    return b.units - a.units;
  })

  var maxUnits = districtArray[0].units;
  var minUnits = districtArray[58].units;

  for (var i = 0; i < districtArray.length; i++) {
    var score = Math.trunc(((districtArray[i].units-minUnits)/(maxUnits-minUnits))*100);
    districtArray[i].housingScore = score;
  }

  //sorting and creating the score for safety
  districtArray.sort(function compare(a,b){
    return a.safety - b.safety;
  })

  var minCrimes = districtArray[0].safety;
  var maxCrimes = districtArray[58].safety;

  for (var i = 0; i < districtArray.length; i++) {
    var score = Math.trunc((1-((districtArray[i].safety-minCrimes)/(maxCrimes-minCrimes)))*100);
    districtArray[i].safetyScore = score;
  }

  //sorting and creating the score for distance
  districtArray.sort(function compare(a,b){
    return a.distance - b.distance;
  })

  var minDistance = districtArray[0].distance;
  var maxDistance = districtArray[58].distance;

  for (var i = 0; i < districtArray.length; i++) {
    var score = Math.trunc((1-((districtArray[i].distance-minDistance)/(maxDistance-minDistance)))*100);
    districtArray[i].distanceScore = score;
  }

  //creating teh average score to make the top 3
  for (var i = 0; i < districtArray.length; i++) {
    var d = districtArray[i];
    districtArray[i].averageScore = Math.trunc((d.housingScore + d.safetyScore + d.distanceScore)/3) ;
  }

  districtArray.sort(function compare(a,b){
    return b.averageScore - a.averageScore;
  })

}

function paintHousing(){
  districtArray.sort(function compare(a,b){
    return b.units - a.units;
  })

  var top = districtArray.slice(0,10);

  for (d of districtArray) {
    for(pol of d.polygon){
      pol.setMap(null);
    }
  }

  if(!housingPainted){
    d3.selectAll("svg").remove();
    var svg = d3.select(".bubbleChart").append("svg")
    .attr("width","100%").attr("height","100%");

    var i = 0;
    var y = 20;
    for (district of top) {
      var rect = svg.append("rect")
      .attr("x", 70)
      .attr("y", y)
      .attr("width", 400)
      .attr("height",30)
      .attr("fill",color[i])
      .attr("id",("rectan"+i));
      i+=1;
      y+=50;
    }
    housingPainted = true;
    safetyPainted = false;
    distancePainted = false;
    avgPainted = false;
  }


  d3.selectAll("rect")
  .on("click", function(){

    var id = d3.select(this).attr("id");
    id = Number(id.substring(6,7));
    var polArr = top[id].polygon;

    for (d of top) {
      for(pol of d.polygon){
        pol.setMap(null);
      }
    }

    for (polygon of polArr) {
      polygon.setOptions({
        strokeColor: color[id],
        strokeWeight: 1,
        fillColor: color[id],
        fillOpacity:0.3,

      })
      polygon.setMap(map);
    }
  });
}

function paintCrimes(){
  districtArray.sort(function compare(a,b){
    return a.safety - b.safety;
  })

  var top = districtArray.slice(0,10);

  for (d of districtArray) {
    for(pol of d.polygon){
      pol.setMap(null);
    }
  }

  if(!safetyPainted){
    d3.selectAll("svg").remove();
    var svg = d3.select(".bubbleChart").append("svg")
    .attr("width","100%").attr("height","100%");

    var i = 0;
    var y = 20;
    for (district of top) {
      var rect = svg.append("rect")
      .attr("x", 70)
      .attr("y", y)
      .attr("width", 400)
      .attr("height",30)
      .attr("fill",color[i])
      .attr("id",("rectan"+i));
      i+=1;
      y+=50;
    }
    safetyPainted = true;
    distancePainted = false;
    housingPainted = false;
    avgPainted = false;
  }


  d3.selectAll("rect")
  .on("click", function(){

    var id = d3.select(this).attr("id");
    id = Number(id.substring(6,7));
    var polArr = top[id].polygon;

    for (d of top) {
      for(pol of d.polygon){
        pol.setMap(null);
      }
    }

    for (polygon of polArr) {
      polygon.setOptions({
        strokeColor: color[id],
        strokeWeight: 1,
        fillColor: color[id],
        fillOpacity:0.3,

      })
      polygon.setMap(map);
    }
  });

}

function paintDistance(){

  districtArray.sort(function compare(a,b){
    return a.distance - b.distance;
  })

  var top = districtArray.slice(0,10);

  for (d of districtArray) {
    for(pol of d.polygon){
      pol.setMap(null);
    }
  }

  if(!distancePainted){
    d3.selectAll("svg").remove();
    var svg = d3.select(".bubbleChart").append("svg")
    .attr("width","100%").attr("height","100%");

    var i = 0;
    var y = 20;
    for (district of top) {
      var rect = svg.append("rect")
      .attr("x", 70)
      .attr("y", y)
      .attr("width", 400)
      .attr("height",30)
      .attr("fill",color[i])
      .attr("id",("rectan"+i));
      var text = rect.append("text");

      i+=1;
      y+=50;
    }
    distancePainted = true;
    safetyPainted = false;
    housingPainted = false;
    avgPainted = false;
  }


  d3.selectAll("rect")
  .on("click", function(){

    var id = d3.select(this).attr("id");
    id = Number(id.substring(6,7));
    var polArr = top[id].polygon;

    for (d of top) {
      for(pol of d.polygon){
        pol.setMap(null);
      }
    }

    for (polygon of polArr) {
      polygon.setOptions({
        strokeColor: color[id],
        strokeWeight: 1,
        fillColor: color[id],
        fillOpacity:0.3,

      })
      polygon.setMap(map);
    }
  });

}

function paintTop3(){
  districtArray.sort(function compare(a,b){
    return b.averageScore - a.averageScore;
  })

  var top = districtArray.slice(0,3);
  for (d of districtArray) {
    for(pol of d.polygon){
      pol.setMap(null);
    }
  }

  if(!avgPainted){
    d3.selectAll("svg").remove();
    var svg = d3.select(".bubbleChart").append("svg")
    .attr("width","100%").attr("height","100%");

    var i = 0;
    var y = 20;
    for (district of top) {
      var rect = svg.append("rect")
      .attr("x", 70)
      .attr("y", y)
      .attr("width", 400)
      .attr("height",30)
      .attr("fill",color[i])
      .attr("id",("rectan"+i));
      i+=1;
      y+=50;
    }
    avgPainted = true;
    housingPainted =false;
    safetyPainted = false;
    distancePainted = false;
  }


  d3.selectAll("rect")
  .on("click", function(){

    var id = d3.select(this).attr("id");
    id = Number(id.substring(6,7));
    var polArr = top[id].polygon;

    for (d of top) {
      for(pol of d.polygon){
        pol.setMap(null);
      }
    }

    for (polygon of polArr) {
      polygon.setOptions({
        strokeColor: color[id],
        strokeWeight: 1,
        fillColor: color[id],
        fillOpacity:0.3,

      })
      polygon.setMap(map);
    }
  });
}

$(document).ready(function(){
  getDataSets();
  $("#buttonHousing").on("click",paintHousing);
  $("#buttonSafety").on("click",paintCrimes);
  $("#buttonDistance").on("click",paintDistance);
  $("#buttonTop3").on("click",paintTop3);
})
