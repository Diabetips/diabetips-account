/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { Utils } from "./lib";

const env = process.env.DIABETIPS_ENV || "dev";

const baseConfig = Utils.loadJsonFile("config/config.json");
const profileConfig = Utils.loadJsonFile(`config/config.${env}.json`);
const pkg = Utils.guard(() => Utils.loadJsonFile("package.json"), {});

const tmp = Utils.merge(baseConfig, profileConfig);

export const config = {
    ...tmp,
    env,
    pkg,
};

function get(obj: any, path: string): any {
    const sep = path.indexOf(".");
    if (sep === -1) {
        return obj[path];
    } else {
        return get(obj[path.slice(0, sep)], path.slice(sep + 1));
    }
}

function resolveValue(s: string) {
    return Utils.guard(() => {
        const m = s.match(/(?<type>.)\{(?<arg>.*)\}/);
        if (m == null || m.groups == null) {
            return s;
        }
        const type = m.groups.type;
        const arg = m.groups.arg;
        switch (type) {
            case "@":
                return get(config, arg);
            case "$":
                let val = process.env[arg];
                if (val != null) {
                    val = JSON.parse("\"" + val + "\"");
                }
                return val;
            case "%":
                // tslint:disable-next-line:no-eval
                return eval(arg);
        }
    }, s);
}

function resolve(obj: any) {
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === "object") {
            resolve(obj[key]);
        } else if (typeof obj[key] === "string") {
            if (/^[@%$]\{[^}]+\}$/.test(obj[key])) {
                // Full resolve (string -> any)
                obj[key] = resolveValue(obj[key]);
            } else {
                // Partial resolve (string -> string)
                obj[key] = obj[key].replace(/[@%$]\{[^}]+\}/,
                    (s: string) => resolveValue(s));
            }
        }
    }
}

resolve(config);
