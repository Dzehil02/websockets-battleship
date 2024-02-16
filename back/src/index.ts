import {WebSocketServer} from 'ws';
import dotenv from 'dotenv';

dotenv.config();
const PORT = parseInt(process.env.PORT!) || 3000;

const wss = new WebSocketServer({port: PORT});

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
    console.log(`Server is running on port ${PORT}`);
});
