import {v1 as uuidv1} from 'uuid';
import {v4 as uuidv4} from 'uuid';
import {AddUserToRoom, CreateGame, Room, RoomData, User} from '../types/types';
import {users, roomData, roomUsers, winnersData} from '../store/store';
import {parseObject} from '../helpers/helpers';

// export const createIndexRoom = () => uuidv1();
// export const createIndexUser = () => uuidv4();

let indexRoom = 0;
let indexUser = 0;

export const getUsers = (): User[] => {
    return roomUsers;
};

export const regUser = (userReceivedData: User): User => {
    const newUser = {
        name: userReceivedData.name,
        index: indexUser.toString(),
        error: false,
        errorText: '',
    };

    users.set(newUser.index, newUser);
    indexUser++;

    return newUser;
};

export const createRoom = (): Room => {
    const user = users.get((indexUser - 1).toString());
    if (user) {
        roomUsers.push({name: user.name, index: user.index});
        roomData.data.push({roomId: indexRoom.toString(), roomUsers});
    }
    console.log(`users from createRoom ${users.size}`);
    indexRoom++;
    return roomData;
};

export const addUserToRoom = (addUserData: AddUserToRoom): void => {
    const roomNumber = parseObject(addUserData.data).indexRoom;
    const room = roomData.data.find((room) => room.roomId === roomNumber);
    const user = users.get((indexUser - 1).toString());
    if (user && room && roomUsers.length < 2) {
        room.roomUsers.push({name: user.name, index: user.index});
    }
    console.log('5 ' + JSON.stringify(roomData));
};

export const createGame = (dataOfRoom: RoomData[]): CreateGame => {
    return {
        type: 'create_game',
        data: {
            idGame: dataOfRoom[0].roomId,
            idPlayer: dataOfRoom[0].roomUsers[1].index!,
        },
        id: '0',
    }
};

