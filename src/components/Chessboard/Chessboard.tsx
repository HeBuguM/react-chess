import { useRef, useState } from "react";
import Square from "../Squere/Square";
import "./Chessboard.css";
import Referee from "../../referee/Referee";
import { HORIZONTAL_AXIS, VERTICAL_AXIS, SQUARE_SIZE, samePosition, Piece, PieceType, TeamType, initialBoardPieces, Position} from "../../Constants";

export default function Chessboard() {
    const referee = new Referee();
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null)
    const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 })
    const [pieces, setPieces] = useState<Piece[]>(initialBoardPieces)
    const chessboardRef = useRef<HTMLDivElement>(null);

    function grabPiece(e: React.MouseEvent) {
        let element = e.target as HTMLElement;
        const chessboard = chessboardRef.current;
        if(element.classList.contains("chess-piece") && chessboard) {
            setGrabPosition({
                x: Math.floor((e.clientX - chessboard.offsetLeft) / SQUARE_SIZE),
                y: Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - (SQUARE_SIZE*8)) / SQUARE_SIZE))}
            );
            const x = e.clientX - (SQUARE_SIZE/2);
            const y = e.clientY - (SQUARE_SIZE/2);
            element.style.position = "absolute";
            element.style.zIndex = "100";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            setActivePiece(element);
        }
    }

    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if(activePiece && chessboard) {
            const minX = chessboard.offsetLeft - (SQUARE_SIZE/2);
            const minY = chessboard.offsetTop - (SQUARE_SIZE/2);
            const maxX = chessboard.offsetLeft + chessboard.clientWidth - (SQUARE_SIZE/2);
            const maxY = chessboard.offsetTop + chessboard.clientHeight - (SQUARE_SIZE/2);
            const x = e.clientX - (SQUARE_SIZE/2);
            const y = e.clientY - (SQUARE_SIZE/2);
            activePiece.style.position = "absolute";
            activePiece.style.left = x < minX ? `${minX}px` : (x > maxX ? `${maxX}px` : `${x}px`)
            activePiece.style.top = y < minY ? `${minY}px` : (y > maxY ? `${maxY}px` : `${y}px`)
        }
    } 

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if(activePiece && chessboard) {
            const dropX = Math.floor((e.clientX - chessboard.offsetLeft) / SQUARE_SIZE);
            const dropY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - (SQUARE_SIZE*8)) / SQUARE_SIZE));
            const currentPiece = pieces.find(p => p.position.x === grabPosition.x && p.position.y === grabPosition.y);

            if(currentPiece) {
                const pawnDirection = currentPiece.team === TeamType.WHITE ? 1 : -1;
                const enPassantMove = referee.isEnPassantMove(grabPosition, {x: dropX, y: dropY},currentPiece.type, currentPiece.team, pieces);
                const validMode = referee.isValidMove(grabPosition, {x: dropX, y: dropY},currentPiece.type, currentPiece.team, pieces);
                if(enPassantMove) {
                    const updatedPieces = pieces.reduce((results,piece) => {
                        if(samePosition(piece.position, grabPosition)) {
                            piece.position.x = dropX;
                            piece.position.y = dropY;
                            piece.enPassantEnabled = Math.abs(grabPosition.y - dropY) === 2 && piece.type === PieceType.PAWN;
                            results.push(piece);
                        } else if (!samePosition(piece.position,  {x: dropX, y: dropY - pawnDirection})) {
                            piece.enPassantEnabled = false;
                            results.push(piece);
                        }
                        return results;
                    }, [] as Piece[]);
                    setPieces(updatedPieces);
                } else if(validMode) {
                    // Update Piece
                    const updatedPieces = pieces.reduce((results,piece) => {
                        if(samePosition(piece.position, grabPosition)) {
                            piece.position.x = dropX;
                            piece.position.y = dropY;
                            piece.enPassantEnabled = Math.abs(grabPosition.y - dropY) === 2 && piece.type === PieceType.PAWN;
                            results.push(piece);
                        } else if (!samePosition(piece.position,  {x: dropX, y: dropY})) {
                            piece.enPassantEnabled = false;
                            results.push(piece);
                        }
                        return results;
                    }, [] as Piece[]);
                    setPieces(updatedPieces);
                } else {
                    // Reset Piece
                    activePiece.style.removeProperty("position");
                    activePiece.style.removeProperty("top");
                    activePiece.style.removeProperty("z-index");
                    activePiece.style.removeProperty("left");
                }
            }
            setActivePiece(null);
        }
    }

    // Render Board
    let board = [];
    for(let j = HORIZONTAL_AXIS.length - 1; j >= 0; j--) {
        for(let i = 0; i < VERTICAL_AXIS.length; i++) {
            const square = i + j + 2;
            const piece = pieces.find(p => samePosition(p.position, {x: i, y: j}))
            let coordinates = HORIZONTAL_AXIS[i]+VERTICAL_AXIS[j];
            let image = piece ? piece.image : undefined;
            board.push(<Square key={`${i},${j}`} coordinates={coordinates} number={square} image={image} />)
        }
    }

    // Render Board Labels
    let horizontalLabels = [];
    let verticalLabels = [];
    for(let l = 0; l < 8; l++) {
        horizontalLabels.push(<div key={`h${l}`}>{HORIZONTAL_AXIS[l]}</div>)
        verticalLabels.push(<div key={`v${l}`}>{VERTICAL_AXIS[l]}</div>)
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