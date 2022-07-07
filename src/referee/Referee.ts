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

    isEnPassantMove(grabPosition: Position, dropPosition: Position, type: PieceType, team: TeamType, boardState: Piece[]): boolean {
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

    isDiagonalMove(grabPosition: Position, dropPosition: Position): boolean {
        return Math.abs(grabPosition.x-dropPosition.x) - Math.abs(grabPosition.y-dropPosition.y) === 0 ? true : false;
    }

    pawnMove(grabPosition: Position, dropPosition: Position, team: TeamType, boardState: Piece[], isOccupied: boolean, isEnemy: boolean): boolean {
        const firstMove = team === TeamType.WHITE ? 1 : 6
        const pawnDirection = team === TeamType.WHITE ? 1 : -1;
        // Move
        if(grabPosition.x === dropPosition.x && ((dropPosition.y - grabPosition.y  === pawnDirection && !isOccupied) || (grabPosition.y === firstMove && dropPosition.y - grabPosition.y === (2*pawnDirection) && !this.isOccupied({x: dropPosition.x, y: dropPosition.y-pawnDirection}, boardState)))) {
            if(!isOccupied) {
                return true;
            }
        }
        // Attack
        if((Math.abs(dropPosition.x - grabPosition.x) === 1) && dropPosition.y - grabPosition.y === pawnDirection && isEnemy) {
            return true;
        }
        return false;
    }
    
    knightMove(grabPosition: Position, dropPosition: Position, isOccupied: boolean, isEnemy: boolean): boolean {
        if(((Math.abs(grabPosition.x-dropPosition.x) === 1 && Math.abs(grabPosition.y-dropPosition.y)  === 2) || (Math.abs(grabPosition.x-dropPosition.x) === 2 && Math.abs(grabPosition.y-dropPosition.y)  === 1)) && (!isOccupied || isEnemy)) {
            return true;
        }
        return false;
    }

    bishopMove(grabPosition: Position, dropPosition: Position, boardState: Piece[], isOccupied: boolean, isEnemy: boolean): boolean {
        if(this.isDiagonalMove(grabPosition,dropPosition)) {
            for(let i = 1; i < 8; i++) {
                let directionX = dropPosition.x > grabPosition.x ? 1 : -1;
                let directionY = dropPosition.y > grabPosition.y ? 1 : -1;
                let PassedPosition: Position = {x: grabPosition.x + (i*directionX), y: grabPosition.y + (i*directionY)}
                if(samePosition(PassedPosition,dropPosition) && (!isOccupied || isEnemy)) {
                    return true;
                }
                if(this.isOccupied(PassedPosition, boardState)) {
                    break;
                }
            }
        }
        return false;
    }

    rookMove(grabPosition: Position, dropPosition: Position, boardState: Piece[], isOccupied: boolean, isEnemy: boolean): boolean {
        if(!this.isDiagonalMove(grabPosition,dropPosition)) {    
            let directionX = grabPosition.x !== dropPosition.x ? (grabPosition.x < dropPosition.x ? 1 : -1) : 0;
            let directionY = grabPosition.x === dropPosition.x ? (grabPosition.y < dropPosition.y ? 1 : -1) : 0;
            for(let i = 1; i < 8; i++) {
                let PassedPosition: Position = {x: grabPosition.x + (i*directionX), y: grabPosition.y + (i*directionY)}
                if(samePosition(PassedPosition,dropPosition) && (!isOccupied || isEnemy)) {
                    return true;
                }
                if(this.isOccupied(PassedPosition, boardState)) {
                    break;
                }
            }
        }
        return false;
    }

    queenMove(grabPosition: Position, dropPosition: Position, boardState: Piece[], isOccupied: boolean, isEnemy: boolean): boolean {
        let directionX = grabPosition.x > dropPosition.x ? -1 : (grabPosition.x < dropPosition.x ? 1 : 0);
        let directionY = grabPosition.y > dropPosition.y ? -1 : (grabPosition.y < dropPosition.y ? 1 : 0);
        for(let i = 1; i < 8; i++) {
            let PassedPosition: Position = {x: grabPosition.x + (i*directionX), y: grabPosition.y + (i*directionY)}
            if(samePosition(PassedPosition,dropPosition) && (!isOccupied || isEnemy)) {
                return true;
            }
            if(this.isOccupied(PassedPosition, boardState)) {
                break;
            }
        }
        return false;
    }

    kingMove(grabPosition: Position, dropPosition: Position, isOccupied: boolean, isEnemy: boolean): boolean {
        let movedSquares = this.isDiagonalMove(grabPosition,dropPosition) ? Math.abs(grabPosition.x-dropPosition.x) : Math.abs((grabPosition.x-dropPosition.x)+(grabPosition.y-dropPosition.y));
        if(movedSquares === 1 && (!isOccupied || isEnemy)) {
            return true;
        }
        return false;
    }

     
    isValidMove (grabPosition: Position, dropPosition: Position, type: PieceType, team: TeamType, boardState: Piece[]): boolean {
        const isOccupied = this.isOccupied(dropPosition, boardState);
        const isEnemy = isOccupied && this.isEnemy(dropPosition, boardState, team);
        let isValid = false;
        switch (type) {
            case PieceType.PAWN:
                isValid = this.pawnMove(grabPosition, dropPosition, team, boardState, isOccupied, isEnemy);
                break;
            case PieceType.KNIGHT:
                isValid = this.knightMove(grabPosition, dropPosition, isOccupied, isEnemy);
                break;
            case PieceType.BISHOP:
                isValid = this.bishopMove(grabPosition, dropPosition, boardState, isOccupied, isEnemy);
                break;
            case PieceType.ROOK:
                isValid = this.rookMove(grabPosition, dropPosition, boardState, isOccupied, isEnemy);
                break;
            case PieceType.QUEEN:
                isValid = this.queenMove(grabPosition, dropPosition, boardState, isOccupied, isEnemy);
                break;
            case PieceType.KING:
                isValid = this.kingMove(grabPosition, dropPosition, isOccupied, isEnemy);
                break;
        }
        return isValid;
    }
}