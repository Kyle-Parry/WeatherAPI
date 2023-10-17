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

export async function getMaxPrecipitation(deviceName) {
  try {
    const currentDate = new Date();
    const fiveMonthsAgo = new Date(currentDate);
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    console.log(fiveMonthsAgo);
    const result = await db
      .collection("readings")
      .find({
        deviceName: deviceName,
        time: { $gte: "2023-05-17T03:49:46.000Z" },
      })
      .sort({ precipitation: -1 })
      .limit(1)
      .project({
        deviceName: 1,
        time: 1,
        precipitation: 1,
        _id: 0,
      })
      .toArray();

    return result[0];
  } catch (error) {
    throw error;
  }
}
