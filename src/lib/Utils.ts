/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Sep 03 2019
*/

import fs = require("fs");

export class Utils {
    /**
     * Fallback to a default value if the specified function throws an error
     * @param fn  The function to run
     * @param defaultValue The value to return if an error is thrown
     */
    public static guard<T>(fn: () => T, defaultValue: T): T {
        try {
            return fn();
        } catch (err) {
            return defaultValue;
        }
    }

    /**
     * Fallback to a default value if an optional value is undefined
     * @param value The optional value
     * @param defaultValue The default value to set if value is `undefined`
     * @returns `val` if it is not undefined, `def` otherwise
     */
    public static optionDefault<T>(value: any, defaultValue: T): T {
        return value === undefined ? defaultValue : value;
    }

    /**
     * Replacer to convert objects to JSON, hiding properties with a name starting with an underscore
     */
    public static jsonReplacer(key: string, value: any): any {
        if (key.startsWith("_")) {
            return undefined;
        }
        return value;
    }

    /**
     * Asynchronously load a text file
     * @param path The path of the file to load
     */
    public static async readFile(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Asynchronously list the content of a director
     * @param path The path of the directory to list
     */
    public static async readDir(path: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

    /**
     * Asynchronously load and parse a JSON file
     * @param path The path of the file to load
     */
    public static async loadJsonFile(path: string): Promise<any> {
        return JSON.parse(await this.readFile(path));
    }

    /**
     * Synchronously load and parse a JSON file
     * @param path The path of the file to load
     */
    public static loadJsonFileSync(path: string): any {
        return JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
    }

    /**
     * Recursively merge two objects. When a non-object property is present in both objects, the value from obj2
     * overrides the value in obj1.
     * @param obj1 The first object to merge with
     * @param obj2 The second object to merge
     * @warning Only tested with simple (non-class instance) objects
     */
    public static merge(obj1: any, obj2: any): any {
        const res = { ...obj1 };
        for (const prop of Object.getOwnPropertyNames(obj2)) {
            const value = obj2[prop];
            res[prop] = (obj1[prop] !== undefined && typeof value === "object")
                ? this.merge(obj1[prop], value)
                : value;
        }
        return res;
    }
}
