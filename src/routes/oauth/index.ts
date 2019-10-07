/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Oct 06 2019
*/

import express = require("express");
import request = require("request-promise-native");

import { getAuthorize } from "./authorize";

export const oauthRouter = express.Router();

oauthRouter.get("/authorize", getAuthorize);
