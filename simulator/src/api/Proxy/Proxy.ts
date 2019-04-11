import * as math from "mathjs";
import { MessageQueue } from "../MessageQueue";
import { IPublishPacket } from "async-mqtt";
import { Config, GeneratorInput, Input, IProxy, ReplacerInput } from "./Config";
import { createMessage, MessageType } from "../../util/WebThingMessageUtils";
import { CronJob } from "cron";

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
  private readonly config: Config;
  private readonly handlers: Array<MessageHandler>;
  private readonly reverseMessageQueue: MessageQueue;

  constructor(reverseMessageQueue: MessageQueue) {
    this.config = new Config();
    this.handlers = [];
    this.reverseMessageQueue = reverseMessageQueue;
  }

  /**
   * Merges config with the current configuration and
   * adds handlers to the proxy.
   */
  public injectConfig(config: Config) {
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

  static isReplacerInput(proxy: IProxy<Input>): proxy is IProxy<ReplacerInput> {
    const input = proxy.input as any;

    return (
      input.href !== undefined &&
      input.property !== undefined &&
      input.suppress !== undefined
    );
  }

  static generateGeneratorHandler(proxy: IProxy<GeneratorInput>): CronJob {
    const handlers = proxy.outputs.map(output => {
        return (publish: MessageQueue["publish"]) => {
          const { href, property, value } = output;

          publish(href, JSON.stringify(createMessage("setProperty", {
            [property]: value
          })));
        };
    });

    return new CronJob(proxy.input.cron, function() {
      this.
    });
  }

  static generateReplacerHandler(proxy: IProxy<ReplacerInput>): MessageHandler {
    return (args, publish) => {
      /* Skip handler if the topic doesn't match the input href */
      if (args.topic !== proxy.input.href) {
        return args;
      }

      proxy.outputs.forEach(output => {
        const topic = output.href || proxy.input.href;
        const property = output.property || proxy.input.property;
        const inputValue: any = (args.content.data as any)[property];

        const baseContent: any = { ...args.content.data };
        delete baseContent[proxy.input.property];

        const { value, expr } = output;
        const calculatedValue =
          value === undefined ? math.eval(expr!, { value: inputValue }) : value;

        const content = createMessage(args.content.messageType, {
          ...baseContent,
          [property]: calculatedValue
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

  static generateHandlerFromConfig(
    proxy: IProxy<Input>
  ): MessageHandler | undefined {
    /* If input is not replacer, then it is a generator and is skipped. */
    if (Proxy.isReplacerInput(proxy)) {
      return Proxy.generateReplacerHandler(proxy);
    } else {
      Proxy.generateGeneratorHandler(proxy as IProxy<GeneratorInput>);
    }

    return;
  }

  static generateHandlersFromConfig(config: Config): MessageHandler[] {
    return config.proxies
      .map(Proxy.generateHandlerFromConfig)
      .filter(f => f !== undefined) as MessageHandler[];
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
