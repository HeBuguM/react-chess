import { PieceType, TeamType, Piece, Position, CastleRights, ArbiterDecision, MoveType, samePosition, KingCheckStatus, translatePosition } from "../../models/Constants";
import { pawnMove, bishopMove, kingMove, knightMove, queenMove, rookMove } from "./rules";
import { isEnemy, isOccupied } from "./rules/GeneralRules";

export default class Arbiter {

    isEnPassantMove(grabbedPiece: Piece, dropPosition: Position, enPassantTarget: Position | false): boolean {
        if(grabbedPiece.type === PieceType.PAWN && enPassantTarget) {
            const pawnDirection = grabbedPiece.team === TeamType.WHITE ? 1 : -1;
            if(Math.abs(dropPosition.x - grabbedPiece.position.x) === 1 && dropPosition.y - grabbedPiece.position.y === pawnDirection) {
                return dropPosition.x === enPassantTarget.x && dropPosition.y === enPassantTarget.y;
            }
        }
        return false;
    }

    isCastleMove(grabbedPiece: Piece, dropPosition: Position, boardState: Piece[], castleRights: CastleRights): boolean {
        const side = grabbedPiece.position.x-dropPosition.x < 0 ? 'king' : 'queen';
        const moved = Math.abs(grabbedPiece.position.x-dropPosition.x);
        const directionX = dropPosition.x < grabbedPiece.position.x ? -1 : ( dropPosition.x > grabbedPiece.position.x ? 1 : 0);
        const last = side === 'king' ? 3 : 4;
        if(this.kingCheckStatus(boardState)[grabbedPiece.team]) {
            return false;
        }
        // Check Path
        for(let i = 1; i < 2; i++) {
            let PassedPosition: Position = {x: grabbedPiece.position.x + (i*directionX), y: grabbedPiece.position.y}
            if(isOccupied(PassedPosition, boardState) || this.canEnemyAttack(PassedPosition, grabbedPiece.team, boardState)) {
                return false;
            }
        }
        // Check Castle
        if(grabbedPiece.type === PieceType.KING && grabbedPiece.position.y === dropPosition.y && (moved === 2 || moved === last)) {
            return castleRights[grabbedPiece.team][side];
        }
        return false;
    }

    isRegularMove(grabbedPiece: Piece, dropPosition: Position, boardState: Piece[]) {
        switch (grabbedPiece.type) {
            case PieceType.PAWN:
                return pawnMove(grabbedPiece.position, dropPosition, grabbedPiece.team, boardState);
            case PieceType.KNIGHT:
                return knightMove(grabbedPiece.position, dropPosition, grabbedPiece.team, boardState);
            case PieceType.BISHOP:
                return bishopMove(grabbedPiece.position, dropPosition, grabbedPiece.team, boardState);
            case PieceType.ROOK:
                return rookMove(grabbedPiece.position, dropPosition, grabbedPiece.team, boardState);
            case PieceType.QUEEN:
                return queenMove(grabbedPiece.position, dropPosition, grabbedPiece.team, boardState);
            case PieceType.KING:
                return kingMove(grabbedPiece.position, dropPosition, grabbedPiece.team, boardState);
            default:
                return false;
        }
    }
     
