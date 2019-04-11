import {
  IProxyConfig,
  Config,
  ReplacerInput,
  GeneratorInput,
  IProxy
} from "./Config";
import { Proxy } from "./Proxy";
import { IPublishPacket } from "async-mqtt";
import { createMessage } from "../../util/WebThingMessageUtils";
import { MessageCallback, MessageQueue } from "../MessageQueue";
import SpyInstance = jest.SpyInstance;
import ArgsType = jest.ArgsType;

describe("Proxy", () => {
  describe("logic", () => {
    const message = {
      topic: "/things/thermometer",
      payload: JSON.stringify(
        createMessage("setProperty", {
          temperature: 40
        })
      )
    };

    let messageQueue: MessageQueue;
    let publish: SpyInstance<
      ReturnType<MessageQueue["publish"]>,
      ArgsType<MessageQueue["publish"]>
    >;
    let proxy: Proxy;

    beforeAll(async () => {
      messageQueue = await MessageQueue.create("", "");
      jest.useFakeTimers();

      jest
        .spyOn(messageQueue, "subscribe")
        .mockImplementation((topic: string, onMessage: MessageCallback) => {
          onMessage(message.topic, Buffer.from(message.payload), {} as any);

          return Promise.resolve();
        });

      publish = jest
        .spyOn(messageQueue, "publish")
        .mockImplementation(() => Promise.resolve({} as any));
    });

    afterEach(() => {
      publish.mockClear();
    });

    beforeEach(() => {
      proxy = new Proxy(messageQueue);
    });

    it("should proxy every message as-is when no config is present", async () => {
      await proxy.start();

      expect(publish).toHaveBeenCalledWith(message.topic, message.payload);
    });

    it("should replace message when has proxy in config", async () => {
      const proxyConfig: IProxyConfig = {
        proxies: [
          {
            input: {
              property: "temperature",
              href: "/things/thermometer",
              suppress: true
            },
            outputs: [{ value: 23, delay: 0 }]
          }
        ]
      };

      const config = new Config(proxyConfig);
      proxy.injectConfig(config);

      await proxy.start();

      expect(publish).toHaveBeenCalledWith(
        message.topic,
        JSON.stringify(createMessage("setProperty", { temperature: 23 }))
      );
    });

    it("should duplicate value to another thing when href is set", async () => {
      const proxyConfig: IProxyConfig = {
        proxies: [
          {
            input: {
              property: "temperature",
              href: "/things/thermometer",
              suppress: false
            },
            outputs: [
              {
                value: 23,
                delay: 0,
                href: "/things/room-thermometer",
                property: "temp"
              }
            ]
          }
        ]
      };

      const config = new Config(proxyConfig);
      proxy.injectConfig(config);

      await proxy.start();

      expect(publish).toHaveBeenNthCalledWith(
        1,
        "/things/room-thermometer",
        JSON.stringify(createMessage("setProperty", { temp: 23 }))
      );
      expect(publish).toHaveBeenNthCalledWith(
        2,
        message.topic,
        JSON.stringify(createMessage("setProperty", { temperature: 40 }))
      );
    });

    it("should delay message when delay property is set", async () => {
      const delay = 5;
      const proxyConfig: IProxyConfig = {
        proxies: [
          {
            input: {
              property: "temperature",
              href: "/things/thermometer",
              suppress: true
            },
            outputs: [
              {
                value: 23,
                delay
              }
            ]
          }
        ]
      };

      const config = new Config(proxyConfig);
      proxy.injectConfig(config);

      await proxy.start();

      expect(publish).not.toHaveBeenCalled();

      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        delay * 1000
      );

      jest.advanceTimersByTime(delay * 1000);

      expect(publish).toHaveBeenCalledWith(
        "/things/thermometer",
        JSON.stringify(createMessage("setProperty", { temperature: 23 }))
      );
    });

    it("should return value equal to twice the one received", async () => {
      const proxyConfig: IProxyConfig = {
        proxies: [
          {
            input: {
              property: "temperature",
              href: "/things/thermometer",
              suppress: true
            },
            outputs: [
              {
                expr: "value * 2",
                delay: 0
              }
            ]
          }
        ]
      };

      const config = new Config(proxyConfig);
      proxy.injectConfig(config);

      await proxy.start();

      expect(publish).toHaveBeenCalledWith(
        "/things/thermometer",
        JSON.stringify(createMessage("setProperty", { temperature: 80 }))
      );
    });
  });

  describe("handlers", () => {
    it("should generate handler that replaces property value", async () => {
      const proxy = {
        input: {
          href: "/things/thermometer",
          property: "temperature",
          suppress: true
        },
        outputs: [
          {
            value: 40,
            delay: 0
          }
        ]
      };

      const publish = jest.fn();
      const handler = Proxy.generateHandlerFromConfig(proxy)!;
      const input = proxy.input as ReplacerInput;

      handler(
        {
          topic: input.href,
          suppress: false,
          content: createMessage("setProperty", {
            [input.property]: 20
          }),
          packet: {} as IPublishPacket
        },
        publish
      );

      expect(publish).toHaveBeenCalledWith(
        input.href,
        JSON.stringify(
          createMessage("setProperty", {
            [input.property]: 40
          })
        )
      );
    });

    it("should generate handler that generates values", async () => {
      const proxy: IProxy<GeneratorInput> = {
        input: {
          cron: "0/5 * * * * *"
        },
        outputs: [
          {
            href: "/things/thermometer",
            property: "temperature",
            value: 40,
            delay: 0
          }
        ]
      };

      const publish = jest.fn();
      const handler = Proxy.generateGeneratorHandler(proxy);
      const input = proxy.input;

      handler(
        {
          topic: input.href,
          suppress: false,
          content: createMessage("setProperty", {
            [input.property]: 20
          }),
          packet: {} as IPublishPacket
        },
        publish
      );

      expect(publish).toHaveBeenCalledWith(
        input.href,
        JSON.stringify(
          createMessage("setProperty", {
            [input.property]: 40
          })
        )
      );
    });
  });
});
