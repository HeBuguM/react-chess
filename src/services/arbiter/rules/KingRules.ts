import { Piece, Position, samePosition, TeamType } from "../../../models/Constants";
import { isEnemy, isOccupied } from "./GeneralRules";

export const kingMove = (grabPosition: Position, dropPosition: Position, team: TeamType, boardState: Piece[]): boolean => {
    const Occupied = isOccupied(dropPosition, boardState);
    const Enemy = Occupied && isEnemy(dropPosition, boardState, team);
    const directionX = dropPosition.x < grabPosition.x ? -1 : ( dropPosition.x > grabPosition.x ? 1 : 0);
    const directionY = dropPosition.y < grabPosition.y ? -1 : ( dropPosition.y > grabPosition.y ? 1 : 0)

    for(let i = 1; i < 2; i++) {
        let PassedPosition: Position = {x: grabPosition.x + (i*directionX), y: grabPosition.y + (i*directionY)}
        if(samePosition(PassedPosition,dropPosition) && (!Occupied || Enemy)) {
            return true;
        }
        if(isOccupied(PassedPosition, boardState)) {
            break;
        }
    }
    return false;
}