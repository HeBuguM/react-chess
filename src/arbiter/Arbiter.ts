import { PieceType, TeamType, Piece, Position } from "../Constants";
import { pawnMove, bishopMove, kingMove, knightMove, queenMove, rookMove } from "./rules";

export default class Arbiter {

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
     
    isValidMove (grabPosition: Position, dropPosition: Position, type: PieceType, team: TeamType, boardState: Piece[]): boolean {
        let isValid = false;
        switch (type) {
            case PieceType.PAWN:
                isValid = pawnMove(grabPosition, dropPosition, team, boardState);
                break;
            case PieceType.KNIGHT:
                isValid = knightMove(grabPosition, dropPosition, team, boardState);
                break;
            case PieceType.BISHOP:
                isValid = bishopMove(grabPosition, dropPosition, team, boardState);
                break;
            case PieceType.ROOK:
                isValid = rookMove(grabPosition, dropPosition, team, boardState);
                break;
            case PieceType.QUEEN:
                isValid = queenMove(grabPosition, dropPosition, team, boardState);
                break;
            case PieceType.KING:
                isValid = kingMove(grabPosition, dropPosition, team, boardState);
                break;
        }
        return isValid;
    }
}