/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Sep 16 2019
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

import { logger } from "../logger";

export async function getProfile(req: Request, res: Response) {
    if (req.session === undefined) {
        return;
    }

    const uid = JSON.parse(
        Buffer
        .from((req.session.accessToken as string).split(".")[1], "base64")
        .toString("ascii")
    ).sub;

    const user = await request("https://api.diabetips.fr/v1/users/" + uid, {
        json: true,
    });

    res.render("profile", { user });
}

export async function postProfile(req: Request, res: Response) {
    if (req.body == null) {
        return;
    }
    if (req.session === undefined) {
        return;
    }

    const uid = JSON.parse(
        Buffer
        .from((req.session.accessToken as string).split(".")[1], "base64")
        .toString("ascii")
    ).sub;

    let user: any;
    let err: Error | null = null;
    try {
        user = await request("https://api.diabetips.fr/v1/users/" + uid, {
            method: "PUT",
            body: req.body,
            json: true,
        });

    } catch (err2) {
        logger.error(err2);
        err = err2;
        user = await request("https://api.diabetips.fr/v1/users/" + uid, {
            json: true,
        });
    }

    res.render("profile", { err, user });
}
