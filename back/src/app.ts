/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import path = require("path");

import express = require("express");
// tslint:disable-next-line:no-var-requires
require("express-async-errors"); // Patch Express to handle errors in async handlers correctly
import { NextFunction, Request, Response } from "express";

import { config } from "./config";
import { BackError } from "./errors";
import { HttpStatus, Utils } from "./lib";
import { httpLogger, log4js, logger } from "./logger";
import { routes } from "./routes";

export const app = express();

// Express settings
app.set("trust proxy", config.http.proxy ? 1 : false);
app.set("json replacer", Utils.jsonReplacer);
app.set("x-powered-by", false);

// Middlewares
app.use(log4js.connectLogger(httpLogger, {
    level: "info",
    format: ":remote-addr > \":method :url\" > :status :content-lengthB :response-timems",
}));
if (process.env.NODE_ENV !== "production") {
    let cors: (req: Request, res: Response, next: NextFunction) => void;
    app.use(async (req, res, next) => {
        if (cors == null) {
            cors = require("cors")({
                allowedHeaders: ["Content-Type"],
            });
        }
        return cors(req, res, next);
    });
}
app.use(express.json());

// Map routes
app.use(routes);

// Map front files
app.use(express.static("static"));
app.get("*", (req, res) => {
    res.sendFile(path.resolve("./static/index.html"));
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    throw new BackError(HttpStatus.NOT_FOUND,
        "invalid_route",
        `${req.method} ${req.originalUrl.split("?", 1)[0]} is not a valid route on this server`);
});

// Unidentified error to BackError converter
function convertError(err: any): BackError {
    if (err instanceof BackError) {
        return err;
    }

    // Convert API errors
    if (err.isAxiosError) {
        if (err.response) {
            logger.error(err.response.data);
            return new BackError(
                err.response.status,
                err.response.data.error,
                err.response.data.message || err.response.data.error_description);
        }
    }

    // Convert common errors
    logger.error(err.stack || err);
    return new BackError(HttpStatus.INTERNAL_SERVER_ERROR, "server_error", "Internal server error");
}

// Error handler
app.use((err: Error | BackError, req: Request, res: Response, next: NextFunction) => {
    const backErr = convertError(err);

    if (backErr.error !== "invalid_route" &&
        backErr.error !== "server_error" &&
        backErr.error !== "http") {
        logger.warn(backErr.name + ":", backErr.message);
    }

    res
        .status(backErr.status)
        .type("json")
        .send({
            ...backErr,
            message: backErr.message,
        });
});
