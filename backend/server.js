import 'dotenv/config.js';

import http from 'http';
import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(3000, () => {
    console.log(`Server is running on port ${PORT}`);
}
);