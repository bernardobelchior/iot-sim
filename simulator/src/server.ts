import errorHandler from "errorhandler";
import startApp, { IApp } from "./app";
import http from "http";

export async function start(): Promise<{ app: IApp; server: http.Server }> {
  const app = await startApp();
  /**
   * Error Handler. Provides full stack - remove for production
   */
  app.use(errorHandler());

  const server = app.listen(app.get("port"), () => {
    console.log(
      `App is running at http://localhost:${app.get("port")} in ${app.get(
        "env"
      )} mode`
    );
    console.log("Press CTRL-C to stop\n");
  });

  return { app, server };
}
