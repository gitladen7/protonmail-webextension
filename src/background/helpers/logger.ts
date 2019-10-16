/* eslint-disable no-console */
export class Logger {

    debug(str: string) {
        if (process.env.NODE_ENV !== "development") {
            return;
        }

        const log = `${new Date().toISOString()} - DEBUG - ${str}`;
        console.log(log);
    }

    error(obj: any) {
        const log = `${new Date().toISOString()} - ERROR - ${obj}`;
        console.error(log);
        console.error(obj);
    }
}

export const logger = new Logger();
