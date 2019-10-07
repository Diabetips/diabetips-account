/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Oct 01 2019
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

import { config } from "../config";
import { logger } from "../logger";

import { postLogin } from "./login";

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function renderRegister(req: Request, res: Response, locals: any = {}) {
    if (locals.prefill == null) {
        locals.prefill = {};
    }

    res.render("register", locals);
}

export function getRegister(req: Request, res: Response) {
    if (req.session !== undefined &&
        req.session.accessToken !== undefined) {
        res.redirect("/");
    } else {
        renderRegister(req, res);
    }
}

export async function postRegister(req: Request, res: Response) {
    if (req.session === undefined) {
        throw new Error("Missing session");
    }

    if (req.body == null ||
        typeof req.body.first_name !== "string" ||
        typeof req.body.last_name !== "string" ||
        typeof req.body.email !== "string" ||
        typeof req.body.password !== "string" ||
        typeof req.body.password_confirm !== "string") {
        res
            .status(400)
            .send();
        return;
    }

    try {
        ["first_name", "last_name", "email", "password", "password_confirm"].forEach((field) => {
            if (req.body[field] === "") {
                throw new Error("Veuillez remplir tous les champs");
            }
        });

        if (!EMAIL_REGEX.test(req.body.email)) {
            throw new Error("Adresse email invalide");
        }

        if (req.body.password.length < 8 ||
            req.body.password.match(/[A-Z]/).length < 1 ||
            req.body.password.match(/[a-z]/).length < 1 ||
            req.body.password.match(/[0-9]/).length < 1) {
            throw new Error("Votre mot de passe doit contenir au moins 8 caractères, dont au moins 1 lettre majuscule, 1 lettre minuscule et 1 chiffre");
        }

        if (req.body.password !== req.body.password_confirm) {
            throw new Error("Le mot de passe et sa confirmation ne correspondent pas");
        }
    } catch (err) {
        return renderRegister(req, res, { prefill: req.body, error: err.message });
    }

    try {
        await request(config.diabetips.apiUrl + "/v1/users", {
            method: "POST",
            body: req.body,
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack);

        let error = "Erreur inconnue";
        if (err.response != null && err.response.body != null) {
            const body = err.response.body;
            if (body.error != null && body.error === "email_conflict") {
                error = "Adresse email déjà utilisée pour un autre compte";
            }
        }
        return renderRegister(req, res, { prefill: req.body, error });
    }

    return postLogin(req, res);
}
