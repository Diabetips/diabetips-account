/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Sep 03 2019
*/

import fs = require("fs");

/**
 * Run a function that might throw an error. Always return a value
 * @param fn  The function to run
 * @param def The value to return in case an error is thrown
 */
export function guard<T>(fn: () => T, def: T): T {
    try {
        return fn();
    } catch (err) {
        return def;
    }
}

/**
 * Replacer to convert objects to JSON, hiding properties with a name starting with an underscore
 */
export function jsonReplacer(key: string, value: any): any {
    if (key.startsWith("_")) {
        return undefined;
    }
    return value;
}

/**
 * Synchronously load and parse a JSON file
 * @param path The path of the file to load
 */
export function loadJsonFile(path: string): any {
    return JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
}

/**
 * Recursively merge two objects. When a non-object property is present in both objects, the value from obj2 overrides
 * the value in obj1.
 * @param obj1 The first object to merge with
 * @param obj2 The second object to merge
 * @warning Only tested with simple (non-class instance) objects
 */
export function merge(obj1: any, obj2: any): any {
    const res = { ...obj1 };
    for (const prop of Object.getOwnPropertyNames(obj2)) {
        const value = obj2[prop];
        res[prop] = (obj1[prop] !== undefined && typeof value === "object")
            ? merge(obj1[prop], value)
            : value;
    }
    return res;
}
