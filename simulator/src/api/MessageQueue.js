"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var amqplib_1 = require("amqplib");
var promise_1 = require("../util/promise");
var logger_1 = require("../util/logger");
function messageQueueBuilder(url) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, mq;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, amqplib_1["default"].connect(url)];
                case 1:
                    connection = _a.sent();
                    mq = new MessageQueue(url, connection);
                    return [4 /*yield*/, mq.init()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, mq];
            }
        });
    });
}
exports.messageQueueBuilder = messageQueueBuilder;
var IMessageQueue = /** @class */ (function () {
    function IMessageQueue() {
    }
    return IMessageQueue;
}());
exports.IMessageQueue = IMessageQueue;
var MessageQueue = /** @class */ (function (_super) {
    __extends(MessageQueue, _super);
    function MessageQueue(url, connection) {
        var _this = _super.call(this) || this;
        _this.url = url;
        _this.connection = connection;
        return _this;
    }
    MessageQueue.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.connection.createChannel()];
                    case 1:
                        _a.channel = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MessageQueue.prototype.assertQueue = function (queue) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.channel === undefined) {
                    logger_1["default"].error("MessageQueue: tried to assert queue without channel");
                    throw new Error("MessageQueue: tried to assert queue without channel");
                }
                return [2 /*return*/, this.channel.assertQueue(queue)];
            });
        });
    };
    MessageQueue.prototype.createExchange = function (exchange, type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.channel === undefined) {
                            logger_1["default"].error("MessageQueue: tried to create exchange without channel");
                            throw new Error("MessageQueue: tried to create exchange without channel");
                        }
                        return [4 /*yield*/, this.channel.assertExchange(exchange, type, {
                                durable: true
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MessageQueue.prototype.publish = function (exchange, routingKey, message) {
        if (this.channel === undefined) {
            logger_1["default"].error("MessageQueue: tried to publish without channel");
            throw new Error("MessageQueue: tried to publish without channel");
        }
        return this.channel.publish(exchange, routingKey, message, {
            contentType: "application/json"
        });
    };
    MessageQueue.prototype.consume = function (queue, onMessage) {
        if (this.channel === undefined) {
            logger_1["default"].error("MessageQueue: tried to consume without channel");
            throw new Error("MessageQueue: tried to consume without channel");
        }
        return promise_1.toNativePromise(this.channel.consume(queue, onMessage));
    };
    return MessageQueue;
}(IMessageQueue));
exports.MessageQueue = MessageQueue;
