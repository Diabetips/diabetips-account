/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Jan 19 2020
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

import { config } from "../config";
import { logger } from "../logger";

function renderConfirm(req: Request, res: Response, locals: any = {}) {
    res.render("confirm", locals);
}

export async function getConfirm(req: Request, res: Response) {
    if (req.session === undefined) {
        throw new Error("Missing session");
    }

    if (req.query == null ||
        typeof req.query.code !== "string") {
        res
            .status(400)
            .send();
        return;
    }

    if (req.body.code === "") {
        return renderConfirm(req, res, { confirmed: false });
    }

    try {
        await request(config.diabetips.apiUrl + "/v1/auth/confirm", {
            method: "POST",
            body: {
                code: req.query.code,
            },
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);
        return renderConfirm(req, res, { confirmed: false });
    }

    renderConfirm(req, res, { confirmed: true });
}
