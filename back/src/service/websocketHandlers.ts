import {v1 as uuidv1} from 'uuid';
import {v4 as uuidv4} from 'uuid';
import {Room, User} from '../types/types';
import {userData, roomData, roomUsers, winnersData} from '../store/store';

export const createIndexRoom = () => uuidv1();
export const createIndexUser = () => uuidv4();

export const regUser = (userReceivedData: User): User => {
    userData.name = userReceivedData.name;
    userData.index = createIndexUser();
    return userData;
};

export const createRoom = (): Room => {
    roomData.data.push({roomId: createIndexRoom(), roomUsers});
    return roomData;
};
