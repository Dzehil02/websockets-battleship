import { stringify } from "querystring";
import { ClientWebsocket } from "..";
import { Position, Ship, StartGame } from "../types/types";

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

export function fillMapWithShips(ships: Ship[]) {
    const gameMap: Map<string, any> = new Map();
    ships.forEach(ship => {
        const { position, direction, type, length } = ship;
        let x = position.x;
        let y = position.y;

        for (let i = 0; i < length; i++) {
            const cellData = {
                shipData: {
                    position,
                    direction,
                    type,
                    length
                }
            };

            gameMap.set(JSON.stringify({ x, y }), cellData);

            if (direction) {
                y++;
            } else {
                x++;
            }
        }
    });
    return gameMap;
}
