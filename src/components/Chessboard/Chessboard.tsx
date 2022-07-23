import "./Chessboard.css";
import { useRef, useState } from "react";
import Square from "../Squere/Square";
import Arbiter from "../../arbiter/Arbiter";
import { HORIZONTAL_AXIS, VERTICAL_AXIS, SQUARE_SIZE, samePosition, Piece, PieceType, TeamType, initialBoardPieces, Position} from "../../Constants";
import Notation from "../Notation/Notation";

export default function Chessboard() {
    const arbiter = new Arbiter();
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [promotionPawn, setPromotionPawn] = useState<Piece>();
    const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
    const [pieces, setPieces] = useState<Piece[]>(initialBoardPieces);
    const [moves, setMoves] = useState<Array<string>>([]);
    const [enPassantEnabled, setEnPassantEnabled] = useState<Position | null>(null);
    const chessboardRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    function translatePosition(position: Position) {
        return HORIZONTAL_AXIS[position.x]+VERTICAL_AXIS[position.y];
    }

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
            element.style.zIndex = "100";
            element.style.position = "absolute";
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
            const currentPiece = pieces.find(p => p.position.x === grabPosition.x && p.position.y === grabPosition.y);
            const dropPosition: Position = {
                x: Math.floor((e.clientX - chessboard.offsetLeft) / SQUARE_SIZE),
                y: Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - (SQUARE_SIZE*8)) / SQUARE_SIZE))
            }
            
            if(currentPiece) {
                const pawnDirection = currentPiece.team === TeamType.WHITE ? 1 : -1;
                const enPassantMove = arbiter.isEnPassantMove(grabPosition, dropPosition,currentPiece.type, currentPiece.team, pieces);
                const validMode = arbiter.isValidMove(grabPosition, dropPosition,currentPiece.type, currentPiece.team, pieces);
                const promotionRow = currentPiece.team === TeamType.WHITE ? 7 : 0;
                if(enPassantMove) {
                    const updatedPieces = pieces.reduce((results,piece) => {
                        if(samePosition(piece.position, grabPosition)) {
                            piece.position = dropPosition;
                            piece.enPassantEnabled = Math.abs(grabPosition.y - dropPosition.y) === 2 && piece.type === PieceType.PAWN;
                            results.push(piece);
                        } else if (!samePosition(piece.position,  {x: dropPosition.x, y: dropPosition.y - pawnDirection})) {
                            piece.enPassantEnabled = false;
                            results.push(piece);
                        }
                        return results;
                    }, [] as Piece[]);
                    setPieces(updatedPieces);
                    addNotation(currentPiece,grabPosition,dropPosition);
                } else if(validMode) {
                    const updatedPieces = pieces.reduce((results,piece) => {
                        if(samePosition(piece.position, grabPosition)) {
                            piece.position = dropPosition;
                            piece.enPassantEnabled = Math.abs(grabPosition.y - dropPosition.y) === 2 && piece.type === PieceType.PAWN;
                            if(piece.type === PieceType.PAWN && dropPosition.y === promotionRow) {
                                modalRef.current?.classList.add("active");
                                setPromotionPawn(piece);
                            }
                            results.push(piece);
                        } else if (!samePosition(piece.position,  dropPosition)) {
                            piece.enPassantEnabled = false;
                            results.push(piece);
                        }
                        return results;
                    }, [] as Piece[]);
                    setPieces(updatedPieces);
                    addNotation(currentPiece,grabPosition,dropPosition);
                } else {
                    // Reset Piece
                    activePiece.style.removeProperty("z-index");
                    activePiece.style.removeProperty("position");
                    activePiece.style.removeProperty("top");
                    activePiece.style.removeProperty("left");
                }
            }
            setActivePiece(null);
        }
    }

    function addNotation(currentPiece: Piece, grabPosition: Position, dropPosition: Position) {
        let mvs = moves;
        let piece = currentPiece.type !== PieceType.PAWN ? (currentPiece.type === PieceType.KNIGHT ? currentPiece.type.substring(1,2).toLocaleUpperCase() : currentPiece.type.substring(0,1).toLocaleUpperCase()) : "";
        let old_coordinates = translatePosition(grabPosition);
        let new_coordinates = translatePosition(dropPosition);
        console.log(old_coordinates, new_coordinates);
        mvs.push(piece+new_coordinates);
        setMoves(mvs);
        document.querySelectorAll(`.square.new`).forEach(el => el.classList.remove("new"));
        document.querySelectorAll(`[data-coordinates=${old_coordinates}],[data-coordinates=${new_coordinates}]`).forEach(el => el.classList.add("new"));
    }

    function promotionPawnTeam() {
        return promotionPawn?.team === TeamType.WHITE ? "w" : "b";
    }

    function promotePawn(Type: PieceType,Name: string) {
        if(promotionPawn === undefined) {
            return;
        }
        const updatedPieces = pieces.reduce((results,piece) => {
            if(samePosition(piece.position, promotionPawn.position)) {
                const Team = piece.team === TeamType.WHITE ? "w" : "b"
                piece.type = Type;  
                piece.image = `/assets/images/${Name}_${Team}.png`;
            }
            results.push(piece);
            return results;
        }, [] as Piece[]);
        setPieces(updatedPieces);
        modalRef.current?.classList.remove("active");
    }


    // Render Board
    let board = [];
    for(let j = HORIZONTAL_AXIS.length - 1; j >= 0; j--) {
        for(let i = 0; i < VERTICAL_AXIS.length; i++) {
            const square = i + j + 2;
            const piece = pieces.find(p => samePosition(p.position, {x: i, y: j}))
            let coordinates = HORIZONTAL_AXIS[i]+VERTICAL_AXIS[j];
            board.push(<Square key={`${i},${j}`} coordinates={coordinates} number={square} piece_type={piece?.type} team={piece?.team} />)
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
        <>
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
        <div id="pawn-promotion-modal" ref={modalRef}>
            <div className="modal-body">
                <img onClick={() => promotePawn(PieceType.QUEEN,'queen')} src={`assets/images/queen_${promotionPawnTeam()}.png`} alt="Queen"/>
                <img onClick={() => promotePawn(PieceType.ROOK,'rook')} src={`assets/images/rook_${promotionPawnTeam()}.png`} alt="Rook"/>
                <img onClick={() => promotePawn(PieceType.BISHOP,'bishop')} src={`assets/images/bishop_${promotionPawnTeam()}.png`} alt="Bishop"/>
                <img onClick={() => promotePawn(PieceType.KNIGHT,'knight')} src={`assets/images/knight_${promotionPawnTeam()}.png`} alt="Knight"/>
            </div>
        </div>
        <Notation moves={moves}/>
        </>
    );
}