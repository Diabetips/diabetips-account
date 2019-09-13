/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { guard, loadJsonFile, merge } from "./lib";

const env = process.env.DIABETIPS_ENV || "dev";

const baseConfig = loadJsonFile("config/config.json");
const profileConfig = loadJsonFile(`config/config.${env}.json`);
const pkg = guard(() => loadJsonFile("package.json"), {});

const tmp = merge(baseConfig, profileConfig);

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

function resolve(obj: any) {
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === "object") {
            resolve(obj[key]);
        } else if (typeof obj[key] === "string") {
            obj[key] = obj[key].replace(/[@%$]\{[^}]+\}/,
                (s: string) => JSON.parse("\"" + guard(() => {
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
                        return process.env[arg];
                    case "%":
                        // tslint:disable-next-line:no-eval
                        return eval(arg);
                }
            }, s) + "\""));
        }
    }
}

resolve(config);
