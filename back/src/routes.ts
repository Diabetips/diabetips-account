/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Aug 17 2020
*/

import express = require("express");
import qs = require("qs");

import { default as axios } from "axios";

import { config } from "./config";
import { HttpStatus } from "./lib";
import { logger } from "./logger";

export const routes = express.Router();

routes.post("/confirm", async (req, res) => {
    const r = await axios.post(`${config.diabetips.apiUrl}/v1/auth/confirm`, {
        code: req.body.code,
    }, {
        auth: {
            username: config.diabetips.clientId,
            password: config.diabetips.clientSecret,
        },
    });

    res
        .status(r.status)
        .send();
});

routes.post("/login", async (req, res) => {
    res.send(await doLogin(req.body));
});

routes.post("/logout", async (req, res) => {
    try {
        await axios.post(`${config.diabetips.apiUrl}/v1/auth/revoke`, qs.stringify({
            token: req.body.token,
        }), {
            auth: {
                username: config.diabetips.clientId,
                password: config.diabetips.clientSecret,
            },
        });
    } catch (err) {
        logger.error("Failed to revoke token: ", err.stack || err);
    }

    res
        .status(HttpStatus.ACCEPTED)
        .send();
});

routes.post("/refresh", async (req, res) => {
    const r = await axios.post(`${config.diabetips.apiUrl}/v1/auth/token`, qs.stringify({
        grant_type: "refresh_token",
        refresh_token: req.body.refresh_token,
    }), {
        auth: {
            username: config.diabetips.clientId,
            password: config.diabetips.clientSecret,
        },
    });

    res.send(r.data);
});

routes.post("/register", async (req, res) => {
    await axios.post(`${config.diabetips.apiUrl}/v1/users`, req.body, {
        auth: {
            username: config.diabetips.clientId,
            password: config.diabetips.clientSecret,
        },
    });

    res.send(await doLogin(req.body));
});

routes.post("/reset-password", async (req, res) => {
    const r = await axios.post(`${config.diabetips.apiUrl}/v1/auth/reset-password`, {
        email: req.body.email,
    }, {
        auth: {
            username: config.diabetips.clientId,
            password: config.diabetips.clientSecret,
        },
    });

    res
        .status(r.status)
        .send();
});

routes.put("/reset-password", async (req, res) => {
    const r = await axios.put(`${config.diabetips.apiUrl}/v1/auth/reset-password`, {
        code: req.body.code,
        password: req.body.password,
    }, {
        auth: {
            username: config.diabetips.clientId,
            password: config.diabetips.clientSecret,
        },
    });

    res
        .status(r.status)
        .send();
});

async function doLogin(body: any) {
    const r = await axios.post(`${config.diabetips.apiUrl}/v1/auth/token`, qs.stringify({
        grant_type: "password",
        username: body.email,
        password: body.password,
        scope: "apps:read apps:write profile:write user:delete"
    }), {
        auth: {
            username: config.diabetips.clientId,
            password: config.diabetips.clientSecret,
        },
    });

    return r.data;
};
