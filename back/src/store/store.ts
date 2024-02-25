import {Room, StartGame, User, Winners} from '../types/types';

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

export const users: Map<number, User> = new Map();
export const shipsOfGame: Map<number, StartGame[]> = new Map();
export const arrayOfMapWithShipsOfPlayer: Map<string, Map<string, any>>[] = [];
