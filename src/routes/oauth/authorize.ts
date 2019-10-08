/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Oct 06 2019
*/

import { Request, Response } from "express";
import querystring = require("querystring");
import request = require("request-promise-native");

import { config } from "../../config";
import { logger } from "../../logger";

function redirectToApp(req: Request, res: Response, data: any) {
    if ("state" in req.query) {
        data.state = req.query.state;
    }

    // TODO get correct redirect uri
    const url = new URL(req.query.redirect_uri);

    if (req.query.response_type !== "token") { // "code", missing or invalid type
        Object.getOwnPropertyNames(data).forEach((prop) => {
            url.searchParams.set(prop, data[prop]);
        });
    } else {
        const fragmentParams = querystring.parse(url.hash.slice(1));
        Object.assign(fragmentParams, data);
        url.hash = "#" + querystring.stringify(fragmentParams);
    }

    res.redirect(url.toString());
}

export async function getAuthorize(req: Request, res: Response) {
    if (req.session === undefined) {
        throw new Error("Missing session");
    }

    // TODO: get app manifest
    if (typeof req.query.client_id !== "string") {
        // do something when they are implemented
    }
    // TODO, retrieve or check redirect uri from app manifest
    if (typeof req.query.redirect_uri !== "string") {
        res.send("Missing redirect_uri query parameter");
        return;
    }

    if (typeof req.query.response_type !== "string" &&
        req.query.response_type !== "code" &&
        req.query.response_type !== "token") {
        return redirectToApp(req, res, {
            error: "invalid_request",
            error_description: "Missing or invalid response_type",
        });
    }

    let response;
    try {
        response = await request(config.diabetips.apiUrl + "/v1/auth/authorize", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + req.session.accessToken,
            },
            form: {
                // TODO send client ID and scopes
                response_type: req.query.response_type,
            },
            json: true,
        });
    } catch (err) {
        logger.error("API error:", err.stack || err);
        res.send("Authorization failed (API error)");
        return;
    }

    redirectToApp(req, res, response);
}
