/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

import { config } from "../config";
import { logger } from "../logger";

async function renderApps(req: Request, res: Response, locals: any = {}) {
    if (req.session == null) {
        throw new Error("Missing session");
    }

    try {
        locals.apiUrl = config.diabetips.apiUrl;
        locals.apps = await request(config.diabetips.apiUrl + "/v1/users/me/apps", {
            headers: {
                Authorization: "Bearer " + req.session.accessToken,
            },
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);
        throw err;
    }

    res.render("apps", locals);
}

export async function getApps(req: Request, res: Response) {
    return renderApps(req, res);
}

export async function postApps(req: Request, res: Response) {
    if (req.session == null) {
        throw new Error("Missing session");
    }

    try {
        await request(config.diabetips.apiUrl + "/v1/users/me/apps/" + req.body.appid, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + req.session.accessToken,
            },
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);
        throw err;
    }

    res.send(204);
}
