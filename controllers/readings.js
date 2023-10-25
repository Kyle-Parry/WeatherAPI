import { Router } from "express";
import auth from "../middleware/auth.js";
import * as Readings from "../models/reading.js";
import cors from "cors";

const readingController = Router();

readingController.get(
  "/readings/precipitation/:deviceName",
  auth(["admin", "student"]),
  async (req, res) => {
    /* 
      #swagger.summary = 'Get the maximum precipitation reading for a specific sensor in the last 5 months.'
      #swagger.parameters['deviceName'] = {
        in: 'path',
        description: 'The name of the device to filter readings.',
        type: 'string'
      }
      #swagger.responses[200] = {
        description: 'Maximum Precipitation Reading',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                deviceName: {
                  type: 'string'
                },
                time: {
                  type: 'string',
                  format: 'date-time'
                },
                precipitation: {
                  type: 'number',
                  format: 'double'
                }
              }
            }
          }
        }
      }
      #swagger.responses[404] = {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'number'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
      #swagger.responses[500] = {
        description: 'Database error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'number'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    */

    const { deviceName } = req.params;

    try {
      const result = await Readings.getMaxPrecipitation(deviceName);

      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          status: 404,
          message:
            "Maximum precipitation reading not found for the specified sensor in the last 5 months.",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Database error: " + error,
      });
    }
  }
);

readingController.get(
  "/readings/:deviceName/:time",
  auth(["admin", "student"]),
  (req, res) => {
    /* 
        #swagger.summary = 'Find weather data recorded by a specific station within an hour of a given date and time.'
#swagger.parameters['deviceName'] = {
    in: 'path',
    description: 'The name of the station to filter weather data.',
    type: 'string'
}
#swagger.parameters['time'] = {
    in: 'path',
    description: 'The date and time in the format YYYY-MM-DDTHH:mm:ssZ to filter weather data.',
    type: 'string'
}
#swagger.responses[200] = {
    description: 'Found Weather Data',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    status: {
                        type: 'number'
                    },
                    message: {
                        type: 'string'
                    },
                    weatherData: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                deviceName: {
                                    type: 'string'
                                },
                                time: {
                                    type: 'string',
                                    format: 'date-time'
                                },
                                temperature: {
                                    type: 'number',
                                    format: 'double'
                                },
                                atmosphericPressure: {
                                    type: 'number',
                                    format: 'double'
                                },
                                solarRadiation: {
                                    type: 'number',
                                    format: 'double'
                                },
                                precipitation: {
                                    type: 'number',
                                    format: 'double'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
        #swagger.responses[400] = {
            description: 'Invalid Request',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'number'
                            },
                            message: {
                                type: 'string'
                            },
                        }
                    },
                }
            }
        } 
        #swagger.responses[404] = {
            description: 'Not Found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'number'
                            },
                            message: {
                                type: 'string'
                            },
                        }
                    },
                }
            }
        }  
         #swagger.responses[500] = {
             description: 'Database error',
             content: {
                 'application/json': {
                     schema: {
                         type: 'object',
                         properties: {
                             status: {
                                 type: 'number'
                             },
                             message: {
                                 type: 'string'
                             },
                         }
                     },
                 }
             }
         } 
      */
    const { deviceName, time } = req.params;
    const parsedTime = new Date(decodeURIComponent(time));

    if (!isNaN(parsedTime.getTime())) {
      const startHour = new Date(parsedTime);
      startHour.setMinutes(0);
      startHour.setSeconds(0);
      const endHour = new Date(parsedTime);
      endHour.setMinutes(59);
      endHour.setSeconds(59);

      Readings.getWeatherDataWithinHour(deviceName, startHour, endHour)
        .then((weatherData) => {
          if (weatherData && weatherData.length > 0) {
            res.status(200).json({
              status: 200,
              message: "Weather Data Found",
              weatherData: weatherData,
            });
          } else {
            res.status(404).json({
              status: 404,
              message: "Weather Data Not Found",
            });
          }
        })
        .catch((error) => {
          res.status(500).json({
            status: 500,
            message: "Failed to get weather data" + error,
          });
        });
    } else {
      res.status(400).json({
        status: 400,
        message: "Invalid datetime string",
      });
    }
  }
);

readingController.get(
  "/readings/maxTemp",
  auth(["admin", "student"]),
  (req, res) => {
    /* 
        #swagger.summary = 'Get maximum temperature readings by device name and date range.'
        #swagger.parameters['startTime'] = {
          in: 'query',
          description: 'Start date and time in the format YYYY-MM-DDTHH:mm:ssZ.',
          type: 'string'
        }
        #swagger.parameters['endTime'] = {
          in: 'query',
          description: 'End date and time in the format YYYY-MM-DDTHH:mm:ssZ.',
          type: 'string'
        }
        #swagger.responses[200] = {
          description: 'Maximum Temperature Readings Found',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    deviceName: {
                      type: 'string'
                    },
                    time: {
                      type: 'string',
                      format: 'date-time'
                    },
                    temp: {
                      type: 'number',
                      format: 'double'
                    }
                  }
                }
              }
            }
          }
        }
        #swagger.responses[400] = {
          description: 'Invalid Request',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'number'
                  },
                  message: {
                    type: 'string'
                  },
                }
              },
            }
          }
        } 
        #swagger.responses[404] = {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'number'
                  },
                  message: {
                    type: 'string'
                  },
                }
              },
            }
          }
        }  
        #swagger.responses[500] = {
          description: 'Database error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'number'
                  },
                  message: {
                    type: 'string'
                  },
                }
              },
            }
          }
        } 
    */

    const startTime = new Date(req.query.startTime);
    const endTime = new Date(req.query.endTime);

    if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
      Readings.getMaxTemperatures(startTime, endTime)
        .then((maxTemperatures) => {
          if (maxTemperatures.length > 0) {
            res.status(200).json(maxTemperatures);
          } else {
            res.status(404).json({
              status: 404,
              message:
                "No maximum temperatures found within the specified date range.",
            });
          }
        })
        .catch((error) => {
          res.status(500).json({
            status: 500,
            message: "Failed to retrieve maximum temperatures",
          });
        });
    } else {
      res.status(400).json({
        status: 400,
        message: "Invalid datetime string in startTime or endTime",
      });
    }
  }
);

