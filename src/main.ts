import logger from 'jet-logger';

import { Env } from './common/constants/env.constants.ts';
import { pingDB } from './repos/db.ts';
import server from './server.ts';

const SERVER_START_MESSAGE = `Express server started on port: ${Env.PORT}`;

async function start() {
  await pingDB();

  server.listen(Env.PORT, (err) => {
    if (!!err) {
      logger.err(err.message);
    } else {
      logger.info(SERVER_START_MESSAGE);
    }
  });
}

void start();
