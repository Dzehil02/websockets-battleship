import {AddShips, AddUserToRoom, CreateGame, Room, RoomData, StartGame, Turn, User} from '../types/types';
import {users, roomData, roomUsers, winnersData} from '../store/store';
import {parseObject} from '../helpers/helpers';

let indexRoom = 1;

export const getUsers = (): User[] => {
    return roomUsers;
};

export const regUser = (userReceivedData: User, playerId: string): User => {
    const newUser = {
        name: userReceivedData.name,
        index: playerId,
        error: false,
        errorText: '',
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

export const turn = (dataOfGame: StartGame): Turn => {
    return {
        type: 'turn',
        data: {
            currentPlayer: dataOfGame.data.currentPlayerIndex,
        },
        id: '0',
    };
};

export const attack = (position: any, playerId: string): void => {
    console.log(parseObject(position.data), playerId);
};
