import { Router } from "express";
import bcrypt from "bcrypt";
import { v4 as uuid4 } from "uuid";
import * as Users from "../models/user.js";
import auth from "../middleware/auth.js";
import cors from "cors";

const userController = Router();

userController.post("/users/login", (req, res) => {
  /*
    #swagger.summary = "User login"
    #swagger.requestBody = {
        description: "Attempt user login with email and password",
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string"
                        },
                        password: {
                            type: "string"
                        }
                    }
                },
                example: {
                    email: "user@server.com",
                    password: "abc123"
                }
            }
        }
    }   
    #swagger.responses[200] = {
        description: "Login successful",
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                        status: {
                            type: "number"
                        },
                        message: {
                            type: "string"
                        },
                        authKey: {
                            type: "string"
                        }
                    }
                }
            }
        }
    }
    #swagger.responses[400] = {
        description: "Invalid credentials",
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                        status: {
                            type: "number"
                        },
                        message: {
                            type: "string"
                        }
                    }
                }
            }
        }
    }
    #swagger.responses[500] = {
        description: "Database error",
        content: {
            'application/json': {
                schema: {
                    type: "object",
                    properties: {
                        status: {
                            type: "number"
                        },
                        message: {
                            type: "string"
                        }
                    }
                }
            }
        }
    }
    */

  // access request body
  let loginData = req.body;

  // Find user by email
  Users.getByEmail(loginData.email)
    .then((user) => {
      // Check passwords match
      if (bcrypt.compareSync(loginData.password, user.password)) {
        // Generate new api key
        user.authKey = uuid4().toString();
        if (user.role !== "admin") {
          user.lastLogin = new Date();
        }

        // Update user record with new api key
        Users.update(user).then((result) => {
          res.status(200).json({
            status: 200,
            message: "user logged in",
            authKey: user.authKey,
            lastLogin: user.lastLogin,
          });
        });
      } else {
        res.status(400).json({
          status: 400,
          message: "invalid credentials",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: "login failed",
      });
    });
});

userController.post("/users/logout", (req, res) => {
  /* 
    #swagger.summary = 'User logout'
    #swagger.requestBody = {
        description: 'Invalidate and clear current authentication key from the system',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        authKey: {
                            type: 'string'
                        },
                    }
                },
                example: {
                    authKey: '5814b177-b041-48c6-b913-9ed2d4a785e4',
                }
            }
        }
    } 
    #swagger.responses[200] = {
        description: 'Logout successful',
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
  const authKey = req.body.authKey;
  Users.getByAuthKey(authKey)
    .then((user) => {
      console.log(user);
      user.authKey = null;
      Users.update(user).then((user) => {
        res.status(200).json({
          status: 200,
          message: "user logged out",
          authKey: user.authKey,
        });
        console.log(user);
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: "failed to logout user",
      });
    });
});

userController.get("/users/key/:authKey", (req, res) => {
  /* 
        #swagger.summary = 'Get user by authentication key'
        #swagger.parameters['authKey'] = {
            in: 'path',
            description: 'Authentication Key',
            type: 'string'
        } 
        #swagger.responses[200] = {
            description: 'Found user',
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
                            user: {
                                type: 'object',
                                properties: {
                                    _id: {
                                        type: 'string'
                                    },
                                    studentNumber: {
                                        type: 'number'
                                    },
                                    email: {
                                        type: 'string'
                                    },
                                    password: {
                                        type: 'string'
                                    },
                                    role: {
                                        type: 'string',
                                        enum: ['student', 'admin', 'station']
                                    },
                                    authKey: {
                                        type: 'string'
                                    },
                                }
                            }
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
                            },
                        }
                    },
                }
            }
        } 
        */
  const authKey = req.params.authKey;

  Users.getByAuthKey(authKey)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          status: 404,
          message: "User not found",
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "Found user",
          user: user,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: "Failed to get user by authentication key",
      });
    });
});

