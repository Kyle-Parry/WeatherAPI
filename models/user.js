import { ObjectId } from "mongodb";
import { db } from "../database/database.js";

export function User(
  _id,
  studentNumber,
  email,
  password,
  role,
  authKey,
  lastLogin
) {
  return {
    _id,
    studentNumber,
    email,
    password,
    role,
    authKey,
    lastLogin,
  };
}

export async function create(user) {
  // Clear _id from user to ensure the new user does not
  // have an existing _id from the database, as we want a new _id
  // to be created and added to the user object.
  delete user.id;

  // Insert the user document and implicitly add the new _id to user
  return db.collection("users").insertOne(user);
}

export async function getByEmail(email) {
  // attempt to find the first matching user by email
  let user = await db.collection("users").findOne({ email: email });

  // check if a user was found and handle the result
  if (user) {
    return user;
  } else {
    return Promise.reject("user not found with email " + email);
  }
}

export async function getByAuthKey(key) {
  // attempt to find the first matching user by authentication key
  let user = await db.collection("users").findOne({ authKey: key });

  // check if a user was found and handle the result
  if (user) {
    return user;
  } else {
    // do not return authentication key in error for security reasons
    return Promise.reject("user not found");
  }
}

export async function update(user) {
  // update the user by replacing the user with matching _id with user
  return db.collection("users").updateOne(
    { _id: new ObjectId(user._id) },
    {
      $set: {
        studentNumber: user.studentNumber,
        email: user.email,
        role: user.role,
        authKey: user.authKey,
        lastLogin: user.lastLogin,
      },
    }
  );
}

export async function updateRole(startDate, endDate, role) {
  return db.collection("users").updateMany(
    {
      lastLogin: { $gte: new Date(startDate), $lte: new Date(endDate) },
    },
    {
      $set: {
        role: role,
      },
    }
  );
}

export async function deleteById(id) {
  return db.collection("users").deleteOne({ _id: new ObjectId(id) });
}

export async function deleteInactiveUsers(thirtyDaysAgo) {
  const result = await db.collection("users").deleteMany({
    lastLogin: {
      $lte: thirtyDaysAgo,
    },
  });
  return result;
}
