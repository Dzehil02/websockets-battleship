import WebSocket, {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import {winnersData, roomData, shipsOfPlayers} from './store/store';
import {
    createRoom,
    regUser,
    addUserToRoom,
    createGame,
    addShipsForPlayer,
    attack,
    turn,
    checkAttack,
} from './service/websocketHandlers';
import {fillMapWithShips, getShips, parseObject, stringifyObject} from './helpers/helpers';
import {CreateGame, Position, StartGame, Turn} from './types/types';

export interface ClientWebsocket extends WebSocket {
    playerId: string;
}

dotenv.config();
const PORT = parseInt(process.env.PORT!) || 3000;

const wss = new WebSocketServer({port: PORT});

let indexPlayer = 1;
let currentTurn: Turn;

export let mapWithShipsOfPlayer1: Map<string, Map<string, any>>;
export let mapWithShipsOfPlayer2: Map<string, Map<string, any>>;

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
                    wss.clients.forEach((client) => {
                        const newGame: CreateGame = createGame(roomData.data, (client as ClientWebsocket).playerId);
                        client.send(stringifyObject({...roomData, data: stringifyObject(roomData.data)}));
                        client.send(stringifyObject({...newGame, data: stringifyObject(newGame.data)}));
                        client.send(stringifyObject({...roomData, data: stringifyObject([])}));
                    });
                    roomData.data = [];
                    console.log(stringifyObject(roomData));
                }
                break;
            case 'add_ships':
                console.log('Game started');
                const shipsOfCurrentPlayer = addShipsForPlayer(dataObj);
                shipsOfPlayers.push(shipsOfCurrentPlayer);

                if (shipsOfPlayers.length === 2) {
                    currentTurn = turn(ws.playerId);

                    mapWithShipsOfPlayer1 = new Map();
                    mapWithShipsOfPlayer2 = new Map();

                    mapWithShipsOfPlayer1.set(shipsOfPlayers[0].data.currentPlayerIndex, fillMapWithShips(shipsOfPlayers[1].data.ships));
                    mapWithShipsOfPlayer2.set(shipsOfPlayers[1].data.currentPlayerIndex, fillMapWithShips(shipsOfPlayers[0].data.ships));

                    console.log('Full Boards: ')
                    console.log(mapWithShipsOfPlayer1);
                    console.log(mapWithShipsOfPlayer2);

                    wss.clients.forEach((client) => {
                        const shipsOfClient = getShips(shipsOfPlayers, (client as ClientWebsocket).playerId);
                        client.send(stringifyObject({...shipsOfClient, data: stringifyObject(shipsOfClient!.data)}));
                        client.send(stringifyObject({...currentTurn, data: stringifyObject(currentTurn.data)}));
                    });
                }
                break;
            case 'attack':
                if (currentTurn.data.currentPlayer === ws.playerId) {
                    const currentAttack = attack(dataObj);
                    let currentPlayer = currentAttack[0].data.currentPlayer;
                    const firstPlayer = currentPlayer;
                    const secondPlayer = shipsOfPlayers.filter(
                            (player) => player.data.currentPlayerIndex !== currentPlayer
                        )[0].data.currentPlayerIndex;
                        
                        if (currentAttack[0].data.status === 'miss') {
                                currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
                            }
                            
                            currentTurn = turn(currentPlayer);
                            
                            // console.log(currentAttack);
                            // console.log(currentTurn);
                            
                           
                    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ?????????????????????????
                    // let currentPlayer = ws.playerId;
                    // const arr = [
                    //     {
                    //         type: 'attack',
                    //         data: {
                    //             position: {
                    //                 x: 3,
                    //                 y: 3,
                    //             },
                    //             currentPlayer,
                    //             status: 'miss',
                    //         },
                    //         id: '0',
                    //     },
                    //     {
                    //         type: 'attack',
                    //         data: {
                    //             position: {
                    //                 x: 2,
                    //                 y: 2,
                    //             },
                    //             currentPlayer,
                    //             status: 'miss',
                    //         },
                    //         id: '0',
                    //     },
                    //     {
                    //         type: 'attack',
                    //         data: {
                    //             position: {
                    //                 x: 2,
                    //                 y: 3,
                    //             },
                    //             currentPlayer,
                    //             status: 'miss',
                    //         },
                    //         id: '0',
                    //     },
                    // ];
                    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ?????????????????????????

                    wss.clients.forEach((client) => {
                        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ?????????????????????????
                        // arr.forEach((currentAttack) => {
                        //     client.send(
                        //         stringifyObject({...currentAttack, data: stringifyObject(currentAttack!.data)})
                        //     );
                        // });
                        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ?????????????????????????

                        currentAttack.forEach((attack) => {
                            client.send(
                                stringifyObject({...attack, data: stringifyObject(attack!.data)})
                            )
                        })
                        client.send(stringifyObject({...currentTurn, data: stringifyObject(currentTurn.data)}));

                        // client.send(stringifyObject({...currentAttack, data: stringifyObject(currentAttack!.data)}));
                    });
                }
                break;
            default:
                break;
        }
    });
});
