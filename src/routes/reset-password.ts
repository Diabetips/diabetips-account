/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Oct 05 2019
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

import { config } from "../config";
import { logger } from "../logger";

function renderResetPassword(req: Request, res: Response, locals: any = {}) {
    res.render("reset-password", locals);
}

export function getResetPassword(req: Request, res: Response) {
    if (req.session != null &&
        req.session.accessToken !== undefined) {
        res.redirect("/");
    } else {
        renderResetPassword(req, res);
    }
}

export async function postResetPassword(req: Request, res: Response) {
    if (req.session === undefined) {
        throw new Error("Missing session");
    }

    if (req.body == null ||
        typeof req.body.email !== "string") {
        res
            .status(400)
            .send();
        return;
    }

    if (req.body.email === "") {
        return renderResetPassword(req, res, { error: "Veuillez spécifier votre adresse email" });
    }

    try {
        await request(config.diabetips.apiUrl + "/v1/auth/reset-password", {
            method: "POST",
            body: {
                email: req.body.email,
            },
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);
        return renderResetPassword(req, res, { error: "Erreur inconnue" });
    }

    renderResetPassword(req, res, { submitted: true });
}
