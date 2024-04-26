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
  const map = L.map('map').setView([0, 0], 2); // Default center and zoom level
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  return map;
}

// Function to add earthquake markers to the map
function addEarthquakeMarkers(map, earthquakes) {
  earthquakes.forEach(earthquake => {
    const { latitude, longitude, location } = earthquake;
    L.marker([parseFloat(latitude), parseFloat(longitude)])
      .addTo(map)
      .bindPopup(`<b>Location:</b> ${location}<br/><b>Coordinates:</b> ${latitude}, ${longitude}`)
      .openPopup();
  });
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

// Call the main function to start the process
main();
