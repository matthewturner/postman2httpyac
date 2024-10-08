import { Logger, ILogObj, IMeta } from 'tslog';
import chalk = require('chalk');

export const rootLogger = new Logger<ILogObj>({ type: 'hidden' });

rootLogger.attachTransport((logObj: ILogObj) => {
    const meta = <IMeta>logObj._meta;
    switch (meta.logLevelId) {
        case 0:
            console.log(chalk.whiteBright(logObj[0]));
            break;
        case 3:
            console.log('');
            console.log(chalk.blueBright(logObj[0]));
            break;
        case 4:
            console.log('');
            console.log(chalk.yellowBright(logObj[0]));
            break;
        default:
            console.log(logObj[0]);
            break;
    }
});

