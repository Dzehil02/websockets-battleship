import WebSocket, {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import {winnersData, roomData, shipsOfGame, arrayOfMapWithShipsOfPlayer} from './store/store';
import {
    createRoom,
    regUser,
    addUserToRoom,
    createGame,
    addShipsForPlayer,
    turn,
    attack,
    addEnemyShips,
} from './service/websocketHandlers';
import {parseObject, stringifyObject} from './helpers/helpers';
import {CreateGame, StartGame, Turn} from './types/types';

export interface ClientWebsocket extends WebSocket {
    playerId: number;
}

dotenv.config();
const PORT = parseInt(process.env.PORT!) || 3000;

const wss = new WebSocketServer({port: PORT});

let indexPlayer = 1;
let currentTurn: Turn;

wss.on('connection', function connection(ws: ClientWebsocket) {
    console.log(`Server is running on ws://localhost:${PORT}/`);

    ws.on('error', console.error);

    ws.playerId = indexPlayer;
    indexPlayer++;

    let mapWithShipsOfPlayer: Map<string, Map<string, any>> = new Map();
    mapWithShipsOfPlayer.set(ws.playerId.toString(), new Map());
    arrayOfMapWithShipsOfPlayer.push(mapWithShipsOfPlayer);

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
                    const room = roomData.data.findIndex((room) => room.roomId === parseObject(dataObj.data).indexRoom);
                    wss.clients.forEach((client) => {
                        const newGame: CreateGame = createGame(
                            dataObj,
                            roomData.data,
                            (client as ClientWebsocket).playerId
                        );
                        client.send(stringifyObject({...roomData, data: stringifyObject(roomData.data)}));
                        client.send(stringifyObject({...newGame, data: stringifyObject(newGame.data)}));
                        client.send(stringifyObject({...roomData.data, data: stringifyObject([])}));
                    });
                    roomData.data.splice(room, 1);
                }
                break;
            case 'add_ships':
                console.log('Game started');

                const shipsOfCurrentPlayer = addShipsForPlayer(dataObj);
                const gameId = parseObject(dataObj.data).gameId;

                let shipsInMap = shipsOfGame.get(gameId);

                if (!shipsInMap) {
                    let shipsInMap = [];
                    shipsInMap.push(shipsOfCurrentPlayer);
                    shipsOfGame.set(gameId, shipsInMap);
                } else {
                    shipsOfGame.set(gameId, [...shipsInMap, shipsOfCurrentPlayer]);
                }

                let sizeOfGameBoard = shipsOfGame.get(gameId)?.length;

                if (sizeOfGameBoard! > 1 && sizeOfGameBoard! % 2 === 0) {
                    let currentGameShips = shipsOfGame.get(gameId)?.slice(-2);

                    addEnemyShips(currentGameShips!);

                    currentTurn = turn(ws.playerId);
                    wss.clients.forEach((client) => {
                        const currentGame = currentGameShips?.find(
                            (game: StartGame) => game.data.currentPlayerIndex === (client as ClientWebsocket).playerId
                        );
                        if (currentGame && client.readyState === WebSocket.OPEN) {
                            const shipsOfClient = currentGame;
                            client.send(
                                stringifyObject({...shipsOfClient, data: stringifyObject(shipsOfClient!.data)})
                            );
                            client.send(stringifyObject({...currentTurn, data: stringifyObject(currentTurn.data)}));
                        }
                    });
                }
                break;

            case 'attack':
                if (currentTurn.data.currentPlayer === ws.playerId) {
                    const enemyShips = mapWithShipsOfPlayer.get(ws.playerId.toString());

                    const currentAttack = attack(dataObj, enemyShips!.get(ws.playerId.toString())!);
                    const gameId = parseObject(dataObj.data).gameId;
                    let currentGameShips = shipsOfGame.get(gameId)?.slice(-2);
                    const firstPlayer = currentTurn.data.currentPlayer.toString();
                    const secondPlayer = currentGameShips?.find((game: StartGame) => game.data.currentPlayerIndex !== +firstPlayer);

                    if (currentAttack.length === 0) {
                        return;
                    }

                    let currentPlayer = firstPlayer;
                    let secondPlayerIndex = secondPlayer ? secondPlayer.data.currentPlayerIndex.toString() : '';

                    if (currentAttack[0].data.status === 'miss') {
                        currentPlayer = currentPlayer === firstPlayer ? secondPlayerIndex : firstPlayer;
                    }

                    currentTurn = turn(+currentPlayer);

                    wss.clients.forEach((client) => {
                        currentAttack.forEach((attack) => {
                            client.send(stringifyObject({...attack, data: stringifyObject(attack!.data)}));
                        });
                        client.send(stringifyObject({...currentTurn, data: stringifyObject(currentTurn.data)}));
                    });
                }
                break;
            default:
                break;
        }
    });
});
