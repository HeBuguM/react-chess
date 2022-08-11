import { PieceType, TeamType, Piece, Position, CastleRights } from "../Constants";
import { pawnMove, bishopMove, kingMove, knightMove, queenMove, rookMove } from "./rules";
import { isOccupied } from "./rules/GeneralRules";

export default class Arbiter {

    isEnPassantMove(grabPosition: Position, dropPosition: Position, grabbedPiece: Piece, enPassantTarget: Position | false): boolean {
        if(grabbedPiece.type === PieceType.PAWN && enPassantTarget) {
            const pawnDirection = grabbedPiece.team === TeamType.WHITE ? 1 : -1;
            if(Math.abs(dropPosition.x - grabPosition.x) === 1 && dropPosition.y - grabPosition.y === pawnDirection) {
                return dropPosition.x === enPassantTarget.x && dropPosition.y === enPassantTarget.y;
            }
        }
        return false;
    }

    isCastleMove(grabPosition: Position, dropPosition: Position, grabbedPiece: Piece, boardState: Piece[], castleRights: CastleRights): boolean {
        const side = grabPosition.x-dropPosition.x < 0 ? 'king' : 'queen';
        const moved = Math.abs(grabPosition.x-dropPosition.x);
        const directionX = dropPosition.x < grabPosition.x ? -1 : ( dropPosition.x > grabPosition.x ? 1 : 0);
        const last = side === 'king' ? 3 : 4;
        if(this.kingCheckStatus(boardState)[grabbedPiece.team]) {
            return false;
        }
        // Check Path
        for(let i = 1; i < last; i++) {
            let PassedPosition: Position = {x: grabPosition.x + (i*directionX), y: grabPosition.y}
            if(isOccupied(PassedPosition, boardState) || this.canEnemyAttack(PassedPosition, grabbedPiece.team, boardState)) {
                return false;
            }
        }
        // Check Castle
        if(grabbedPiece.type === PieceType.KING && grabPosition.y === dropPosition.y && (moved === 2 || moved === last)) {
            return castleRights[grabbedPiece.team][side];
        }
        return false;
    }
     
    isValidMove (grabPosition: Position, dropPosition: Position, grabbedPiece: Piece, boardState: Piece[]): boolean {
        let isValid = false;
        switch (grabbedPiece.type) {
            case PieceType.PAWN:
                isValid = pawnMove(grabPosition, dropPosition, grabbedPiece.team, boardState);
                break;
            case PieceType.KNIGHT:
                isValid = knightMove(grabPosition, dropPosition, grabbedPiece.team, boardState);
                break;
            case PieceType.BISHOP:
                isValid = bishopMove(grabPosition, dropPosition, grabbedPiece.team, boardState);
                break;
            case PieceType.ROOK:
                isValid = rookMove(grabPosition, dropPosition, grabbedPiece.team, boardState);
                break;
            case PieceType.QUEEN:
                isValid = queenMove(grabPosition, dropPosition, grabbedPiece.team, boardState);
                break;
            case PieceType.KING:
                isValid = kingMove(grabPosition, dropPosition, grabbedPiece.team, boardState);
                break;
        }
        return isValid;
    }

    kingCheckStatus(boardPieces: Piece[]) {
        let checkStatus = {
            'white': false,
            'black': false
        }
        
        let white_king = boardPieces.find(p => p.type === PieceType.KING && p.team === TeamType.WHITE);
        if(white_king && white_king.type) {
            let black_pieces = boardPieces.filter(p => p.team === TeamType.BLACK);
            for (const piece of black_pieces) {
                if(this.isValidMove(piece.position,white_king.position,piece,boardPieces)) {
                    checkStatus.white = true;
                    break;
                }
            }
        }

        let black_king = boardPieces.find(p => p.type === PieceType.KING && p.team === TeamType.BLACK);
        if(black_king) {
            let white_pieces = boardPieces.filter(p => p.team === TeamType.WHITE);
            for (const piece of white_pieces) {
                if(this.isValidMove(piece.position,black_king.position,piece,boardPieces)) {
                    checkStatus.black = true;
                    break;
                }
            }
        }
        return checkStatus;
    }

    canEnemyAttack(targetPosition: Position, team: TeamType, boardPieces: Piece[]) {
        switch (team) {
            case 'white':
                let black_pieces = boardPieces.filter(p => p.team === TeamType.BLACK);
                for (const piece of black_pieces) {
                    if(this.isValidMove(piece.position,targetPosition,piece,boardPieces)) {
                        return true;
                    }
                }
                break;
            case 'black':
                let white_pieces = boardPieces.filter(p => p.team === TeamType.WHITE);
                for (const piece of white_pieces) {
                    if(this.isValidMove(piece.position,targetPosition,piece,boardPieces)) {
                        return true;
                    }
                }
                break;
        }
        return false;
    }
}