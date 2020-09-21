/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { HttpStatus } from "../lib";

export class BackError extends Error {

    constructor(public status: HttpStatus,
                public error: string,
                message: string) {
        super(message);
    }

}
