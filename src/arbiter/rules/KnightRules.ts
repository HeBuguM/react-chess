import { Piece, Position, TeamType } from "../../Constants";
import { isEnemy, isOccupied } from "./GeneralRules";

export const knightMove = (grabPosition: Position, dropPosition: Position, team: TeamType, boardState: Piece[]): boolean => {
    const Occupied = isOccupied(dropPosition, boardState);
    const Enemy = Occupied && isEnemy(dropPosition, boardState, team);
    if(((Math.abs(grabPosition.x-dropPosition.x) === 1 && Math.abs(grabPosition.y-dropPosition.y)  === 2) || (Math.abs(grabPosition.x-dropPosition.x) === 2 && Math.abs(grabPosition.y-dropPosition.y)  === 1)) && (!Occupied || Enemy)) {
        return true;
    }
    return false;
}