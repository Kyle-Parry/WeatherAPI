import { ObjectId } from "mongodb";
import { db } from "../database/database.js";

export function Reading(
  _id,
  deviceName,
  time,
  latitude,
  longitude,
  humidity,
  precipitation,
  temperature,
  maxWindSpeed,
  solarRadiation,
  vaporPressure,
  windDirection,
  atmosphericPressure
) {
  return {
    _id,
    deviceName,
    time,
    latitude,
    longitude,
    humidity,
    precipitation,
    temperature,
    maxWindSpeed,
    solarRadiation,
    vaporPressure,
    windDirection,
    atmosphericPressure,
  };
}

export async function create(readings) {
  // Insert the sighting document and implicitly add the new _id to sighting
  db.collection("readings").insertMany(readings);
}

export async function update(reading) {
  // update the precipitation of a reading
  return db.collection("readings").updateOne(
    { _id: new ObjectId(reading._id) },
    {
      $set: {
        precipitation: reading.precipitation,
      },
    }
  );
}

export async function getReadingByDateTime(deviceName, time) {
  // attempt to find the first matching user by email
  let reading = await db
    .collection("readings")
    .findOne({ deviceName: deviceName, time: time });

  // check if a user was found and handle the result
  if (reading) {
    return reading;
  } else {
    return Promise.reject("No reading found from " + deviceName + "at " + time);
  }
}

export async function getReadingsByDateRange(startTime, endTime) {
  // Attempt to find readings within the specified date range
  const readings = await db
    .collection("readings")
    .find({
      time: {
        $gte: startTime,
        $lte: endTime,
      },
    })
    .toArray();

  if (readings.length > 0) {
    return readings;
  } else {
    return Promise.reject("No readings found within the specified date range.");
  }
}
