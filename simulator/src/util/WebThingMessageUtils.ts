export type MessageType = "setProperty" | "propertyStatus";

/**
 * WebSockets Message for Web Thing API
 */
export interface WSMessage {
  messageType: MessageType;
  data: object;
}

/**
 * Creates a Web Thing API message for use with Websockets
 */
export function createMessage(
  messageType: MessageType,
  data: object
): WSMessage {
  return {
    messageType,
    data
  };
}
