import { Piece, Position, samePosition, TeamType } from "../../../models/Constants";
import { isDiagonalMove, isEnemy, isOccupied } from "./GeneralRules";

export const rookMove = (grabPosition: Position, dropPosition: Position, team: TeamType, boardState: Piece[]): boolean => {
    const Occupied = isOccupied(dropPosition, boardState);
    const Enemy = Occupied && isEnemy(dropPosition, boardState, team);

    if(!isDiagonalMove(grabPosition,dropPosition)) {    
        let directionX = grabPosition.x !== dropPosition.x ? (grabPosition.x < dropPosition.x ? 1 : -1) : 0;
        let directionY = grabPosition.x === dropPosition.x ? (grabPosition.y < dropPosition.y ? 1 : -1) : 0;
        for(let i = 1; i < 8; i++) {
            let PassedPosition: Position = {x: grabPosition.x + (i*directionX), y: grabPosition.y + (i*directionY)}
            if(samePosition(PassedPosition,dropPosition) && (!Occupied || Enemy)) {
                return true;
            }
            if(isOccupied(PassedPosition, boardState)) {
                break;
            }
        }
    }
    return false;
}