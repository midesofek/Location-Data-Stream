const axios = require("axios");
const express = require("express");
const { StreamrClient } = require("streamr-client");
const { NO_OF_USERS, STREAM_ID, TIME_INTERVAL, API_URL } = require("./config");
require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
  res.send("Publishing streams...");
});

// Initialize the Streamr client
const streamr = new StreamrClient({
  auth: {
    privateKey: process.env.PRIVATE_KEY,
  },
});

const streamId = STREAM_ID;

/**
 * @description fetches data from the random user api
 * @returns {array} an array of "latitude and longitude"
 * @example { message: [ '46.5509', '-32.6912'] }
 */
const fetchSampleData = async () => {
  try {
    // gets the data using axios
    const res = await axios.get(`${API_URL}?results=${NO_OF_USERS}`);
    const results = await res.data.results;
    console.log(results.length);

    // loops over the data gotten from the api and
    // maps them into a new array
    const user = results.map((user) => {
      // const firstname = user.name.first;
      const userLatitude = user.location.coordinates.latitude;
      const userLongitude = user.location.coordinates.longitude;
      return [userLatitude, userLongitude];
    });
    return user;
  } catch (err) {
    console.log(err.message);
  }
};

////////
/**
 * @description - calls the fetchSampleData function then publishes each data
 * to the Streamr Network. This function is called at a "set" interval.
 */
const publish = async () => {
  try {
    console.log("Publishing............. ");

    const loadTestData = await fetchSampleData();

    loadTestData.forEach(async (testCoords) => {
      const data = {
        message: testCoords,
      };

      console.log(data);

      await streamr.publish(streamId, data, {
        timestamp: new Date(),
      });
    });

    console.log("Publish successful");
  } catch (err) {
    console.log(err.message);
  }
};
setInterval(publish, TIME_INTERVAL);

/** @description a sample function to subscribe to data published to this stream */
// streamr.subscribe(streamId, (data, metadata) => {
//   const timeReceived = new Date(metadata.timestamp).toISOString();

//   console.log("Time: ", timeReceived);
//   console.log("Data: ", data.message);
// });

module.exports = app;
