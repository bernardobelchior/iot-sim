import { MessageQueue } from "./MessageQueue";
import { IPublishPacket } from "async-mqtt";
import { IProxy, ProxyConfig } from "./ProxyConfig";
import { createMessage, MessageType } from "../util/WebThingMessageUtils";

interface HandlerParam {
  topic: string;
  content: {
    messageType: MessageType;
    data: object;
  };
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
export class Proxy {
  private readonly config: ProxyConfig;
  private readonly handlers: Array<MessageHandler>;
  private readonly reverseMessageQueue: MessageQueue;

  constructor(reverseMessageQueue: MessageQueue) {
    this.config = new ProxyConfig();
    this.handlers = [];
    this.reverseMessageQueue = reverseMessageQueue;
  }

  /**
   * Merges config with the current configuration and
   * adds handlers to the proxy.
   */
  public injectConfig(config: ProxyConfig) {
    this.config.merge(config);
    this.handlers.push(...Proxy.generateHandlersFromConfig(config));
  }

  /**
   * Subscribes to all topics.
   */
  public start() {
    return this.reverseMessageQueue.subscribe(
      "#",
      this.proxyMessage.bind(this)
    );
  }

  static generateHandlerFromConfig(proxy: IProxy): MessageHandler {
    return (args, publish) => {
      /* Skip handler if the topic doesn't match the input href */
      if (args.topic !== proxy.input.href) {
        return args;
      }

      proxy.outputs.forEach(output => {
        const topic = output.href || proxy.input.href;
        const property = output.property || proxy.input.property;

        const baseContent: any = { ...args.content.data };
        delete baseContent[proxy.input.property];

        const content = createMessage(args.content.messageType, {
          ...baseContent,
          [property]: output.value
        });

        const publishMsg = () => publish(topic, JSON.stringify(content));

        if (output.delay) {
          setTimeout(publishMsg, output.delay * 1000);
        } else {
          publish(topic, JSON.stringify(content));
        }
      });

      return {
        ...args,
        suppress: proxy.input.suppress
      };
    };
  }

  static generateHandlersFromConfig(config: ProxyConfig) {
    return config.proxies.map(Proxy.generateHandlerFromConfig);
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
      (param, handler) =>
        handler(
          param,
          this.reverseMessageQueue.publish.bind(this.reverseMessageQueue)
        ),
      initialValue
    );

    if (suppress) {
      return Promise.resolve();
    }

    return this.reverseMessageQueue.publish(topic, JSON.stringify(content));
  }
}
