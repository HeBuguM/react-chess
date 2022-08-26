import { Piece, Position, samePosition, TeamType } from "../../constants/Constants";

export const isOccupied = (dropPosition: Position, boardState: Piece[]): boolean => {
    const piece = boardState.find(p => samePosition(p.position,dropPosition));
    return piece ? true : false;
}

export const isEnemy = (dropPosition: Position, boardState: Piece[], team: TeamType): boolean => {
    const piece = boardState.find(p => samePosition(p.position,dropPosition) && p.team !== team);
    return piece ? true : false;
}

export const isDiagonalMove = (grabPosition: Position, dropPosition: Position): boolean => {
    return Math.abs(grabPosition.x-dropPosition.x) - Math.abs(grabPosition.y-dropPosition.y) === 0 ? true : false;
}