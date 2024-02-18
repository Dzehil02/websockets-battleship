import WebSocket, {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import {winnersData, roomData} from './store/store';
import {createRoom, regUser, addUserToRoom, createGame} from './service/websocketHandlers';
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

        wss.clients.forEach((client) => {
            switch (dataObj.type) {
                case 'reg':
                    if (client === ws && client.readyState === WebSocket.OPEN) {
                        const userReceivedData = parseObject(dataObj.data);
                        const userSendData = regUser(userReceivedData);
                        dataObj.data = stringifyObject(userSendData);
                        client.send(stringifyObject(dataObj));
                    }
                    client.send(stringifyObject({...roomData, data: stringifyObject(roomData.data)}));
                    client.send(stringifyObject({...winnersData, data: stringifyObject(winnersData.data)}));
                    break;
                case 'create_room':
                    if (client === ws && client.readyState === WebSocket.OPEN) {
                        const room = createRoom();
                        client.send(stringifyObject({...roomData, data: stringifyObject(room.data)}));
                    }
                    break;
                case 'add_user_to_room':
                    if (client.readyState === WebSocket.OPEN) {
                        addUserToRoom(dataObj);
                        client.send(stringifyObject({...roomData, data: stringifyObject(roomData.data)}));
                        const newGame = createGame(roomData.data);
                        client.send(stringifyObject({...newGame, data: stringifyObject(newGame.data)}));
                        console.log(stringifyObject(newGame));
                    }
                    console.log(stringifyObject(roomData))
                    break;
                case 'create_game':
                    console.log('Game started');
                    console.log(dataObj);
                    break;

                default:
                    break;
            }
        });
    });
});
