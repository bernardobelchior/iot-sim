"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const secrets_1 = require("./util/secrets");
// Load environment variables from .env file, where API keys and passwords are configured
dotenv_1.default.config({ path: ".env.example" });
// Connect to MongoDB
const mongoUrl = secrets_1.MONGODB_URI;
mongoose_1.default.connect(mongoUrl);
/**
 * Start Node server.
 */
const http = require("http");
const server = http.createServer();
const port = process.env.PORT;
const env = process.env.NODE_ENV;
server.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err);
    }
    console.log("App is running at http://localhost:%d in %s mode", port, env);
    console.log("Press CTRL-C to stop\n");
});
exports.default = server;
//# sourceMappingURL=server.js.map