import { always, curryN, tap, uncurryN, unless, } from 'ramda';

const log = uncurryN(2, (identity: string) =>
  unless(
    always(import.meta.env.PROD), 
    curryN(2, console.info)(`--------------------- [${identity}]`)
  )
);

const tapLog = (identity: string) => tap(log(identity));

export { log, tapLog };
