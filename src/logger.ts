/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import log4js = require("log4js");

import { config } from "./config";

log4js.configure(config.logger);

export const logger = log4js.getLogger("default");
export const httpLogger = log4js.getLogger("http");
export { log4js };
