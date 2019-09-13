/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import express = require("express");
// tslint:disable-next-line:no-var-requires
require("express-async-errors"); // patch express to forward errors in async handlers
import { NextFunction, Request, Response } from "express";

import { httpLogger, log4js } from "./logger";

export const app = express();

// Express settings
app.set("x-powered-by", false);

app.use(log4js.connectLogger(httpLogger, { level: "info" }));

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    // TODO
    next();
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // TODO
    next();
});
