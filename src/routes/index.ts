/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Sep 15 2019
*/

import { Request, Response } from "express";
import request = require("request-promise-native");

import { getLogin, postLogin } from "./login";
import { getLogout } from "./logout";
import { getProfile, postProfile } from "./profile";
import { getRegister, postRegister } from "./register";
import { getResetPassword, postResetPassword } from "./reset-password";

export { getLogin, getLogout, getProfile, getRegister, getResetPassword,
    postLogin, postProfile, postRegister, postResetPassword };

export async function getIndex(req: Request, res: Response) {
    if (req.session === undefined) {
        throw new Error("Missing session");
    }

    const uid = JSON.parse(
        Buffer
        .from((req.session.accessToken as string).split(".")[1], "base64")
        .toString("ascii"),
    ).sub;

    const user = await request("https://api.diabetips.fr/v1/users/" + uid, { json: true });

    res.render("index", { user });
}
