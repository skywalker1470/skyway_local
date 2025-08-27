const fetch = require('node-fetch');

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const toRad = v => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function fetchOfficeLocations() {
  const response = await fetch('https://script.google.com/macros/s/AKfycbx0XhDJLbzrTNJyUZGkPnqEbjO2v9ZVohdFhqI_JwIY9pukCJ0NswTAGmnFhHKB_MW-/exec');
  const data = await response.json();
  return data.offices;
}

async function isWithinRadius(employeeLat, employeeLng, radiusMeters = 250) {
  const offices = await fetchOfficeLocations();
  for (const office of offices) {
    const dist = getDistanceFromLatLonInMeters(employeeLat, employeeLng, office.lat, office.lng);
    if (dist <= radiusMeters) {
      return { inside: true, office };
    }
  }
  return { inside: false };
}

module.exports = {
  getDistanceFromLatLonInMeters,
  fetchOfficeLocations,
  isWithinRadius
};
