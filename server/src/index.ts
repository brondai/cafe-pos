import { createApp } from './app.js';
import { env } from './env.js';

const app = createApp();

app.listen(env.SERVER_PORT, () => {
  console.log(`Cafe POS API listening on http://localhost:${env.SERVER_PORT}`);
});
