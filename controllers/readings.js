import { Router } from "express";
import auth from "../middleware/auth.js";
import * as Readings from "../models/reading.js";
import cors from "cors";

const readingController = Router();

readingController.get(
  "/readings/:deviceName/:time",
  auth(["admin", "student"]),
  (req, res) => {
    /* 
        #swagger.summary = 'Get a reading by device name and specific date and time.'
        #swagger.parameters['deviceName'] = {
          in: 'path',
          description: 'The name of the device to filter readings.',
          type: 'string'
        }
        #swagger.parameters['time'] = {
          in: 'path',
          description: 'The date and time in the format YYYY-MM-DDTHH:mm:ssZ to filter readings.',
          type: 'string'
        }
         #swagger.responses[200] = {
             description: 'Found Reading',
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
      Readings.getReadingByDateTime(deviceName, parsedTime)
        .then((reading) => {
          if (reading) {
            res.status(200).json({
              status: 200,
              message: "Reading Found",
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
          res.status(500).json({
            status: 500,
            message: "Failed to get reading",
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
        #swagger.summary = 'Get a reading by device name and specific date and time.'
        #swagger.summary = 'Get readings within a date range.'
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
             description: 'Found Reading',
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
      Readings.getReadingsByDateRange(startTime, endTime)
        .then((readings) => {
          if (readings.length > 0) {
            res.status(200).json({
              status: 200,
              message: "Readings Found",
              readings: readings,
            });
          } else {
            res.status(404).json({
              status: 404,
              message: "Readings Not Found",
            });
          }
        })
        .catch((error) => {
          res.status(500).json({
            status: 500,
            message: "Failed to get readings",
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

    const {
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
    } = req.body;

    const readings = Readings.Reading(
      null,
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
    );

    Readings.create(readings)
      .then((readings) => {
        res.status(200).json({
          status: 200,
          message: "Readings Created",
          readings: readings,
        });
      })
      .catch((error) => {
        res.status(500).json({
          status: 500,
          message: "Failed to create readings",
        });
      });
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
