export const HORIZONTAL_AXIS = ["a","b","c","d","e","f","g","h"];
export const VERTICAL_AXIS = ["1","2","3","4","5","6","7","8"];
export const SQUARE_SIZE = 100;

export function samePosition(p1: Position, p2: Position) {
    return p1.x === p2.x && p1.y === p2.y
}

export interface Position {
    x: number;
    y: number;
}
export interface Piece {
    position: Position,
    type: PieceType;
    team: TeamType;
    enPassantEnabled?: boolean;
}

export interface CastleRights {
    black: {
        king: boolean
        queen: boolean
    };
    white: {
        king: boolean
        queen: boolean
    };
}

export enum PieceType {
    PAWN='pawn',
    BISHOP='bishop',
    KNIGHT='knight',
    ROOK='rook',
    QUEEN='queen',
    KING='king'
}

export enum TeamType {
    BLACK='black',
    WHITE='white'
}

// Init Board Pieces
export const initialBoardPieces: Piece[] = [];
for (let p = 0; p < 2; p++) {
    const team = p === 0 ? TeamType.BLACK : TeamType.WHITE;
    const y = p === 0 ? 7 : 0;
    initialBoardPieces.push({position: { x: 0, y: y}, type: PieceType.ROOK, team: team });
    initialBoardPieces.push({position: { x: 7, y: y}, type: PieceType.ROOK, team: team});
    initialBoardPieces.push({position: { x: 1, y: y}, type: PieceType.KNIGHT, team: team});
    initialBoardPieces.push({position: { x: 6, y: y}, type: PieceType.KNIGHT, team: team});
    initialBoardPieces.push({position: { x: 2, y: y}, type: PieceType.BISHOP, team: team});
    initialBoardPieces.push({position: { x: 5, y: y}, type: PieceType.BISHOP, team: team});
    initialBoardPieces.push({position: { x: 3, y: y}, type: PieceType.QUEEN, team: team});
    initialBoardPieces.push({position: { x: 4, y: y}, type: PieceType.KING, team: team});
}
for (let p = 0; p < 8; p++) {
    initialBoardPieces.push({position: { x:p, y:1 }, type: PieceType.PAWN, team: TeamType.WHITE});
    initialBoardPieces.push({position: { x:p, y:6 }, type: PieceType.PAWN, team: TeamType.BLACK});
}