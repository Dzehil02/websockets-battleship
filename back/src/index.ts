import {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import {userData, winnersData, roomData, roomUsers} from './store/store';
import {createRoom, regUser} from './service/websocketHandlers';
import {parseObject, stringifyObject} from './helpers/helpers';

dotenv.config();
const PORT = parseInt(process.env.PORT!) || 3000;

const wss = new WebSocketServer({port: PORT});

wss.on('connection', function connection(ws) {
    console.log(`Server is running on port ${PORT}`);

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);

        const dataObj = parseObject(data.toString());

        switch (dataObj.type) {
            case 'reg':
                const userReceivedData = parseObject(dataObj.data);
                const userSendData = regUser(userReceivedData);
                dataObj.data = stringifyObject(userSendData);
                ws.send(stringifyObject(dataObj));
                ws.send(stringifyObject({...roomData, data: stringifyObject(roomData.data)}));
                ws.send(stringifyObject({...winnersData, data: stringifyObject(winnersData.data)}));
                break;
            case 'create_room':
                const room = createRoom();
                ws.send(stringifyObject({...room, data: stringifyObject(roomData.data)}));
                break;

            default:
                break;
        }
    });
});
