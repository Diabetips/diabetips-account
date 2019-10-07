/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import cookieSession = require("cookie-session");
import express = require("express");
// tslint:disable-next-line:no-var-requires
require("express-async-errors"); // patch express to forward errors in async handlers
import { NextFunction, Request, Response } from "express";

import { httpLogger, log4js, logger } from "./logger";
import { rootRouter } from "./routes";

export const app = express();

// Express settings
app.set("view engine", "pug");
app.set("x-powered-by", false);

app.use(log4js.connectLogger(httpLogger, { level: "info" }));
app.use(cookieSession({
    name: "session",
    maxAge: 365 * 24 * 3600 * 1000, // 1 year,
    sameSite: "strict",
    secret: "lol",
    httpOnly: true,
    // secure: true,
    // secureProxy: true,
}));

// Static files
app.use(express.static("static"));
app.use(express.static("node_modules/materialize-css/dist"));

// Body parser
app.use(express.urlencoded({
    extended: false,
}));

// Auth gate
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.session === undefined) {
        req.session = {};
    }
    if (req.session.accessToken !== undefined) {
        // TODO access token
        // req.session.accessToken = undefined;
    }
    if (req.session.accessToken === undefined &&
        req.session.refreshToken !== undefined) {
        // TODO refresh token
        req.session.refreshToken = undefined;
    }

    if (req.session.refreshToken === undefined &&
        req.path !== "/login" &&
        req.path !== "/register" &&
        req.path !== "/reset-password") {
        req.session.redirect = req.url;
        res.redirect("/login");
    } else {
        next();
    }
});

// Map router
app.use(rootRouter);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    res.redirect("/");
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.redirect("/");
});
