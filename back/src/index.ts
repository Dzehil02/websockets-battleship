import WebSocket, {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import {winnersData, roomData, shipsOfGame} from './store/store';
import {
    createRoom,
    regUser,
    addUserToRoom,
    createGame,
    addShipsForPlayer,
    // attack,
    turn,
    // checkAttack,
} from './service/websocketHandlers';
import {fillMapWithShips, parseObject, stringifyObject} from './helpers/helpers';
import {CreateGame, Position, StartGame, Turn, User} from './types/types';

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
                    console.log(roomData.data[room]);
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
                    console.log(roomData.data);
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

                console.log(shipsOfGame);

                let sizeOfGameBoard = shipsOfGame.get(gameId)?.length;

                if (sizeOfGameBoard! > 1 && sizeOfGameBoard! % 2 === 0) {
                    let currentGameShips = shipsOfGame.get(gameId)?.slice(-2);
                    currentTurn = turn(ws.playerId);
                    wss.clients.forEach((client) => {
                        const currentGame = currentGameShips
                            ?.find(
                                (game: StartGame) =>
                                    game.data.currentPlayerIndex === (client as ClientWebsocket).playerId
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

            // case 'attack':
            //     if (currentTurn.data.currentPlayer === ws.playerId) {
            //         const currentAttack = attack(dataObj);

            //         if (currentAttack.length === 0) {
            //             return;
            //         }

            //         let currentPlayer = currentAttack[0].data.currentPlayer;

            //         const firstPlayer = currentPlayer;

            //         const secondPlayer = shipsOfPlayers.filter(
            //             (player) => player.data.currentPlayerIndex !== currentPlayer
            //         )[0].data.currentPlayerIndex;

            //         if (currentAttack[0].data.status === 'miss') {
            //             currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
            //         }

            //         currentTurn = turn(currentPlayer);

            //         wss.clients.forEach((client) => {
            //             currentAttack.forEach((attack) => {
            //                 client.send(stringifyObject({...attack, data: stringifyObject(attack!.data)}));
            //             });
            //             client.send(stringifyObject({...currentTurn, data: stringifyObject(currentTurn.data)}));
            //         });
            //     }
            //     break;
            default:
                break;
        }
    });
});
