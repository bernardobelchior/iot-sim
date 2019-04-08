type MessageType = "setProperty" | "propertyStatus";

interface Message {
  type: MessageType;
  data: object;
}

/**
 * Creates a Web Thing API message for use with Websockets
 */
export function createMessage(type: MessageType, data: object): Message {
  return {
    type,
    data
  };
}
