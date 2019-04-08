import mongoose from "mongoose";
import { vars } from "../util/vars";

// Exit application on error
mongoose.connection.on("error", (err: any) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

mongoose.set("debug", true);

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose client
 * @public
 */
export default () => {
  mongoose.connect(vars.MONGODB_URI, {
    useNewUrlParser: true,
    keepAlive: true,
    user: "dev",
    pass: "dev12345"
  });
  return mongoose.connection;
};
