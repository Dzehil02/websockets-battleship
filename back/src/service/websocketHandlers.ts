import {
    AddShips,
    AddUserToRoom,
    Attack,
    AttackAnswer,
    CreateGame,
    Room,
    RoomData,
    RoomUser,
    StartGame,
    Status,
    Turn,
    User,
} from '../types/types';
import {users, roomData, roomUsers, winnersData} from '../store/store';
import {getShipsOfEnemy, parseObject} from '../helpers/helpers';

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

export const attack = (attack: Attack, shipsOfPlayers: StartGame[]): AttackAnswer => {
    const result = checkAttack(attack, shipsOfPlayers);
    return result;
};

export const checkAttack = (attack: Attack, shipsOfPlayers: StartGame[]): AttackAnswer => {
    const attackData = parseObject(attack.data);
    let status: Status = 'miss';
    const currentPlayer = attackData.indexPlayer;
    const shipsOfEnemy = shipsOfPlayers.filter((ship) => ship.data.currentPlayerIndex !== currentPlayer);

    const goal = shipsOfEnemy[0].data.ships.find(
            (ship) => ship.position.x === attackData.x && ship.position.y === attackData.y
        )

    if (goal) {
        switch (goal.type) {
            case 'small':
                status = 'killed';
                break;
            case 'medium':
                
                break;
            case 'large':
                
                break;
            case 'huge':
                
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
