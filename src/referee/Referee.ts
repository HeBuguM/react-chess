import { PieceType, TeamType, Piece } from "../components/Chessboard/Chessboard";

export default class Referee {

    isOccupied(dropX:number, dropY:number, boardState: Piece[]): boolean {
        const piece = boardState.find(p => p.x === dropX && p.y === dropY);
        return piece ? true : false;
    }

    isEnemy(dropX:number, dropY:number, boardState: Piece[], team: TeamType): boolean {
        const piece = boardState.find(p => p.x === dropX && p.y === dropY && p.team !== team);
        return piece ? true : false;
    }

    isEnPassantMove(grabX:number , grabY:number, dropX:number, dropY:number, type: PieceType, team: TeamType, boardState: Piece[]) {
        if(type === PieceType.PAWN) {
            const pawnDirection = team === TeamType.WHITE ? 1 : -1;
            if((dropX - grabX === 1 || dropX - grabX === -1) && dropY - grabY === pawnDirection) {
                const piece = boardState.find(p => p.x === dropX && p.y === dropY - pawnDirection && p.enPassantEnabled)
                if(piece) {
                    return true;
                }
            }
        }
        return false;
    }
     
    isValidMove (grabX:number , grabY:number, dropX:number, dropY:number, type: PieceType, team: TeamType, boardState: Piece[]) {
        if(type === PieceType.PAWN) {
            const firstMove = team === TeamType.WHITE ? 1 : 6
            const pawnDirection = team === TeamType.WHITE ? 1 : -1;
            const isOccupied = this.isOccupied(dropX, dropY, boardState);
            const isEnemy = isOccupied && this.isEnemy(dropX, dropY, boardState, team); 
            // Move
            if(grabX === dropX && ((dropY - grabY  === pawnDirection && !isOccupied) || (grabY === firstMove && dropY - grabY === 2*pawnDirection && !this.isOccupied(dropX, dropY-(pawnDirection), boardState)))) {
                if(!isOccupied) {
                    return true;
                }
            }
            // Attack
            if((dropX - grabX === 1 || dropX - grabX === -1) && dropY - grabY === pawnDirection && isEnemy) {
                return true;
            }
        }
        return false;
    }
}