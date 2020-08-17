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
        renderResetPassword(req, res, { continued: req.query.code != null });
    }
}

export async function postResetPassword(req: Request, res: Response) {
    if (req.session == null) {
        throw new Error("Missing session");
    }

    if (req.query.code == null) {
        if (req.body == null || typeof req.body.email !== "string") {
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
                auth: { username: config.diabetips.clientId, password: config.diabetips.clientSecret },
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
    } else {
        if (req.body == null
            || typeof req.body.password !== "string"
            || typeof req.body.password_confirm !== "string") {
            res
                .status(400)
                .send();
            return;
        }

        try {
            if (req.body.password.length < 8 ||
                req.body.password.match(/[A-Z]/) == null ||
                req.body.password.match(/[a-z]/) == null ||
                req.body.password.match(/[0-9]/) == null) {
                throw new Error("Votre mot de passe doit contenir au moins 8 caractères, dont au moins 1 lettre majuscule, 1 lettre minuscule et 1 chiffre");
            }

            if (req.body.password !== req.body.password_confirm) {
                throw new Error("Le mot de passe et sa confirmation ne correspondent pas");
            }
        } catch (err) {
            return renderResetPassword(req, res, { continued: true, error: err.message });
        }

        try {
            await request(config.diabetips.apiUrl + "/v1/auth/reset-password", {
                method: "PUT",
                auth: { username: config.diabetips.clientId, password: config.diabetips.clientSecret },
                body: {
                    code: req.query.code,
                    password: req.body.password,
                },
                json: true,
            });
        } catch (err) {
            logger.error("API error:", err.stack || err);
            let error = "Erreur inconnue";
            if (err.response != null && err.response.body != null) {
                const body = err.response.body;
                if (body.error != null && body.error === "invalid_code") {
                    error = "Lien de réinitialisation invalide, expiré ou déjà utilisé";
                }
            }
            return renderResetPassword(req, res, { continued: true, error });
        }

        renderResetPassword(req, res, { continued: true, submitted: true });
    }
}
