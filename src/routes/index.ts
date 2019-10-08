/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Sep 15 2019
*/

import { Request, Response } from "express";
import express = require("express");
import request = require("request-promise-native");

import { config } from "../config";
import { logger } from "../logger";

import { oauthRouter } from "./oauth";

import { getLogin, postLogin } from "./login";
import { getLogout } from "./logout";
import { getProfile, postProfile } from "./profile";
import { getRegister, postRegister } from "./register";
import { getResetPassword, postResetPassword } from "./reset-password";

export const rootRouter = express.Router();

rootRouter.get("/", async function getIndex(req: Request, res: Response) {
    if (req.session === undefined) {
        throw new Error("Missing session");
    }

    let user: any;
    try {
        user = await request(config.diabetips.apiUrl + "/v1/users/me", {
            headers: {
                Authorization: "Bearer " + req.session.accessToken,
            },
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);
        throw err;
    }

    res.render("index", { user });
});

rootRouter.use("/oauth", oauthRouter);

rootRouter.get("/login", getLogin);
rootRouter.get("/logout", getLogout);
rootRouter.get("/profile", getProfile);
rootRouter.get("/register", getRegister);
rootRouter.get("/reset-password", getResetPassword);

rootRouter.post("/login", postLogin);
rootRouter.post("/profile", postProfile);
rootRouter.post("/register", postRegister);
rootRouter.post("/reset-password", postResetPassword);