userController.post("/users", auth(["admin"]), (req, res) => {
  /* 
    #swagger.summary = 'Create user'
    #swagger.requestBody = {
        description: 'Create a new user account',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        studentNumber: {
                            type: 'number'
                        },
                        email: {
                            type: 'string'
                        },
                        password: {
                            type: 'string'
                        },
                        role: {
                            type: 'string',
                            enum: ['student', 'admin', 'station']
                        },
                    }
                },
            }
        }
    } 
    #swagger.responses[200] = {
        description: 'User created',
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
                        user: {
                            type: 'object',
                            properties: {
                                _id: {
                                    type: 'string'
                                },
                                studentNumber: {
                                    type: 'number'
                                },
                                email: {
                                    type: 'string'
                                },
                                password: {
                                    type: 'string'
                                },
                                role: {
                                    type: 'string',
                                    enum: ['student', 'admin', 'station']
                                },
                                authKey: {
                                    type: 'string'
                                },
                            }
                        }
                    }
                },
            }
        }
    }
    #swagger.responses[400] = {
        description: 'Bad Request',
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
  // Get the user data out of the request
  const { studentNumber, email, password, role } = req.body;

  if (!studentNumber || !email || !password || !role) {
    return res.status(400).json({
      status: 400,
      message: "Invalid input data",
    });
  }

  // hash the password if it isn't already hashed
  let hashedPassword = password;
  if (!password.startsWith("$2a")) {
    hashedPassword = bcrypt.hashSync(password, 10);
  }

  // Convert the user data into a User model object
  const user = Users.User(
    null,
    studentNumber,
    email,
    hashedPassword,
    role,
    null,
    null
  );

  // Use the create model function to insert this user into the DB
  Users.create(user)
    .then((user) => {
      res.status(200).json({
        status: 200,
        message: "Created user",
        user: user,
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: "Failed to create user",
      });
    });
});

userController.options("/users/role", cors());
userController.put("/users/role", auth(["admin"]), (req, res) => {
  /* 
#swagger.summary = 'Update roles for users within a date range based on last login.'
#swagger.requestBody = {
    description: 'Parameters for updating user roles within a date range.',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    startDate: {
                        type: 'string',
                        format: 'date-time'
                    },
                    endDate: {
                        type: 'string',
                        format: 'date-time'
                    },
                    role: {
                        type: 'string',
                        enum: ['student', 'admin', 'station']
                    }
                }
            }
        }
    }
}
#swagger.responses[200] = {
    description: 'Roles updated successfully.',
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
    description: 'No users found within the specified date range.',
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
    description: 'Failed to update role.',
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

  const { startDate, endDate, role } = req.body;

  Users.updateRole(startDate, endDate, role)
    .then((result) => {
      console.log(result);
      if (result.modifiedCount > 0) {
        res.status(200).json({
          status: 200,
          message: "roles updated successfully.",
          result: result,
        });
      } else {
        res.status(404).json({
          status: 404,
          message: "No users found within the specified date range.",
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Failed to update roles.",
      });
    });
});

userController.options("/users/deleteInactive", cors());
userController.delete(
  "/users/deleteInactive",
  auth(["admin"]),
  async (req, res) => {
    /* 
        #swagger.summary = 'Delete users who have not logged in for 30 days or more.'
        #swagger.responses[200] = {
            description: 'Users who have not logged in for 30 days or more deleted successfully.',
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
            description: 'No users who have not logged in for 30 days or more to delete.',
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
            description: 'Failed to delete inactive users.',
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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    Users.deleteInactiveUsers(thirtyDaysAgo)
      .then((result) => {
        if (result.deletedCount > 0) {
          res.status(200).json({
            status: 200,
            message:
              "Users who have not logged in for 30 days or more deleted successfully.",
            result: result,
          });
        } else {
          res.status(404).json({
            status: 404,
            message:
              "No users who have not logged in for 30 days or more to delete.",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({
          status: 500,
          message: "Failed to delete inactive users.",
        });
      });
  }
);

userController.options("/users/:id", cors());
userController.put("/users/:id", auth(["admin"]), (req, res) => {
  /* 
    #swagger.summary = 'Update user'
        #swagger.parameters['id'] = {
          in: 'path',
          description: 'ID of the reading to update',
          required: true,
          type: 'string'
        }
  #swagger.summary = 'Update user'
      #swagger.requestBody = {
          description: 'Update a user account',
          content: {
              'application/json': {
                  schema: {
                      type: 'object',
                      properties: {
                          studentNumber: {
                              type: 'number'
                          },
                          email: {
                              type: 'string'
                          },
                          password: {
                              type: 'string'
                          },
                          role: {
                              type: 'string',
                              enum: ['student', 'admin', 'station']
                          },
                      }
                  },
              }
          }
      } 
           #swagger.responses[200] = {
               description: 'Updated user',
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
                               user: {
                                   type: 'object',
                                   properties: {
                                       studentNumber: {
                                            type: 'number'
                                        },
                                       email: {
                                           type: 'string'
                                       },
                                       password: {
                                           type: 'string'
                                       },
                                       role: {
                                           type: 'string',
                                           enum: ['student', 'admin', 'station']
                                       },
                                       authKey: {
                                           type: 'string'
                                       },
                                   }
                               }
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
                               },
                           }
                       },
                   }
               }
           } 
        */
  const _id = req.params.id;
  const { studentNumber, email, password, role } = req.body;

  let hashedPassword = password;
  if (!password.startsWith("$2a")) {
    hashedPassword = bcrypt.hashSync(password, 10);
  }
  const user = Users.User(
    _id,
    studentNumber,
    email,
    hashedPassword,
    role,
    null
  );

  Users.update(user)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          status: 404,
          message: "User not found",
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "Updated user",
          user: user,
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
});

userController.delete("/users/:id", auth(["admin"]), (req, res) => {
  /* 
     #swagger.summary = 'Delete user by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'User ID',
         type: 'string'
     } 
     #swagger.responses[200] = {
         description: 'User deleted successfully',
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
         description: 'User not found',
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

  const userID = req.params.id;

  Users.deleteById(userID)
    .then((userID) => {
      if (userID.deletedCount === 1) {
        res.status(200).json({
          status: 200,
          message: "User deleted successfully",
          userID: userID,
        });
      } else {
        res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: "Failed to delete user",
      });
    });
});

export default userController;
