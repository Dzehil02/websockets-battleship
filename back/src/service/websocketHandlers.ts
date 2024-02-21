import {
    AddShips,
    AddUserToRoom,
    Attack,
    AttackAnswer,
    CreateGame,
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
import {users, roomData, roomUsers, winnersData, shipsOfPlayers} from '../store/store';
import {fillMapWithShips, getShipsOfEnemy, parseObject} from '../helpers/helpers';
import {mapWithShipsOfPlayer1, mapWithShipsOfPlayer2} from '..';
import {stringify} from 'querystring';

let indexRoom = 1;

export const getRoomUsers = (): RoomUser[] => {
    return roomUsers;
};

export const regUser = (userReceivedData: User, playerId: string): User => {
    const newUser = {
        name: userReceivedData.name,
        index: playerId,
        error: false,
        errorText: 'Registration error',
    };

    users.set(newUser.index, newUser);

    return newUser;
};

export const createRoom = (playerId: string): Room => {
    const user = users.get(playerId);
    if (user) {
        roomUsers.push({name: user.name, index: user.index});
        roomData.data.push({roomId: indexRoom.toString(), roomUsers});
    }
    indexRoom++;
    return roomData;
};

export const addUserToRoom = (addUserData: AddUserToRoom, playerId: string): void => {
    const roomNumber = parseObject(addUserData.data).indexRoom;
    const room = roomData.data.find((room) => room.roomId === roomNumber);
    const user = users.get(playerId);
    if (user && room && roomUsers.length < 2) {
        room.roomUsers.push({name: user.name, index: user.index});
    }
};

export const createGame = (dataOfRoom: RoomData[], playerId: string): CreateGame => {
    return {
        type: 'create_game',
        data: {
            idGame: dataOfRoom[0].roomId,
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

export const turn = (playerId: string): Turn => {
    return {
        type: 'turn',
        data: {
            currentPlayer: playerId,
        },
        id: '0',
    };
};

export const attack = (attack: Attack): AttackAnswer => {
    const result = checkAttack(attack);
    return result;
};

export const checkAttack = (attack: Attack): AttackAnswer => {
    const attackData = parseObject(attack.data);
    let status: Status = 'miss';
    const currentPlayer = attackData.indexPlayer;

    const enemyShips = mapWithShipsOfPlayer1.has(currentPlayer)
        ? mapWithShipsOfPlayer1.get(currentPlayer)
        : mapWithShipsOfPlayer2.get(currentPlayer);

    const key = JSON.stringify({
        x: attackData.x,
        y: attackData.y,
    });

    const goal = enemyShips?.has(key) ? enemyShips!.get(key) : undefined;
    console.log(goal);

    function checkkilled(map: Map<string, any>): Boolean {
        const values = map!.values();
        const valuesArray = Array.from(values);

        let lookForShip = valuesArray.find(
            (value) =>
                value.shipData.position.x === goal.shipData.position.x &&
                value.shipData.position.y === goal.shipData.position.y
        );
        if (lookForShip) {
            return true;
        }
        return false;
    }

    if (goal) {
        switch (goal.shipData.type) {
            case 'small':
                status = 'killed';
                break;
            case 'medium':
                let x = enemyShips?.delete(key);
                console.log(x);
                status = checkkilled(enemyShips!) ? 'shot' : 'killed';
            case 'large':
                enemyShips?.delete(key);
                status = checkkilled(enemyShips!) ? 'shot' : 'killed';
                break;
            case 'huge':
                enemyShips?.delete(key);
                status = checkkilled(enemyShips!) ? 'shot' : 'killed';
                break;
            default:
                break;
        }
    }

    return {
        type: 'attack',
        data: {
            position: {
                x: attackData.x,
                y: attackData.y,
            },
            currentPlayer: attackData.indexPlayer,
            status,
        },
        id: '0',
    };
};
