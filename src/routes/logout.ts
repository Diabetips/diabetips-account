/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Sep 16 2019
*/

import { Request, Response } from "express";

export function getLogout(req: Request, res: Response) {
    req.session = {};
    res.redirect("/login");
}
