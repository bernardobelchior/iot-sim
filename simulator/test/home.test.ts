import request from "supertest";
import "jest";
import app from "../src/app";

describe("GET /", () => {
  it("should return 200 OK", async done => {
    request(await app())
      .get("/things")
      .expect(200, done);
  });
});