    validateMove(grabbedPiece: Piece, dropPosition: Position, boardState: Piece[], enPassantTarget: Position | false ,castleRights: CastleRights):ArbiterDecision {
        let move: ArbiterDecision = {
            valid: false,
            newBoard: [],
            castleRights: JSON.parse(JSON.stringify(castleRights)),
            enPassantTarget: enPassantTarget,
            notation: ""
        }

        const promotionRow = grabbedPiece.team === TeamType.WHITE ? 7 : 0;
        const pawnDirection = grabbedPiece.team === TeamType.WHITE ? 1 : -1;
        const castleSide = grabbedPiece.position.x-dropPosition.x < 0 ? 'king' : 'queen';
        const enemyTeam = grabbedPiece.team === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;

        if(grabbedPiece.type === PieceType.PAWN && this.isEnPassantMove(grabbedPiece, dropPosition, enPassantTarget)) {
            move.type = MoveType.EN_PASSANT;
            move.valid = true;
            move.capture = true;
            move.enPassantTarget = false;
            move.capturedPiece = 'pawn'
            move.newBoard = boardState.reduce((results,piece) => {
                if(samePosition(piece.position, grabbedPiece.position)) {
                    results.push({...piece, position: dropPosition});
                } else if (!samePosition(piece.position,  {x: dropPosition.x, y: dropPosition.y - pawnDirection})) {
                    results.push(piece);
                }
                return results;
            }, [] as Piece[]);
        } else if(grabbedPiece.type === PieceType.KING && castleRights && this.isCastleMove(grabbedPiece,dropPosition, boardState,castleRights)) {
            move.type = MoveType.CASTLE;
            move.valid = true;
            move.capture = false;
            move.enPassantTarget = false;
            move.castleRights[grabbedPiece.team].king = false;
            move.castleRights[grabbedPiece.team].queen = false;
            move.newBoard = boardState.reduce((results,piece) => {
                if(samePosition(piece.position, grabbedPiece.position)) {
                    results.push({...piece,position: {...piece.position,x: (castleSide === 'king' ? piece.position.x+2 : piece.position.x-2)}});
                } else if (piece.type === PieceType.ROOK && piece.team === grabbedPiece.team && piece.position.x === (castleSide === 'king' ? 7 : 0)) {
                    results.push({...piece,position: {...piece.position,x: (castleSide === 'king' ? piece.position.x-2 : piece.position.x+3)}});
                } else {
                    results.push(piece);
                }
                return results;
            }, [] as Piece[]);
        } else {
            move.type = MoveType.REGULAR;
            move.valid = this.isRegularMove(grabbedPiece, dropPosition, boardState);
            move.capture = isOccupied(dropPosition, boardState) && isEnemy(dropPosition, boardState, grabbedPiece.team);
            move.newBoard = boardState.reduce((results,piece) => {
                if(samePosition(piece.position, grabbedPiece.position)) {                            
                    if(piece.type === PieceType.PAWN && dropPosition.y === promotionRow) {
                        move.promotionPawn = {...piece, position: dropPosition};
                    }
                    if(piece.type === PieceType.KING) {
                        move.castleRights[piece.team].king = false;
                        move.castleRights[piece.team].queen = false;
                    }
                    if(piece.type === PieceType.ROOK) {
                        if(grabbedPiece.position.x === 7) {
                            move.castleRights[piece.team].king = false;
                        }
                        if(grabbedPiece.position.x === 0) {
                            move.castleRights[piece.team].queen = false;
                        }
                    }
                    move.enPassantTarget = piece.type === PieceType.PAWN && Math.abs(grabbedPiece.position.y - dropPosition.y) === 2 ? {x: dropPosition.x, y: dropPosition.y-pawnDirection} : false;
                    results.push({...piece, position: dropPosition});
                } else if (!samePosition(piece.position,  dropPosition)) {
                    results.push(piece);
                } else if (samePosition(piece.position,  dropPosition)) {
                    move.capturedPiece = piece.type;
                    if(piece.type === PieceType.ROOK) {
                        if(dropPosition.x === 7) {
                            move.castleRights[piece.team].king = false;
                        }
                        if(dropPosition.x === 0) {
                            move.castleRights[piece.team].queen = false;
                        }
                    }
                }
                return results;
            }, [] as Piece[]);
        }

        // Check
        let checkStatus = this.kingCheckStatus(move.newBoard);
        move.valid = checkStatus[grabbedPiece.team] ? false : move.valid;
        move.check = checkStatus[enemyTeam];
        // Notation
        move.notation = this.generateNotation(grabbedPiece,dropPosition,boardState,enPassantTarget,move);
        return move;
    }

