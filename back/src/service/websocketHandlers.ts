import {
    AddShips,
    AddUserToRoom,
    Attack,
    AttackAnswer,
    CreateGame,
    Finish,
    Position,
    Room,
    RoomData,
    RoomUser,
    Ship,
    StartGame,
    Status,
    Turn,
    User,
} from '../types/types';
import {users, roomData, winnersData} from '../store/store';
import {fillMapWithShips, parseObject} from '../helpers/helpers';
import {stringify} from 'querystring';

let indexRoom = 1;

export const regUser = (userReceivedData: User, playerId: number): User => {
    const newUser = {
        name: userReceivedData.name,
        index: playerId,
        error: false,
        errorText: 'Registration error',
    };

    users.set(newUser.index, newUser);

    return newUser;
};

export const createRoom = (playerId: number): Room => {
    const user = users.get(playerId);
    if (user) {
        const roomUsers: RoomUser[] = [];
        roomUsers.push({name: user.name, index: user.index});
        roomData.data.push({roomId: indexRoom.toString(), roomUsers});
    }
    indexRoom++;
    return roomData;
};

export const addUserToRoom = (addUserData: AddUserToRoom, playerId: number): void => {
    const roomNumber = parseObject(addUserData.data).indexRoom;
    const room = roomData.data.find((room) => room.roomId === roomNumber);
    const user = users.get(playerId);
    if (user && room && room.roomUsers.length < 2) {
        room.roomUsers.push({name: user.name, index: user.index});
    }
};

export const createGame = (addUserData: AddUserToRoom, dataOfRoom: RoomData[], playerId: number): CreateGame => {
    const roomNumber = parseObject(addUserData.data).indexRoom;
    return {
        type: 'create_game',
        data: {
            idGame: roomNumber,
            idPlayer: playerId,
        },
        id: '0',
    };
};

export const addShipsForPlayer = (dataOfGame: AddShips): StartGame => {
    return {
        type: 'start_game',
        data: {
            ships: parseObject(dataOfGame.data).ships,
            currentPlayerIndex: parseObject(dataOfGame.data).indexPlayer,
        },
        id: '0',
    };
};

export const turn = (playerId: number): Turn => {
    return {
        type: 'turn',
        data: {
            currentPlayer: playerId,
        },
        id: '0',
    };
};

// export const attack = (attack: Attack): AttackAnswer[] => {
//     const result = checkAttack(attack);
//     return result;
// };

// export const finishGame = (currentPlayer: string): Finish => {
//     return {
//         type: 'finish',
//         data: {
//             winPlayer: currentPlayer,
//         },
//         id: '0',
//     };
// };

// function checkkilled(map: Map<string, any>, goal: {shipData: Ship}): Boolean {
//     const values = map!.values();
//     const valuesArray = Array.from(values);

//     let lookForShip = valuesArray.find(
//         (value) =>
//             value.shipData.position.x === goal.shipData.position.x &&
//             value.shipData.position.y === goal.shipData.position.y
//     );
//     if (lookForShip) {
//         return true;
//     }
//     return false;
// }

// function addResult(resultArray: AttackAnswer[], attack: AttackAnswer, goalData: Ship, status: Status): AttackAnswer[] {
//     console.log('addResult function');
//     const {position, direction, length} = goalData;
//     let x = position.x;
//     let y = position.y;

//     if (status === 'killed') {
//         for (let i = 0; i < length; i++) {
//             const attackData = {
//                 ...attack,
//                 data: {
//                     ...attack.data,
//                     position: {
//                         x,
//                         y,
//                     },
//                     status,
//                 },
//             };

//             if (direction) {
//                 y++;
//             } else {
//                 x++;
//             }

//             resultArray.push(attackData);
//         }

//         for (let i = -1; i <= 1; i++) {
//             for (let j = -1; j <= length; j++) {
//                 const x = direction ? position.x + i : position.x + j;
//                 const y = direction ? position.y + j : position.y + i;

//                 const attackData = {
//                     ...attack,
//                     data: {
//                         ...attack.data,
//                         position: {
//                             x,
//                             y,
//                         },
//                         status: 'miss' as Status,
//                     },
//                 };

//                 const isAvailable = resultArray.find(
//                     (value) => value.data.position.x === x && value.data.position.y === y
//                 );

//                 if (!isAvailable) {
//                     if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
//                         resultArray.push(attackData);
//                     }
//                 }
//             }
//         }
//     } else {
//         let attackData = {
//             ...attack,
//             data: {
//                 ...attack.data,
//                 status: status,
//             },
//         };
//         resultArray.push(attackData);
//     }
//     return resultArray;
// }

// export const checkAttack = (attack: Attack): AttackAnswer[] => {
//     const attackData = parseObject(attack.data);
//     let status: Status = 'miss';
//     const currentPlayer = attackData.indexPlayer;

//     const currentAttack: AttackAnswer = {
//         type: 'attack',
//         data: {
//             position: {
//                 x: attackData.x,
//                 y: attackData.y,
//             },
//             currentPlayer: attackData.indexPlayer,
//             status,
//         },
//         id: '0',
//     };

//     let result: AttackAnswer[] = [];

//     const enemyShips = mapWithShipsOfPlayer1.has(currentPlayer)
//         ? mapWithShipsOfPlayer1.get(currentPlayer)
//         : mapWithShipsOfPlayer2.get(currentPlayer);

//     const key = JSON.stringify({
//         x: attackData.x,
//         y: attackData.y,
//     });

//     const goal = enemyShips?.has(key) ? enemyShips!.get(key) : undefined;
//     console.log(goal);

//     if (goal) {
//         switch (goal.shipData.type) {
//             case 'small':
//                 enemyShips?.delete(key);
//                 status = 'killed';
//                 result = addResult(result, currentAttack, goal.shipData, status);
//                 break;
//             case 'medium':
//                 enemyShips?.delete(key);
//                 status = checkkilled(enemyShips!, goal) ? 'shot' : 'killed';
//                 result = addResult(result, currentAttack, goal.shipData, status);
//                 break;
//             case 'large':
//                 enemyShips?.delete(key);
//                 status = checkkilled(enemyShips!, goal) ? 'shot' : 'killed';
//                 result = addResult(result, currentAttack, goal.shipData, status);
//                 break;
//             case 'huge':
//                 enemyShips?.delete(key);
//                 status = checkkilled(enemyShips!, goal) ? 'shot' : 'killed';
//                 result = addResult(result, currentAttack, goal.shipData, status);
//                 break;
//             default:
//                 break;
//         }
//     } else {
//         result.push(currentAttack);
//     }

//     console.log('array with results: ');
//     console.log(result);
//     return result;
// };
