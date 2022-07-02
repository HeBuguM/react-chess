import { PieceType, TeamType, Piece, Position } from "../Constants";

export default class Referee {

    isOccupied(dropPosition: Position, boardState: Piece[]): boolean {
        const piece = boardState.find(p => p.position.x === dropPosition.x && p.position.y === dropPosition.y);
        return piece ? true : false;
    }

    isEnemy(dropPosition: Position, boardState: Piece[], team: TeamType): boolean {
        const piece = boardState.find(p => p.position.x === dropPosition.x && p.position.y === dropPosition.y && p.team !== team);
        return piece ? true : false;
    }

    isEnPassantMove(grabPosition: Position, dropPosition: Position, type: PieceType, team: TeamType, boardState: Piece[]) {
        if(type === PieceType.PAWN) {
            const pawnDirection = team === TeamType.WHITE ? 1 : -1;
            if((dropPosition.x - grabPosition.x === 1 || dropPosition.x - grabPosition.x === -1) && dropPosition.y - grabPosition.y === pawnDirection) {
                const piece = boardState.find(p => p.position.x === dropPosition.x && p.position.y === dropPosition.y - pawnDirection && p.enPassantEnabled)
                if(piece) {
                    return true;
                }
            }
        }
        return false;
    }
     
    isValidMove (grabPosition: Position, dropPosition: Position, type: PieceType, team: TeamType, boardState: Piece[]) {
        if(type === PieceType.PAWN) {
            const firstMove = team === TeamType.WHITE ? 1 : 6
            const pawnDirection = team === TeamType.WHITE ? 1 : -1;
            const isOccupied = this.isOccupied(dropPosition, boardState);
            const isEnemy = isOccupied && this.isEnemy(dropPosition, boardState, team); 
            // Move
            if(grabPosition.x === dropPosition.x && ((dropPosition.y - grabPosition.y  === pawnDirection && !isOccupied) || (grabPosition.y === firstMove && dropPosition.y - grabPosition.y === 2*pawnDirection && !this.isOccupied({x: dropPosition.x, y: dropPosition.y-pawnDirection}, boardState)))) {
                if(!isOccupied) {
                    return true;
                }
            }
            // Attack
            if((dropPosition.x - grabPosition.x === 1 || dropPosition.x - grabPosition.x === -1) && dropPosition.y - grabPosition.y === pawnDirection && isEnemy) {
                return true;
            }
        }
        return false;
    }
}