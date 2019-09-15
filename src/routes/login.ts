/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Sep 15 2019
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

export function getLogin(req: Request, res: Response) {
    if (req.session !== undefined &&
        req.session.accessToken !== undefined) {
        res.redirect("/");
    } else {
        res.render("login");
    }
}

export async function postLogin(req: Request, res: Response) {
    try {
        if (req.body == null ||
            typeof req.body.email !== "string" ||
            typeof req.body.password !== "string" ||
            req.body.email === "" ||
            req.body.password === "") {
            throw new Error("Veuillez préciser votre email et votre mot de passe");
        }

        const apiRes = await request("https://api.diabetips.fr/v1/auth/token", {
            method: "POST",
            form: {
                grant_type: "password",
                username: req.body.email,
                password: req.body.password,
            },
            json: true,
        });

        if (req.session === undefined) {
            throw new Error("Erreur interne");
        }

        req.session.accessToken = apiRes.access_token;
        req.session.refreshToken = apiRes.refresh_token;
    } catch (err) {
        res.render("login");
        return;
    }

    let redirect: string;
    if (req.session !== undefined && req.session.redirect !== undefined) {
        redirect = req.session.redirect;
        req.session.redirect = undefined;
    } else {
        redirect = "/";
    }
    res.redirect(redirect);
}