    getLegalMoves(checkPiece: Piece, boardState: Piece[], enPassantTarget: Position | false ,castleRights: CastleRights) {
        const legalMoves = [];
        if(checkPiece) {
            for(let j = 7; j >= 0; j--) {
                for(let i = 0; i <= 7; i++) {
                    const checkPosition: Position = {x: i, y: j}
                    if(!samePosition(checkPiece.position,checkPosition)) {
                        const moveValidation = this.validateMove(checkPiece, checkPosition, boardState, enPassantTarget, castleRights);
                        if(moveValidation.valid) {
                            legalMoves.push(translatePosition(checkPosition));
                        }
                    }
                }
            }
        }
        return legalMoves;
    }

    kingCheckStatus(boardPieces: Piece[]) {
        let checkStatus: KingCheckStatus = {
            white: false,
            black: false
        }
        
        let white_king = boardPieces.find(p => p.type === PieceType.KING && p.team === TeamType.WHITE);
        if(white_king && white_king.type) {
            let black_pieces = boardPieces.filter(p => p.team === TeamType.BLACK);
            for (const piece of black_pieces) {
                if(this.isRegularMove(piece,white_king.position,boardPieces)) {
                    checkStatus.white = true;
                    break;
                }
            }
        }

        let black_king = boardPieces.find(p => p.type === PieceType.KING && p.team === TeamType.BLACK);
        if(black_king) {
            let white_pieces = boardPieces.filter(p => p.team === TeamType.WHITE);
            for (const piece of white_pieces) {
                if(this.isRegularMove(piece,black_king.position,boardPieces)) {
                    checkStatus.black = true;
                    break;
                }
            }
        }
        return checkStatus;
    }

    generateNotation(grabbedPiece: Piece, dropPosition: Position, boardPieces: Piece[], enPassantTarget: Position | false, move: ArbiterDecision) {
        let coordinates = translatePosition(dropPosition);
        let check_sign = move.check ? "+" : "";
        let capture = move.capture ? "x" : "";
        let piece = "";

        if(move.type === MoveType.CASTLE) {
            return grabbedPiece.position.x-dropPosition.x < 0 ? 'O-O' : 'O-O-O' + check_sign;
        } else {
            if(grabbedPiece.type === PieceType.PAWN) {
                if(move.capture) {
                    piece = translatePosition(grabbedPiece.position,"x");
                }
            } else {
                piece = grabbedPiece.type === PieceType.KNIGHT ? grabbedPiece.type.substring(1,2).toLocaleUpperCase() : grabbedPiece.type.substring(0,1).toLocaleUpperCase();
                if(grabbedPiece.type === PieceType.KNIGHT || grabbedPiece.type === PieceType.ROOK) {
                    let other_piece = boardPieces.find(p => p.type === grabbedPiece.type && p.team === grabbedPiece.team && !samePosition(p.position, grabbedPiece.position));
                    if(other_piece && this.isRegularMove(other_piece,dropPosition,boardPieces)) {
                        piece = piece + (grabbedPiece.position.x !== other_piece.position.x ? translatePosition(grabbedPiece.position,"x") : translatePosition(grabbedPiece.position,"y"));
                    }
                }
            }
            return piece+capture+coordinates+check_sign;
        }
    }

    canEnemyAttack(targetPosition: Position, team: TeamType, boardPieces: Piece[]) {
        switch (team) {
            case 'white':
                let black_pieces = boardPieces.filter(p => p.team === TeamType.BLACK);
                for (const piece of black_pieces) {
                    if(this.isRegularMove(piece,targetPosition,boardPieces)) {
                        return true;
                    }
                }
                break;
            case 'black':
                let white_pieces = boardPieces.filter(p => p.team === TeamType.WHITE);
                for (const piece of white_pieces) {
                    if(this.isRegularMove(piece,targetPosition,boardPieces)) {
                        return true;
                    }
                }
                break;
        }
        return false;
    }
}