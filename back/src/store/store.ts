import { Room, RoomUser, StartGame, User, Winners } from "../types/types";

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

export const users: Map<string, User> = new Map();

export const roomUsers: RoomUser[] = [];

export const shipsOfPlayers: StartGame[] = [];