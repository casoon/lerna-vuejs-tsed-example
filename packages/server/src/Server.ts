import {Configuration, Inject} from "@tsed/di";
import {PlatformApplication} from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import * as bodyParser from "body-parser";
import * as compress from "compression";
import * as cookieParser from "cookie-parser";
import * as methodOverride from "method-override";
import * as cors from "cors";
import "@tsed/ajv";
import "@tsed/swagger";
import "@tsed/mongoose";
import mongooseConfig from "./config/mongoose";
import * as path from "path";
import { Request, Response } from 'express';

export const rootDir = __dirname;

const clientDir = path.join(rootDir, "../../client/dist");

@Configuration({
  rootDir,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8081,
  httpsPort: false, // CHANGE
  mount: {
    "/api": [
      `${rootDir}/controllers/**/*.ts`
    ]
  },
  swagger: [
    {
      path: "/docs"
    }
  ],
  mongoose: mongooseConfig,
  exclude: [
    "**/*.spec.ts"
  ],
  statics: {
    "/": clientDir
  }
})
export class Server {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  $beforeRoutesInit() {
    this.app
      .use(cors())
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({
        extended: true
      }));

    return null;
  }

    $afterRoutesInit() {
    this.app.get("/", (req: Request, res: Response) => {
      if (!res.headersSent) {
        res.set({
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        });
      }
    });
    this.app.get(`*`, (req: Request, res: Response) => {
      res.sendFile(path.join(clientDir, "index.html"));
    });
  }
}
