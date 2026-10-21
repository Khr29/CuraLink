// Rejects a malformed MongoDB ObjectId in a route parameter before any query
// runs. Without it, `findById("abc")` / `new ObjectId("abc")` throw a Mongoose
// CastError whose message (model and path names) the controllers echo back
// to the client with a 200.
//
// Use with router.param, which runs once per matching param name:
//   router.param("doctorId", objectIdParam);
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export const isObjectIdString = (value) => typeof value === "string" && OBJECT_ID.test(value);

export const objectIdParam = (req, res, next, value) => {
  if (!isObjectIdString(value)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  next();
};
