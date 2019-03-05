import errorHandler from "errorhandler";
import startApp from "./app";

export async function start() {
  const app = await startApp();
  /**
   * Error Handler. Provides full stack - remove for production
   */
  app.use(errorHandler());

  return app.listen(app.get("port"), () => {
    console.log(
      `App is running at http://localhost:${app.get("port")} in ${app.get(
        "env"
      )} mode`
    );
    console.log("Press CTRL-C to stop\n");
  });
}
