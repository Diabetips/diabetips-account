/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Sep 15 2019
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

import { config } from "../config";
import { logger } from "../logger";

interface ITokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

function renderLogin(req: Request, res: Response, locals: any = {}) {
    res.render("login", locals);
}

export function getLogin(req: Request, res: Response) {
    if (req.session != null &&
        req.session.accessToken !== undefined) {
        res.redirect("/");
    } else {
        renderLogin(req, res);
    }
}

export async function postLogin(req: Request, res: Response) {
    if (req.session == null) {
        throw new Error("Missing session");
    }

    if (req.body == null ||
        typeof req.body.email !== "string" ||
        typeof req.body.password !== "string") {
        res
            .status(400)
            .send();
        return;
    }

    if (req.body.email === "" || req.body.password === "") {
        return renderLogin(req, res, { error: "Veuillez spécifier votre adresse email et votre mot de passe" });
    }

    let tokens: ITokenResponse;
    try {
        tokens = await request(config.diabetips.apiUrl + "/v1/auth/token", {
            method: "POST",
            auth: { username: config.diabetips.clientId, password: config.diabetips.clientSecret },
            form: {
                grant_type: "password",
                username: req.body.email,
                password: req.body.password,
                scope: "apps:read apps:write profile:write user:delete",
            },
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);

        let error = "Erreur inconnue";
        if (err.response != null && err.response.body != null) {
            const body = err.response.body;
            if (body.error != null) {
                if (body.error === "invalid_grant") {
                    error = "Adresse email ou mot de passe incorrect";
                } else if (body.error === "registration_incomplete") {
                    error = "Adresse email non confirmée";
                }
            }
        }
        return renderLogin(req, res, { error });
    }

    req.session.accessToken = tokens.access_token;

    let redirect = "/";
    if (req.session != null &&
        req.session.redirect !== undefined) {
        redirect = req.session.redirect;
        req.session.redirect = undefined;
    }

    res.redirect(redirect);
}