readingController.post(
  "/reading/create",
  auth(["admin", "station"]),
  (req, res) => {
    /* 
    #swagger.summary = 'Create multiple readings'
    #swagger.requestBody = {
        description: 'Create new readings',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            deviceName: {
                                type: 'string'
                            },
                            time: {
                                type: 'string',
                                format: 'date-time'
                            },
                            latitude: {
                                type: 'number',
                                format: 'double'
                            },
                            longitude: {
                                type: 'number',
                                format: 'double'
                            },
                            humidity: {
                                type: 'number',
                                format: 'double'
                            },
                            precipitation: {
                                type: 'number',
                                format: 'double'
                            },
                            temperature: {
                                type: 'number',
                                format: 'double'
                            },
                            maxWindSpeed: {
                                type: 'number',
                                format: 'double'
                            },
                            solarRadiation: {
                                type: 'number',
                                format: 'double'
                            },
                            vaporPressure: {
                                type: 'number',
                                format: 'double'
                            },
                            windDirection: {
                                type: 'number',
                                format: 'double'
                            },
                            atmosphericPressure: {
                                type: 'number',
                                format: 'double'
                            },
                        }
                    }
                },
            }
        }
    } 
           #swagger.responses[200] = {
               description: 'Readings Created',
               content: {
                   'application/json': {
                       schema: {
                           type: 'object',
                           properties: {
                               status: {
                                   type: 'number'
                               },
                               message: {
                                   type: 'string'
                               },
                               readings: {
                                   type: 'array',
                                   items: {
                                       type: 'object',
                                       properties: {
                                           _id: {
                                               type: 'string'
                                           },
                                           deviceName: {
                                                type: 'string'
                                            },
                                           time: {
                                                type: 'string',
                                                format: "date-time"
                                           },
                                           latitude: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                           longitude: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                           humidity: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                           precipitation: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                            temperature: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                           maxWindSpeed: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                           solarRadiation: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                           vaporPressure: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                           windDirection: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                           atmosphericPressure: {
                                                type: 'number',
                                                format: 'double'
                                           },
                                       }
                                   }
                               }
                           }
                       },
                   }
               }
           } 
           #swagger.responses[400] = {
               description: 'Invalid Request',
               content: {
                   'application/json': {
                       schema: {
                           type: 'object',
                           properties: {
                               status: {
                                   type: 'number'
                               },
                               message: {
                                   type: 'string'
                               },
                           }
                       },
                   }
               }
           } 
           #swagger.responses[500] = {
               description: 'Database error',
               content: {
                   'application/json': {
                       schema: {
                           type: 'object',
                           properties: {
                               status: {
                                   type: 'number'
                               },
                               message: {
                                   type: 'string'
                               },
                           }
                       },
                   }
               }
           } 
        */

    const readings = req.body;

    if (!Array.isArray(readings) || readings.length === 0) {
      res.status(400).json({
        status: 400,
        message:
          "Invalid Request: Please provide a non-empty array of readings.",
      });
    } else {
      Readings.create(readings)
        .then((insertedReading) => {
          console.log(insertedReading);
          res.status(200).json({
            status: 200,
            message: "Readings Created",
            readings: insertedReading,
          });
        })
        .catch((error) => {
          res.status(500).json({
            status: 500,
            message: "Database error: " + error,
          });
        });
    }
  }
);

readingController.options("/reading/update/:id", cors());
readingController.patch(
  "/reading/update/:id",
  auth(["admin"]),
  async (req, res) => {
    /*
      #swagger.summary = 'Update precipitation reading'
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the reading to update',
        required: true,
        type: 'string'
      }
      #swagger.requestBody = {
        description: 'Update the precipitation reading',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                precipitation: {
                  type: 'number',
                  format: 'double'
                }
              }
            }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'Reading Updated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'number'
                },
                message: {
                  type: 'string'
                },
                reading: {
                  type: 'object',
                  properties: {
                    _id: {
                      type: 'string'
                    },
                    precipitation: {
                      type: 'number',
                      format: 'double'
                    }
                  }
                }
              }
            }
          }
        }
      }
      #swagger.responses[400] = {
        description: 'Invalid Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'number'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
      #swagger.responses[404] = {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'number'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
      #swagger.responses[500] = {
        description: 'Database error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'number'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    */

    const { id } = req.params;
    const { precipitation } = req.body;

    const reading = {
      _id: id,
      precipitation: parseFloat(precipitation),
    };
    console.log(reading);

    Readings.update(reading)
      .then((reading) => {
        if (reading) {
          res.status(200).json({
            status: 200,
            message: "Reading Updated",
            reading: reading,
          });
        } else {
          res.status(404).json({
            status: 404,
            message: "Reading Not Found",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Failed to update user",
        });
      });
  }
);

export default readingController;
