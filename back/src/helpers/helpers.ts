import { ClientWebsocket } from "..";
import { StartGame } from "../types/types";

export const parseObject = (obj: any) => {
    return JSON.parse(obj);
}

export const stringifyObject = (obj: any) => {
    return JSON.stringify(obj);
}

export const getShips = (shipsOfPlayers: StartGame[], playerId: string): StartGame => {
    return shipsOfPlayers.find(
        (player) => player.data.currentPlayerIndex === playerId
    ) || {} as StartGame;
}

export const getShipsOfEnemy = (shipsOfPlayers: StartGame[], playerId: string): StartGame => {
    return shipsOfPlayers.find(
        (player) => player.data.currentPlayerIndex !== playerId
    ) || {} as StartGame;
}

