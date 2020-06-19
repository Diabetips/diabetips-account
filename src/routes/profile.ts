/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Sep 16 2019
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

import { config } from "../config";
import { logger } from "../logger";

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

async function renderProfile(req: Request, res: Response, locals: any = {}) {
    if (req.session == null) {
        throw new Error("Missing session");
    }

    try {
        locals.user = await request(config.diabetips.apiUrl + "/v1/users/me", {
            headers: {
                Authorization: "Bearer " + req.session.accessToken,
            },
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);
        throw err;
    }

    res.render("profile", locals);
}

export async function getProfile(req: Request, res: Response) {
    return renderProfile(req, res);
}

export async function postProfile(req: Request, res: Response) {
    if (req.body == null ||
        typeof req.body.first_name !== "string" ||
        typeof req.body.last_name !== "string" ||
        typeof req.body.email !== "string" ||
        typeof req.body.password !== "string") {
        res
            .status(400)
            .send();
        return;
    }

    ["first_name", "last_name", "email", "password", "timezone"].forEach((field) => {
        if (req.body[field] === "") {
            req.body[field] = undefined;
        }
    });

    try {
        if (req.body.email != null && !EMAIL_REGEX.test(req.body.email)) {
            throw new Error("Adresse email invalide");
        }

        if (req.body.password != null &&
            (req.body.password.length < 8 ||
             req.body.password.match(/[A-Z]/) == null ||
             req.body.password.match(/[a-z]/) == null ||
             req.body.password.match(/[0-9]/) == null)) {
            throw new Error("Votre mot de passe doit contenir au moins 8 caractères, dont au moins 1 lettre majuscule, 1 lettre minuscule et 1 chiffre");
        }
    } catch (err) {
        return renderProfile(req, res, { error: err.message });
    }

    try {
        await request(config.diabetips.apiUrl + "/v1/users/me", {
            method: "PUT",
            body: req.body,
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);
        return renderProfile(req, res, { error: "Erreur inconnue" });
    }

    renderProfile(req, res, { submitted: true });
}
