let myMap = L.map("map", {
  center: [40, -101],
  zoom: 4
});

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// USGS API URL
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
  return (magnitude/2) * 30000;
}

// Function to determine marker color based on depth
function depthColor(depth) {
  return depth > 90 ? '#242726' :
         depth > 70 ? '#886c5f' :
         depth > 50 ? '#d04b18' :
         depth > 30 ? '#dfb24a' :
         depth > 10 ? '#1d2e68' :
                      '#d4c5aa';
}

// Fetch data using D3
d3.json(url).then(function(response) {
  let features = response.features;

  // Iterate through the features and add markers to the map
  for (let i = 0; i < features.length; i++) {
    let coordinates = features[i].geometry.coordinates;
    let magnitude = features[i].properties.mag;
    let depth = coordinates[2];
    let place = features[i].properties.title;
    let time = new Date(features[i].properties.time).toLocaleString();

    // Create a circle marker
    let marker = L.circle([coordinates[1], coordinates[0]], {
      fillOpacity: .75,
      fillColor: depthColor(depth),
      color: "black",
      weight: 0.5,
      radius: markerSize(magnitude),
    }).addTo(myMap);

    // Add a popup with additional information
    marker.bindPopup(`<h3>Place: ${place}</h3><hr><p>Magnitude: ${magnitude}</p><p>Depth: ${depth} km</p><p>Time: ${time}</p>`, {
      className: 'custom-popup' // Add a custom class for the popup
    });

  }


  // Add a legend to provide context for the data
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depthLevels = [-10, 10, 30, 50, 70, 90];
    let labels = [];

    // Create a label for each depth level
    for (let i = 0; i < depthLevels.length; i++) {
      labels.push(
        '<i style="background:' + depthColor(depthLevels[i] + 1) + '"></i> ' +
        depthLevels[i] + (depthLevels[i + 1] ? '&ndash;' + depthLevels[i + 1] + ' km' : '+ km'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(myMap);

}).catch(function (error) {
  // Handle errors while fetching data
  console.error("Error fetching data:", error);
});
