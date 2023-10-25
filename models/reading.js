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
  return db.collection("readings").insertMany(readings);
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

export async function getWeatherDataWithinHour(deviceName, startHour, endHour) {
  const weatherData = await db
    .collection("readings")
    .find({
      deviceName: deviceName,
      time: {
        $gte: startHour,
        $lte: endHour,
      },
    })
    .project({
      deviceName: 1,
      time: 1,
      temperature: 1,
      atmosphericPressure: 1,
      solarRadiation: 1,
      precipitation: 1,
      _id: 0,
    })
    .toArray();

  return weatherData;
}

export async function getMaxTemperatures(startTime, endTime) {
  // Attempt to find maximum temperatures for each sensor within the specified date range
  const readings = await db
    .collection("readings")
    .find({
      time: { $gte: startTime, $lte: endTime },
    })
    .toArray();

  if (readings.length > 0) {
    const maxTemperatures = readings.reduce((acc, reading) => {
      if (
        !acc[reading.deviceName] ||
        acc[reading.deviceName].temp < reading.temperature
      ) {
        acc[reading.deviceName] = {
          deviceName: reading.deviceName,
          time: reading.time,
          temp: reading.temperature,
        };
      }
      return acc;
    }, {});
    console.log(maxTemperatures);

    const result = Object.values(maxTemperatures);

    return result;
  } else {
    return Promise.reject(
      "No maximum temperatures found within the specified date range."
    );
  }
}

export async function getMaxPrecipitation(deviceName) {
  try {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    console.log(fiveMonthsAgo);
    console.log(deviceName);
    const result = await db
      .collection("readings")
      .find({
        deviceName: deviceName,
        time: { $gte: fiveMonthsAgo.toISOString() },
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
