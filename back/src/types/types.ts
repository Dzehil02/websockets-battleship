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
    index?: number;
    error?: boolean;
    errorText?: string;
}

export interface RoomUser {
    name: string;
    index?: number;
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
        indexRoom: number;
    };
    id: string;
}

export interface CreateGame {
    type: MessageType;
    data: {
        idGame: string;
        idPlayer: number;
    };
    id: string;
}

export interface Ship {
    position: {
        x: number;
        y: number;
    };
    direction: boolean;
    length: number;
    type: 'small' | 'medium' | 'large' | 'huge';
}

export interface Position {
    x: number;
    y: number;
}

export interface StartGame {
    type: MessageType;
    data: {
        ships: Ship[];
        currentPlayerIndex: number;
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
        currentPlayer: number;
    };
    id: string;
}

export type Status = 'miss' | 'killed' | 'shot';

export interface AttackAnswer {
    type: MessageType;
    data: {
        position: {
            x: number;
            y: number;
        };
        currentPlayer: string;
        status: Status;
    };
    id: string;
}

export interface Attack {
    type: MessageType;
    data: {gameId: string; x: number; y: number; indexPlayer: number};
    id: string;
}

export interface RandomAttack {
    type: MessageType;
    data: {
        gameId: string;
        indexPlayer: number;
    };
    id: string;
}

export interface Finish {
    type: MessageType;
    data: {
        winPlayer: number;
    };
    id: string;
}
