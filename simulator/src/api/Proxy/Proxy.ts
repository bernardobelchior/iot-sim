import * as math from "mathjs";
import { MessageQueue } from "../MessageQueue";
import { IPublishPacket } from "async-mqtt";
import { Config, Generator, Replacer } from "./Config";
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
  private readonly crons: Array<CronJob>;
  private readonly reverseMessageQueue: MessageQueue;

  constructor(reverseMessageQueue: MessageQueue) {
    this.config = new Config();
    this.handlers = [];
    this.crons = [];
    this.reverseMessageQueue = reverseMessageQueue;
  }

  /**
   * Merges config with the current configuration and
   * adds handlers to the proxy.
   */
  public injectConfig(config: Config) {
    this.config.merge(config);
    this.handlers.push(...config.replacers.map(Proxy.generateReplacerHandler));

    const crons = config.generators.map(g =>
      Proxy.generateGeneratorHandler(
        g,
        this.reverseMessageQueue.publish.bind(this.reverseMessageQueue)
      )
    );

    this.crons.push(...crons);
    crons.forEach(c => c.start());
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

  static generateGeneratorHandler(
    generator: Generator,
    publish: MessageQueue["publish"]
  ): CronJob {
    const handlers = generator.outputs.map(output => {
      return () => {
        const { href, property, value } = output;

        publish(
          href,
          JSON.stringify(
            createMessage("propertyStatus", {
              [property]: value
            })
          )
        );
      };
    });

    return new CronJob(generator.input.cron, () => {
      handlers.forEach(h => h());
    });
  }

  static generateReplacerHandler(replacer: Replacer): MessageHandler {
    return (args, publish) => {
      /* Skip handler if the topic doesn't match the input href */
      if (args.topic !== replacer.input.href) {
        return args;
      }

      replacer.outputs.forEach(output => {
        const topic = output.href || replacer.input.href;
        const property = output.property || replacer.input.property;
        const inputValue: any = (args.content.data as any)[property];

        const baseContent: any = { ...args.content.data };
        delete baseContent[replacer.input.property];

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
        suppress: replacer.input.suppress
      };
    };
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
    console.log(JSON.parse(message.toString()));

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
