import { Room, RoomUser, User, Winners } from "../types/types";

const id = '0';

export const roomData: Room = {
    type: 'update_room',
    data: [],
    id,
};

export const winnersData: Winners = {
    type: 'update_winners',
    data: [],
    id,
};

export const userData: User = {
    name: '',
    index: '',
    error: false,
    errorText: 'Error text from reg',
};

export const roomUsers: RoomUser[] = [];