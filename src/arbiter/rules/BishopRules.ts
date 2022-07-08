import { Piece, Position, samePosition, TeamType } from "../../Constants";
import { isDiagonalMove, isEnemy, isOccupied } from "./GeneralRules";

export const bishopMove = (grabPosition: Position, dropPosition: Position, team: TeamType, boardState: Piece[]): boolean => {
    const Occupied = isOccupied(dropPosition, boardState);
    const Enemy = Occupied && isEnemy(dropPosition, boardState, team);
    
    if(isDiagonalMove(grabPosition,dropPosition)) {
        for(let i = 1; i < 8; i++) {
            let directionX = dropPosition.x > grabPosition.x ? 1 : -1;
            let directionY = dropPosition.y > grabPosition.y ? 1 : -1;
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