import { Piece, Position, TeamType } from "../../constants/Constants";
import { isEnemy, isOccupied } from "./GeneralRules";

export const pawnMove = (grabPosition: Position, dropPosition: Position, team: TeamType, boardState: Piece[]): boolean => {
    const startRank = team === TeamType.WHITE ? 1 : 6
    const pawnDirection = team === TeamType.WHITE ? 1 : -1;
    const PrewOccupied = isOccupied({x: dropPosition.x, y: dropPosition.y-pawnDirection}, boardState);
    const Occupied = isOccupied(dropPosition, boardState);
    const Enemy = Occupied && isEnemy(dropPosition, boardState, team);
    // Move
    if(grabPosition.x === dropPosition.x && !Occupied && ((dropPosition.y - grabPosition.y  === pawnDirection) || (grabPosition.y === startRank && dropPosition.y - grabPosition.y === (2*pawnDirection) && !PrewOccupied))) {
        return true;
    }
    // Attack
    if((Math.abs(dropPosition.x - grabPosition.x) === 1) && dropPosition.y - grabPosition.y === pawnDirection && Enemy) {
        return true;
    }
    return false;
}