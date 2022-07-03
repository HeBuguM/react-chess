import { PieceType, TeamType, Piece, Position, samePosition } from "../Constants";

export default class Referee {

    isOccupied(dropPosition: Position, boardState: Piece[]): boolean {
        const piece = boardState.find(p => samePosition(p.position,dropPosition));
        return piece ? true : false;
    }

    isEnemy(dropPosition: Position, boardState: Piece[], team: TeamType): boolean {
        const piece = boardState.find(p => samePosition(p.position,dropPosition) && p.team !== team);
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
        const isOccupied = this.isOccupied(dropPosition, boardState);
        const isEnemy = isOccupied && this.isEnemy(dropPosition, boardState, team); 

        // PAWN
        if(type === PieceType.PAWN) {
            const firstMove = team === TeamType.WHITE ? 1 : 6
            const pawnDirection = team === TeamType.WHITE ? 1 : -1;
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
        // KNIGHT
        if(type === PieceType.KNIGHT) {
            if(((Math.abs(grabPosition.x-dropPosition.x) === 1 && Math.abs(grabPosition.y-dropPosition.y)  === 2) || (Math.abs(grabPosition.x-dropPosition.x) === 2 && Math.abs(grabPosition.y-dropPosition.y)  === 1)) && (!isOccupied || isEnemy)) {
                return true;
            }
        }
        // BISHOP
        if(type === PieceType.BISHOP) {
            // Diagonal Move -> Math.abs(grabPosition.x-dropPosition.x) - Math.abs(grabPosition.y-dropPosition.y) === 0
            for(let i = 1; i < 8; i++) {
                // Top Right
                if(dropPosition.x > grabPosition.x && dropPosition.y > grabPosition.y) {
                    let PassedPosition: Position = {x: grabPosition.x + i, y: grabPosition.y + i}
                    if(samePosition(PassedPosition,dropPosition) && (!isOccupied || isEnemy)) {
                        return true;
                    }
                    if(this.isOccupied(PassedPosition, boardState)) {
                        break;
                    }
                }

                // Bottom Right
                if(dropPosition.x > grabPosition.x && dropPosition.y < grabPosition.y) {
                    let PassedPosition: Position = {x: grabPosition.x + i, y: grabPosition.y - i}
                    if(samePosition(PassedPosition,dropPosition) && (!isOccupied || isEnemy)) {
                        return true;
                    }
                    if(this.isOccupied(PassedPosition, boardState)) {
                        break;
                    }
                }

                // Bottom Left
                if(dropPosition.x < grabPosition.x && dropPosition.y < grabPosition.y) {
                    let PassedPosition: Position = {x: grabPosition.x - i, y: grabPosition.y - i}
                    if(samePosition(PassedPosition,dropPosition) && (!isOccupied || isEnemy)) {
                        return true;
                    }
                    if(this.isOccupied(PassedPosition, boardState)) {
                        break;
                    }
                }

                // Top Left
                if(dropPosition.x < grabPosition.x && dropPosition.y > grabPosition.y) {
                    let PassedPosition: Position = {x: grabPosition.x - i, y: grabPosition.y + i}
                    if(samePosition(PassedPosition,dropPosition) && (!isOccupied || isEnemy)) {
                        return true;
                    }
                    if(this.isOccupied(PassedPosition, boardState)) {
                        break;
                    }
                }
            }
        }
        return false;
    }
}