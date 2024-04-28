// script.js
const API_URL = 'https://ereny.pythonanywhere.com/quakes/';

// Function to fetch earthquake data
async function fetchEarthquakeData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch earthquake data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return null;
  }
}

// Function to initialize the map
function initMap() {
  const map = L.map('map').setView([39, 34], 6); // Set initial view slightly east of Turkey
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  return map;
}

// Function to add earthquake markers to the map
function addEarthquakeMarkers(map, earthquakes) {
  earthquakes.forEach(earthquake => {
    const { latitude, longitude, location, ml } = earthquake;
    
    // Determine marker color based on earthquake magnitude
    let color;
    if (ml < 2) {
      color = 'green';
    } else if (ml >= 2 && ml < 4) {
      color = 'blue';
    } else if (ml >= 4 && ml < 6) {
      color = 'orange';
    } else {
      color = 'red';
    }

    // Create circle marker with appropriate color and size
    const circle = L.circleMarker([parseFloat(latitude), parseFloat(longitude)], {
      radius: 5, // Adjust the radius as needed
      color: color,
      fillColor: color,
      fillOpacity: 0.8
    }).addTo(map);

    circle.bindPopup(`<b>Location:</b> ${location}<br/><b>Coordinates:</b> ${latitude}, ${longitude}<br/><b>Magnitude:</b> ${ml}`);
  });

  // Add legend
  const legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const labels = [];

    // Add labels with color codes and magnitude numbers
    labels.push(
      '<div style="background-color: rgba(0, 128, 0, 0.8); width: 20px; height: 20px; display: inline-block;"></div> 0-2',
      '<div style="background-color: rgba(0, 0, 255, 0.8); width: 20px; height: 20px; display: inline-block;"></div> 2-4',
      '<div style="background-color: rgba(255, 165, 0, 0.8); width: 20px; height: 20px; display: inline-block;"></div> 4-6',
      '<div style="background-color: rgba(255, 0, 0, 0.8); width: 20px; height: 20px; display: inline-block;"></div> 6+'
    );

    div.innerHTML = labels.join('<br>');
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Add background color to legend
    div.style.padding = '10px'; // Add padding for better readability
    div.style.color = 'black'; // Ensure text is visible
    return div;
  };
  legend.addTo(map);
}


// Function to sort earthquakes by date and time
function sortEarthquakesByDateTime(earthquakes) {
  return earthquakes.sort((a, b) => {
    const dateTimeA = new Date(a.date.replace(/\./g, '-') + 'T' + a.time);
    const dateTimeB = new Date(b.date.replace(/\./g, '-') + 'T' + b.time);
    return dateTimeB - dateTimeA; // Sort in descending order (latest first)
  });
}

// Function to display earthquake data
function displayEarthquakes(earthquakes) {
  const quakeList = document.getElementById('quakeList');
  quakeList.innerHTML = ''; // Clear previous data
  
  // Sort earthquakes by date and time
  const sortedEarthquakes = sortEarthquakesByDateTime(earthquakes);
  
  // Display the last five earthquakes
  const lastFiveEarthquakes = sortedEarthquakes.slice(0, 5);
  lastFiveEarthquakes.forEach(earthquake => {
    const { location, date, time, ml } = earthquake;
    const magnitude = ml !== undefined ? ml : 'N/A';
    const quakeItem = document.createElement('div');
    quakeItem.classList.add('quake-card');
    quakeItem.innerHTML = `
      <h3>${location}</h3>
      <p>Date: ${date}</p>
      <p>Time: ${time}</p>
      <p>Magnitude: ${magnitude}</p>
    `;
    quakeList.appendChild(quakeItem);
  });

  // Calculate and display total earthquakes since earliest date and time
  const earliestDateTime = getEarliestDateTime(sortedEarthquakes);
  const totalSinceEarliest = sortedEarthquakes.length;
  document.getElementById('totalSinceEarliest').textContent = totalSinceEarliest;
  document.getElementById('earliestDateTime').textContent = earliestDateTime;
}

  

// Function to get the earliest date and time from the earthquake data
function getEarliestDateTime(earthquakes) {
    if (earthquakes.length === 0) {
      return 'No earthquakes found';
    }
    
    let earliestDateTime = new Date(earthquakes[0].date.replace(/\./g, '-') + 'T' + earthquakes[0].time);
  
    earthquakes.forEach(earthquake => {
      const dateTime = new Date(earthquake.date.replace(/\./g, '-') + 'T' + earthquake.time);
      if (!isNaN(dateTime.getTime()) && dateTime < earliestDateTime) {
        earliestDateTime = dateTime;
      }
    });
  
    if (isNaN(earliestDateTime.getTime())) {
      return 'Invalid Date';
    }
  
    const earliestDate = earliestDateTime.toLocaleDateString();
    const earliestTime = earliestDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
    return `${earliestDate} ${earliestTime}`;
  }
  
  function updateTotalCount(earthquakes) {
    const totalCount = document.getElementById('totalSinceEarliest');
    if (earthquakes) {
      totalCount.textContent = earthquakes.length;
    } else {
      totalCount.textContent = 'Loading...';
    }
  }

  function hideLoadingOverlay() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }
// Function to fetch all earthquake data
async function fetchAllEarthquakeData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch earthquake data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return null;
  }
}

// Function to display all earthquakes chronologically
function displayAllEarthquakes(earthquakes) {
  const allQuakeList = document.getElementById('allQuakeList');
  allQuakeList.innerHTML = ''; // Clear previous data

  // Sort earthquakes chronologically
  const sortedEarthquakes = sortEarthquakesByDateTime(earthquakes);

  // Display all earthquakes
  sortedEarthquakes.forEach(earthquake => {
    const { location, date, time, ml } = earthquake;
    const magnitude = ml !== undefined ? ml : 'N/A';
    const quakeItem = document.createElement('div');
    quakeItem.classList.add('quake-card');
    quakeItem.innerHTML = `
      <h3>${location}</h3>
      <p>Date: ${date}</p>
      <p>Time: ${time}</p>
      <p>Magnitude: ${magnitude}</p>
    `;
    allQuakeList.appendChild(quakeItem);
  });
}

// Function to load all earthquakes on the All Earthquakes page
async function loadAllEarthquakes() {
  const allEarthquakeData = await fetchAllEarthquakeData();
  if (allEarthquakeData) {
    displayAllEarthquakes(allEarthquakeData);
  }
}
window.onload = loadAllEarthquakes;

// Main function to initialize the map and fetch earthquake data
async function main() {
  const map = initMap();
  const earthquakeData = await fetchEarthquakeData();
  if (earthquakeData) {
    addEarthquakeMarkers(map, earthquakeData);
    displayEarthquakes(earthquakeData);
    updateTotalCount(earthquakeData);
    hideLoadingOverlay();
  }
}
// Function to toggle the navbar
function toggleNavbar() {
  const navbarLinks = document.getElementById('navbarLinks');
  navbarLinks.classList.toggle('active');
}

// Add event listener to the toggle button
const navbarToggleBtn = document.getElementById('navbarToggleBtn');
navbarToggleBtn.addEventListener('click', toggleNavbar);

// Function to scroll to the footer when the "Important" link is clicked
function scrollToFooter() {
  const footer = document.getElementById('footer');
  footer.scrollIntoView({ behavior: 'smooth' });
}

// Add event listener to the "Important" link
const importantLink = document.getElementById('importantLink');
importantLink.addEventListener('click', scrollToFooter);

main();
