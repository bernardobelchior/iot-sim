import { MessageQueue } from "./MessageQueue";
import { IPublishPacket } from "async-mqtt";
import { Proxy, ProxyConfig } from "./ProxyConfig";
import { createMessage } from "../util/WebThingMessageUtils";

interface HandlerParam {
  topic: string;
  content: object;
  suppress: boolean;
  packet: IPublishPacket;
}

export type MessageHandler = (
  args: HandlerParam,
  publish: MessageQueue["publish"]
) => HandlerParam;

/**
 * Class responsible for proxying messages from the write to the read queue.
 * It uses a "Chain of Responsibility" pattern to decide how to handle messages.
 * Every message goes through every handler and the final value will defined
 * how the message will ultimately be handled.
 */
export class FakeProxy {
  private readonly config: ProxyConfig;
  private readonly handlers: Array<MessageHandler>;
  private readonly reverseMessageQueue: MessageQueue;

  constructor(config: ProxyConfig, reverseMessageQueue: MessageQueue) {
    this.config = config;
    this.handlers = [];
    this.reverseMessageQueue = reverseMessageQueue;
  }

  public start() {
    this.generateHandlersFromConfig();

    return this.reverseMessageQueue.subscribe(
      "#",
      this.proxyMessage.bind(this)
    );
  }

  static generateHandlerFromConfig(proxy: Proxy): MessageHandler {
    return (args, publish) => {
      /* Skip handler if the topic doesn't match the input href */
      if (args.topic !== proxy.input.href) {
        return args;
      }

      proxy.outputs.forEach(output => {
        publish(
          args.topic,
          JSON.stringify(
            createMessage("setProperty", {
              [proxy.input.property]: output.value
            })
          )
        );
      });

      return {
        ...args,
        suppress: proxy.input.suppress
      };
    };
  }

  private generateHandlersFromConfig() {
    this.config.proxies.forEach(p => {
      this.addHandler(FakeProxy.generateHandlerFromConfig(p));
    });
  }

  /**
   * Adds handler to the end of the list
   * @param handler
   */
  addHandler(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  private async proxyMessage(
    topic: string,
    message: Buffer,
    packet: IPublishPacket
  ) {
    const initialValue = {
      content: JSON.parse(message.toString()),
      topic,
      suppress: false,
      packet
    };

    const { suppress, content }: HandlerParam = this.handlers.reduce(
      (param, handler) => handler(param, this.reverseMessageQueue.publish),
      initialValue
    );

    if (suppress) {
      return Promise.resolve();
    }

    return this.reverseMessageQueue.publish(topic, JSON.stringify(content));
  }
}
