import { useRef, useState } from "react";
import Square from "../Squere/Square";
import "./Chessboard.css";
import Referee from "../../referee/Referee";

const horizontalAxis = ["a","b","c","d","e","f","g","h"];
const verticalAxis = ["1","2","3","4","5","6","7","8"];

export interface Piece {
    image: string;
    x: number;
    y: number;
    type: PieceType;
    team: TeamType;
}

export enum PieceType {
    PAWN,
    BISHOP,
    KNIGHT,
    ROOK,
    QUEEN,
    KING
}

export enum TeamType {
    BLACK,
    WHITE
}

// Init Board Pieces
const initialBoardPieces: Piece[] = [];
for (let p = 0; p < 2; p++) {
    const type = p === 0 ? "b" : "w";
    const team = p === 0 ? TeamType.BLACK : TeamType.WHITE;
    const y = p === 0 ? 7 : 0;
    initialBoardPieces.push({image: `assets/images/rook_${type}.png`, x: 0, y: y, type: PieceType.ROOK, team: team})
    initialBoardPieces.push({image: `assets/images/rook_${type}.png`, x: 7, y: y, type: PieceType.ROOK, team: team})
    initialBoardPieces.push({image: `assets/images/knight_${type}.png`, x: 1, y: y, type: PieceType.KNIGHT, team: team})
    initialBoardPieces.push({image: `assets/images/knight_${type}.png`, x: 6, y: y, type: PieceType.KNIGHT, team: team})
    initialBoardPieces.push({image: `assets/images/bishop_${type}.png`, x: 2, y: y, type: PieceType.BISHOP, team: team})
    initialBoardPieces.push({image: `assets/images/bishop_${type}.png`, x: 5, y: y, type: PieceType.BISHOP, team: team})
    initialBoardPieces.push({image: `assets/images/queen_${type}.png`, x: 3, y: y, type: PieceType.QUEEN, team: team})
    initialBoardPieces.push({image: `assets/images/king_${type}.png`, x: 4, y: y, type: PieceType.KING, team: team})
}
for (let p = 0; p < 8; p++) {
    initialBoardPieces.push({image: 'assets/images/pawn_b.png', x:p, y:6, type: PieceType.PAWN, team: TeamType.BLACK})
    initialBoardPieces.push({image: 'assets/images/pawn_w.png', x:p, y:1, type: PieceType.PAWN, team: TeamType.WHITE})
}

export default function Chessboard() {
    const referee = new Referee();
    const [activePiece,setActivePiece] = useState<HTMLElement | null>(null)
    const [grabX,setGrabX] = useState(0);
    const [grabY,setGrabY] = useState(0);
    const [pieces, setPieces] = useState<Piece[]>(initialBoardPieces)
    const chessboardRef = useRef<HTMLDivElement>(null);

    function grabPiece(e: React.MouseEvent) {
        let element = e.target as HTMLElement;
        const chessboard = chessboardRef.current;
        if(element.classList.contains("chess-piece") && chessboard) {
            setGrabX(Math.floor((e.clientX - chessboard.offsetLeft) / 100));
            setGrabY(Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100)));
            const x = e.clientX - 50;
            const y = e.clientY - 50;
            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            setActivePiece(element);
        }
    }

    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if(activePiece && chessboard) {
            const minX = chessboard.offsetLeft - 50;
            const minY = chessboard.offsetTop - 50;
            const maxX = chessboard.offsetLeft + chessboard.clientWidth - 50;
            const maxY = chessboard.offsetTop + chessboard.clientHeight - 50;
            const x = e.clientX - 50;
            const y = e.clientY - 50;
            activePiece.style.position = "absolute";
            activePiece.style.left = x < minX ? `${minX}px` : (x > maxX ? `${maxX}px` : `${x}px`)
            activePiece.style.top = y < minY ? `${minY}px` : (y > maxY ? `${maxY}px` : `${y}px`)
        }
    } 

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if(activePiece && chessboard) {
            const dropX = Math.floor((e.clientX - chessboard.offsetLeft) / 100);
            const dropY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100));
    
            // Update Piece possition
            setPieces((boardState) => {
                const pieces = boardState.map((p) => {
                    if(p.x === grabX && p.y === grabY) {
                        const validMode = referee.isValidMove(grabX, grabY, dropX, dropY,p.type, p.team, boardState);
                        if(validMode) {
                            p.x = dropX;
                            p.y = dropY;
                        } else {
                            activePiece.style.position = "relative";
                            activePiece.style.removeProperty("top");
                            activePiece.style.removeProperty("left");
                        }
                    }
                    return p;
                });
                return pieces;
            })
            setActivePiece(null);
        }
    }

    let board = [];
    let horizontalLabels = [];
    let verticalLabels = [];

    for(let l = 0; l < 8; l++) {
        horizontalLabels.push(<div key={`h${l}`}>{horizontalAxis[l]}</div>)
        verticalLabels.push(<div key={`v${l}`}>{verticalAxis[l]}</div>)
    }

    for(let j = horizontalAxis.length - 1; j >= 0; j--) {
        for(let i = 0; i < verticalAxis.length; i++) {
            const square = i + j + 2;
            let coordinates = horizontalAxis[i]+verticalAxis[j];
            let image = undefined;
            pieces.forEach( p => {
                if(p.x === i && p.y === j) {
                    image = p.image
                }
            })
            board.push(<Square key={`${i},${j}`} coordinates={coordinates} number={square} image={image} />)
        }
    }

    return (
        <div 
            id="chessboard"
            ref={chessboardRef}
            onMouseMove={e => movePiece(e)}
            onMouseDown={e => grabPiece(e)}
            onMouseUp={e => dropPiece(e)}
        >
            {board}
            <div className="horizontalLabels">{horizontalLabels}</div>
            <div className="verticalLabels">{verticalLabels}</div>
        </div>
    );
}