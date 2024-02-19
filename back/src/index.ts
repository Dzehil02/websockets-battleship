import WebSocket, {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import {winnersData, roomData} from './store/store';
import {createRoom, regUser, addUserToRoom, createGame, addShipsForPlayer, attack} from './service/websocketHandlers';
import {parseObject, stringifyObject} from './helpers/helpers';
import {CreateGame, StartGame} from './types/types';

interface ClientWebsocket extends WebSocket {
    playerId: string;
}

dotenv.config();
const PORT = parseInt(process.env.PORT!) || 3000;

const wss = new WebSocketServer({port: PORT});

let indexPlayer = 1;
const shipsOfPlayers: StartGame[] = [];

wss.on('connection', function connection(ws: ClientWebsocket) {
    console.log(`Server is running on port ${PORT}`);

    ws.on('error', console.error);

    ws.playerId = indexPlayer.toString();
    indexPlayer++;

    ws.on('message', function message(data) {
        console.log('received: %s', data);

        const dataObj = parseObject(data.toString());

        switch (dataObj.type) {
            case 'reg':
                if (ws === ws && ws.readyState === WebSocket.OPEN) {
                    const userReceivedData = parseObject(dataObj.data);
                    const userSendData = regUser(userReceivedData, ws.playerId);
                    dataObj.data = stringifyObject(userSendData);
                    ws.send(stringifyObject(dataObj));
                }
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(stringifyObject({...roomData, data: stringifyObject(roomData.data)}));
                        client.send(stringifyObject({...winnersData, data: stringifyObject(winnersData.data)}));
                    }
                });
                break;
            case 'create_room':
                if (ws.readyState === WebSocket.OPEN) {
                    const room = createRoom(ws.playerId);
                    ws.send(stringifyObject({...roomData, data: stringifyObject(room.data)}));
                }
                break;
            case 'add_user_to_room':
                if (ws.readyState === WebSocket.OPEN) {
                    addUserToRoom(dataObj, ws.playerId);
                    const newGame: CreateGame = createGame(roomData.data, ws.playerId);
                    wss.clients.forEach((client) => {
                        client.send(stringifyObject({...roomData, data: stringifyObject(roomData.data)}));
                        client.send(stringifyObject({...newGame, data: stringifyObject(newGame.data)}));
                        client.send(stringifyObject({...roomData, data: stringifyObject([])}));
                    });
                }
                break;
            case 'add_ships':
                console.log('Game started');
                const shipsOfCurrentPlayer = addShipsForPlayer(dataObj, ws.playerId);
                shipsOfPlayers.push(shipsOfCurrentPlayer);

                if (shipsOfPlayers.length === 2) {
                    wss.clients.forEach((client) => {
                        const shipsOfClient = shipsOfPlayers.find(
                            (player) => player.data.currentPlayerIndex === (client as ClientWebsocket).playerId
                        );
                        client.send(stringifyObject({...shipsOfClient, data: stringifyObject(shipsOfClient!.data)}));
                    });
                }
                break;
            case 'attack':
                attack(dataObj, ws.playerId);
                break;
            default:
                break;
        }
    });
});
