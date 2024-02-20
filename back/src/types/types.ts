export type BuildMode = 'production' | 'development';

export interface BuildEnv {
    mode: BuildMode;
}

export type MessageType =
    | 'reg'
    | 'create_room'
    | 'create_game'
    | 'update_room'
    | 'update_winners'
    | 'add_user_to_room'
    | 'add_ships'
    | 'start_game'
    | 'attack'
    | 'randomAttack'
    | 'turn'
    | 'finish';

export interface User {
    name: string;
    password?: string;
    index?: string;
    error?: boolean;
    errorText?: string;
}

export interface RoomUser {
    name: string;
    index: string | undefined;
}

export interface RoomData {
    roomId: string;
    roomUsers: RoomUser[];
}

export interface Room {
    type: MessageType;
    data: RoomData[];
    id: string;
}

interface WinnersData {
    name: string;
    wins: number;
}

export interface Winners {
    type: MessageType;
    data: WinnersData[];
    id: string;
}

export interface AddUserToRoom {
    type: MessageType;
    data: {
        indexRoom: string;
    };
    id: string;
}

export interface CreateGame {
    type?: MessageType;
    data?: {
        idGame: string;
        idPlayer: string;
    };
    id?: string;
}

interface Ship {
    position: {
        x: number;
        y: number;
    };
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
}

export interface StartGame {
    type: MessageType;
    data: {
        ships: Ship[];
        currentPlayerIndex: string;
    };
    id: string;
}

export interface AddShips {
    type: MessageType;
    data: {
        gameId: string;
        ships: Ship[];
        indexPlayer: string;
    };
    id: string;
}

export interface Turn {
    type: MessageType;
    data: {
        currentPlayer: string;
    };
    id: string;
}
