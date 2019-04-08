import toml from "toml";
import fs from "fs";
import { ProxyConfig } from "../src/api/ProxyConfig";
import { FakeProxy } from "../src/api/FakeProxy";
import { IPublishPacket } from "async-mqtt";
import { createMessage } from "../src/util/WebThingMessageUtils";
import { MessageCallback, MessageQueue } from "../src/api/MessageQueue";

describe("FakeProxy", () => {
  it("should generate handler that replaces property value", async () => {
    const result = toml.parse(
      fs.readFileSync("./test/simpleReplacer.toml").toString()
    );

    const config = new ProxyConfig(result);
    const proxy = config.proxies[0];

    const publish = jest.fn();
    const handler = FakeProxy.generateHandlerFromConfig(proxy);

    handler(
      {
        topic: proxy.input.href,
        suppress: false,
        content: createMessage("setProperty", {
          [proxy.input.property]: 40
        }),
        packet: {} as IPublishPacket
      },
      publish
    );

    expect(publish).toHaveBeenCalledWith(
      proxy.input.href,
      JSON.stringify(
        createMessage("setProperty", {
          [proxy.input.property]: 20
        })
      )
    );
  });

  it("should proxy every message as-is when no config is present", async () => {
    const message = {
      topic: "/things/thermometer",
      payload: JSON.stringify(
        createMessage("setProperty", {
          temperature: 40
        })
      )
    };

    const messageQueue = await MessageQueue.create("", "");

    jest
      .spyOn(messageQueue, "subscribe")
      .mockImplementation((topic: string, onMessage: MessageCallback) => {
        onMessage(message.topic, Buffer.from(message.payload), {} as any);

        return Promise.resolve();
      });

    const publish = jest.spyOn(messageQueue, "publish");

    const proxy = new FakeProxy(new ProxyConfig({ proxies: [] }), messageQueue);

    await proxy.start();

    expect(publish).toHaveBeenCalledWith(message.topic, message.payload);
  });
});