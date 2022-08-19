import "./Chessboard.css";
import { useRef, useState } from "react";
import Square from "../Squere/Square";
import Arbiter from "../../arbiter/Arbiter";
import Notation from "../Notation/Notation";
import { HORIZONTAL_AXIS, VERTICAL_AXIS, SQUARE_SIZE, samePosition, Piece, PieceType, TeamType, initialBoardPieces, Position, CastleRights, ArbiterDecision, translatePosition, CapturedPieces, moveSound, captureSound, genericSound, GameScore} from "../../Constants";
import { Box, Button, ButtonGroup, Dialog, Paper, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackwardFast, faBackwardStep, faCircle, faFlag, faForwardFast, faForwardStep, faHandshakeSimple, faPenToSquare, faRetweet, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import Captured from "../Captured/Captured";

export default function Chessboard() {
    const arbiter = new Arbiter();
    const [boardFlipped, setBoardFlipped] = useState<boolean>(false);
    const [draggedPiece, setDraggedPiece] = useState<HTMLElement | null>(null);
    const [promotionPawn, setPromotionPawn] = useState<Piece>();
    const [turnTeam, setTurnTeam] = useState<TeamType>(TeamType.WHITE);
    const [halfMoves, setHalfMoves] = useState<number>(0);
    const [fullMoves, setFullMoves] = useState<number>(1);
    const [score, setScore] = useState<GameScore>({
            black: 0,
            white: 0,
            type: ""
        }
    );
    const [grabbedPiece, setGrabbedPiece] = useState<Piece | null>(null);
    const [boardPieces, setBoardPieces] = useState<Piece[]>(initialBoardPieces);
    const [moves, setMoves] = useState<Array<string>>([]);
    const [captured, setCaptured] = useState<CapturedPieces>({white: [],black: []});
    const [enPassantTarget, setEnPassantTarget] = useState<Position | false>(false);
    const [castleRights, setCastleRights] = useState<CastleRights>({
        white: {queen: true, king: true},
        black: {queen: true, king: true}
    });
    const chessboardRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    const handleClickOpen = () => {
        setShareDialogOpen(true);
    };

    const handleClose = () => {
        setShareDialogOpen(false);
    };

    function drawArrow(e: React.MouseEvent) {
        if(cancelGrabPiece() === false) {
            console.log("Right Click")
        }
    }

    function cancelGrabPiece() {
        if(draggedPiece || grabbedPiece) {
            resetDraggedPiece();
            resetGrabbedPiece();
            return true;
        }
        return false;
    }

    function grabPiece(e: React.MouseEvent) {
        document.getElementById("shadow-piece")?.remove();
        document.querySelectorAll(".legal-move").forEach(e => e.remove());
        
        let element = e.target as HTMLElement;
        const chessboard = chessboardRef.current;
        if(element.classList.contains("chess-piece") && chessboard) {
            const findPiece = boardPieces.find(p => 
                p.position.x === Math.abs((boardFlipped ? 7 : 0) - Math.floor((e.clientX - chessboard.offsetLeft) / SQUARE_SIZE)) 
                && p.position.y === Math.abs((boardFlipped ? 7 : 0) - Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - (SQUARE_SIZE*8)) / SQUARE_SIZE)))
            );
            if(findPiece && findPiece.team === turnTeam) {
                setGrabbedPiece(findPiece);
                const legalMoves = arbiter.getLegalMoves(findPiece,boardPieces,enPassantTarget,castleRights);
                if(legalMoves.length) {
                    legalMoves.forEach(m => {
                        const possible_square = document.querySelector("[data-coordinates="+m+"]");
                        const legal = document.createElement('div');
                        legal.setAttribute("class", "legal-move");
                        if(possible_square?.querySelector(".chess-piece")) {
                            legal.style.cssText = `width: 100px; height: 100px; border: 4px solid green; border-radius: 50%; position: absolute; z-index: 1; opacity: 0.2;`
                        } else {
                            legal.style.cssText = `width: 30px; height: 30px; border-radius: 50%; position: absolute; background-color: green; z-index: 1; opacity: 0.2; margin:35px`
                        }
                        possible_square?.appendChild(legal);
                    })
                    const x = e.clientX - (SQUARE_SIZE/2);
                    const y = e.clientY - (SQUARE_SIZE/2);
                    element.style.zIndex = "100";
                    element.style.position = "fixed";
                    element.style.left = `${x}px`;
                    element.style.top = `${y}px`;
        
                    document.getElementById("shadow-piece")?.remove();
                    const shadow_piece = document.createElement('div');
                    shadow_piece.setAttribute("id", "shadow-piece");
                    shadow_piece.setAttribute("class", element.classList.value);
                    shadow_piece.style.cssText = `width: 100px; height: 100px;position: absolute; background-color: green; z-index: 1; opacity: 0.3;`
                    element.parentElement?.appendChild(shadow_piece);
        
                    setDraggedPiece(element);
                }
            }
        }
    }

    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if(draggedPiece && chessboard) {
            const minX = chessboard.offsetLeft - (SQUARE_SIZE/2);
            const minY = chessboard.offsetTop - (SQUARE_SIZE/2);
            const maxX = chessboard.offsetLeft + chessboard.clientWidth - (SQUARE_SIZE/2);
            const maxY = chessboard.offsetTop + chessboard.clientHeight - (SQUARE_SIZE/2);
            const x = e.clientX - (SQUARE_SIZE/2);
            const y = e.clientY - (SQUARE_SIZE/2);
            draggedPiece.style.position = "fixed";
            draggedPiece.style.left = x < minX ? `${minX}px` : (x > maxX ? `${maxX}px` : `${x}px`)
            draggedPiece.style.top = y < minY ? `${minY}px` : (y > maxY ? `${maxY}px` : `${y}px`)
        }
    } 

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if(grabbedPiece && chessboard) {
            const dropPosition: Position = {
                x: Math.abs((boardFlipped ? 7 : 0) - Math.floor((e.clientX - chessboard.offsetLeft) / SQUARE_SIZE)),
                y: Math.abs((boardFlipped ? 7 : 0) - Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - (SQUARE_SIZE*8)) / SQUARE_SIZE)))
            }
            
            if(!samePosition(grabbedPiece.position,dropPosition)) {
                const moveValidation = arbiter.validateMove(grabbedPiece, dropPosition, boardPieces, enPassantTarget, castleRights);
                const correctTeam = turnTeam === grabbedPiece.team;
                if(correctTeam && moveValidation.valid) {
                    completeMove(grabbedPiece, dropPosition, moveValidation);
                } else {
                    resetDraggedPiece();
                    resetGrabbedPiece();
                }
            } else {
                resetDraggedPiece();
            }
        }
    }

    function completeMove(grabbedPiece: Piece, dropPosition: Position, moveValidation: ArbiterDecision) {
        let sound = moveValidation.capture ? captureSound : moveSound;
        
        let enemyKing = moveValidation.newBoard.find(p => p.type === PieceType.KING && p.team === (grabbedPiece.team === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE));
        let enemyKingLegalMoves = enemyKing && arbiter.getLegalMoves(enemyKing,moveValidation.newBoard,enPassantTarget,castleRights).length;
        if(!enemyKingLegalMoves) {
            if(moveValidation.check) {
                sound = genericSound;
                moveValidation.notation = moveValidation.notation.replace('+','#');
                setScore({
                    white: grabbedPiece.team === TeamType.WHITE ? 1 : 0,
                    black: grabbedPiece.team === TeamType.BLACK ? 1 : 0,
                    type: "Checkmate"
                })
                console.log("Mate");
            } else {
                // TODO: check all enemy legal moves;
                // sound = genericSound;
                // setScore({
                //     white: 0.5,
                //     black: 0.5,
                //     type: "Stalemate"
                // })
            }
        }
        
        setBoardPieces(moveValidation.newBoard);
        setEnPassantTarget(moveValidation.enPassantTarget);
        setCastleRights(moveValidation.castleRights);
        setTurnTeam(grabbedPiece.team === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE);
        setHalfMoves(grabbedPiece.type === PieceType.PAWN || moveValidation.capture ? 0 : halfMoves+1);
        setFullMoves(fullMoves+(grabbedPiece.team === TeamType.BLACK ? 1 : 0));
        addNotation(grabbedPiece, dropPosition, moveValidation);
        if(moveValidation.promotionPawn) {
            modalRef.current?.classList.add("active");
            setPromotionPawn(moveValidation.promotionPawn);
        }
        resetGrabbedPiece();
        sound.play();
    }

    function resetDraggedPiece() {
        if(draggedPiece) {
            draggedPiece.style.removeProperty("z-index");
            draggedPiece.style.removeProperty("position");
            draggedPiece.style.removeProperty("top");
            draggedPiece.style.removeProperty("left");
            setDraggedPiece(null);
        }
    }
    function resetGrabbedPiece() {
        if(grabbedPiece) {
            document.getElementById("shadow-piece")?.remove();
            document.querySelectorAll(".legal-move").forEach(e => e.remove());
            setGrabbedPiece(null);
        }
    }

    function addNotation(grabbedPiece: Piece, dropPosition: Position, moveValidation: ArbiterDecision) {
        let old_coordinates = translatePosition(grabbedPiece.position);
        let new_coordinates = translatePosition(dropPosition);
        document.querySelectorAll(`.square.new`).forEach(el => el.classList.remove("new"));
        document.querySelectorAll(`[data-coordinates=${old_coordinates}],[data-coordinates=${new_coordinates}]`).forEach(el => el.classList.add("new"));
        moves.push(moveValidation.notation);
        setMoves(moves);
        if(moveValidation.capture && moveValidation.capturedPiece) {
            captured[grabbedPiece.team].push(moveValidation.capturedPiece);
            setCaptured(captured);
        }
        setTimeout(scrollNotation,100)
    }

    function promotionPawnTeam() {
        return promotionPawn?.team === TeamType.WHITE ? "w" : "b";
    }

    function promotePawn(Type: PieceType,Name: string) {
        if(promotionPawn === undefined) {
            return;
        }
        const updatedPieces = boardPieces.reduce((results,piece) => {
            results.push({...piece, type: samePosition(piece.position, promotionPawn.position) ? Type : piece.type})
            return results;
        }, [] as Piece[]);
        setBoardPieces(updatedPieces);
        modalRef.current?.classList.remove("active");
    }

    function generateFEN() {
        let FEN = [];

        let ranks = [];
        for(let y = 7; y >= 0; y--) {

            let row =  [];
            let no_piece = 0;

            for(let x = 0; x < 8; x++) {

                const piece = boardPieces.find(p => samePosition(p.position, {x: x, y: y}))
                if(piece) {
                    if(no_piece > 0) {
                        row.push(no_piece);
                    }
                    let sign = piece.type === PieceType.KNIGHT ? 'n' : piece.type.substring(0,1);
                    row.push(piece.team === TeamType.BLACK ? sign : sign.toLocaleUpperCase());
                    no_piece = 0;
                } else {
                    no_piece++;
                }
            }
            if(no_piece > 0) {
                row.push(no_piece);
            }
            ranks.push(row.join(""));
        }

        // Pieces
        FEN.push(ranks.join("/")); 
        // Turn
        FEN.push(turnTeam.substring(0,1).toLocaleLowerCase()); 
        // Castle
        let castling = (castleRights.white.king ? "K" : "") + (castleRights.white.queen ? "Q" : "") + (castleRights.black.king ? "k" : "") + (castleRights.black.queen ? "q" : "");
        FEN.push(castling ? castling : "-"); 
        // En Passant
        FEN.push(enPassantTarget ? translatePosition(enPassantTarget) : "-"); 
        // Halfmoves
        FEN.push(halfMoves); 
        // Fullmoves
        FEN.push(fullMoves); 
        
        return FEN.join(" ");
    }

    function loadFEN() {
        let new_FEN = prompt("Enter FEN");
        let fenBoard = new_FEN?.split(" ")[0];
        let x = 0;
        let y = 7;
        let boardPieces: Piece[] = [];
        let pieceTypeSymbols:any = {
            'p': PieceType.PAWN,
            'r': PieceType.ROOK,
            'b': PieceType.BISHOP,
            'n': PieceType.KNIGHT,
            'q': PieceType.QUEEN,
            'k': PieceType.KING,
        }
        if(new_FEN && fenBoard) {
            fenBoard.split('').forEach((symbol:any) => {
                if(symbol === '/') {
                    x = 0;
                    y--;
                } else {
                    if(!isNaN(symbol)) {
                        x += parseInt(symbol);
                    } else {
                        let type = pieceTypeSymbols[symbol.toLowerCase()];
                        let team = symbol === symbol.toLowerCase() ? TeamType.BLACK : TeamType.WHITE;
                        boardPieces.push({position: {x: x, y: y}, type: type, team: team})
                        x++;
                    }
                }
    
            });
            setBoardPieces(boardPieces);
            setTurnTeam(new_FEN?.split(" ")[1] === "w" ? TeamType.WHITE : TeamType.BLACK); 
            document.querySelectorAll(`.square.new`).forEach(el => el.classList.remove("new"));
        }
    };
    
    function generatePGN() {
        let PGN: string[] = [];
        let full_moves = [];
        for (let i = 0; i < moves.length; i += 2) {
            const chunk = moves.slice(i, i + 2);
            full_moves.push(chunk);
        }
        full_moves.forEach((moves, index) => {
            PGN.push(index+1+'.')
            PGN.push(moves[0]);
            PGN.push(moves[1]);
        });
        return PGN.join(" ");
    }

    // Render Board
    let board = [];
    for(let j = HORIZONTAL_AXIS.length - 1; j >= 0; j--) {
        for(let i = 0; i < VERTICAL_AXIS.length; i++) {
            const square = i + j + 2;
            const position = {x: Math.abs((boardFlipped ? 7 : 0) - i), y:  Math.abs((boardFlipped ? 7 : 0) - j)};
            const piece = boardPieces.find(p => samePosition(p.position, position))
            let coordinates = translatePosition(position);
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

    const scrollNotation = () => {
        document.querySelector(".fullMove:last-child")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <>
        <Stack direction="row" spacing={2} justifyContent="center">
            <Box display={"flex"}>
                <div 
                    id="chessboard"
                    ref={chessboardRef}
                    onMouseMove={e => movePiece(e)}
                    onMouseDown={e => e.button === 0 ? grabPiece(e) : (e.button === 2 ? drawArrow(e) : null)}
                    onMouseUp={e => e.button === 0 ? dropPiece(e) : cancelGrabPiece()}
                >
                    {board}
                    <div className="horizontalLabels" style={{flexDirection: boardFlipped ? "row-reverse" : "row"}}>{horizontalLabels}</div>
                    <div className="verticalLabels" style={{flexDirection: boardFlipped ? "column" : "column-reverse"}}>{verticalLabels}</div>
                </div>
            </Box>
            <Box display={"flex"} flexDirection="column" justifyContent="space-between" width={350}>
                <Box>
                    <Paper sx={{padding: '10px'}} elevation={turnTeam === (boardFlipped ? TeamType.WHITE : TeamType.BLACK) ? 4 : 1}>
                        <Stack direction="row" spacing={1} alignContent="center">
                            <FontAwesomeIcon icon={faCircle} fontSize="32px" color={boardFlipped ? TeamType.WHITE : TeamType.BLACK} beatFade={turnTeam === (boardFlipped ? TeamType.WHITE : TeamType.BLACK)}></FontAwesomeIcon>
                            <Captured pieces={captured} showTeam={(boardFlipped ? TeamType.WHITE : TeamType.BLACK)}/>
                        </Stack>
                    </Paper>
                </Box>
                <Box>
                    <Notation moves={moves} score={score}/>
                    <ButtonGroup sx={{marginTop: 2}} fullWidth={true}>
                        <Button variant="contained" onClick={() => setBoardFlipped(!boardFlipped)}><FontAwesomeIcon icon={faRetweet} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained"><FontAwesomeIcon icon={faBackwardFast} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained"><FontAwesomeIcon icon={faBackwardStep} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained"><FontAwesomeIcon icon={faForwardStep} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained"><FontAwesomeIcon icon={faForwardFast} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained" onClick={handleClickOpen}><FontAwesomeIcon icon={faShareNodes} fontSize="24px"></FontAwesomeIcon></Button>
                    </ButtonGroup>
                    { score.type === "" && 
                    <ButtonGroup sx={{marginTop: 2}} fullWidth={true}>
                        <Button variant="contained" color="warning"  startIcon={<FontAwesomeIcon icon={faHandshakeSimple}></FontAwesomeIcon>}>Offer Draw</Button>
                        <Button variant="contained" color="error"  startIcon={<FontAwesomeIcon icon={faFlag}></FontAwesomeIcon>}>Resign</Button>
                    </ButtonGroup>
                    }
                    
                </Box>
                <Box>
                    <Paper sx={{padding: '10px'}} elevation={turnTeam === (!boardFlipped ? TeamType.WHITE : TeamType.BLACK) ? 4 : 1}>
                        <Stack direction="row" spacing={1} alignContent="center">
                            <FontAwesomeIcon icon={faCircle} fontSize="32px" color={!boardFlipped ? TeamType.WHITE : TeamType.BLACK} beatFade={turnTeam === (!boardFlipped ? TeamType.WHITE : TeamType.BLACK)}></FontAwesomeIcon>
                            <Captured pieces={captured} showTeam={(!boardFlipped ? TeamType.WHITE : TeamType.BLACK)}/>
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Stack>
        <Dialog
            open={shareDialogOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
           
        >
            <Box sx={{margin: 3}}>
                <Stack direction="row" spacing={2} alignContent="center">
                    <TextField id="outlined-basic" label="FEN" variant="outlined" value={generateFEN()} fullWidth />
                    <Button variant="outlined" onClick={loadFEN}><FontAwesomeIcon icon={faPenToSquare} fontSize="24px"></FontAwesomeIcon></Button>
                </Stack>
                <Stack direction="row" spacing={2} alignContent="center" marginTop={2}>
                    <TextField id="outlined-basic" label="PGN" variant="outlined" value={generatePGN()} fullWidth  multiline maxRows={4}/>
                </Stack>
            </Box>
        </Dialog>

        <div id="pawn-promotion-modal" ref={modalRef}>
            <div className="modal-body">
                <img onClick={() => promotePawn(PieceType.QUEEN,'queen')} src={`assets/images/queen_${promotionPawnTeam()}.png`} alt="Queen"/>
                <img onClick={() => promotePawn(PieceType.ROOK,'rook')} src={`assets/images/rook_${promotionPawnTeam()}.png`} alt="Rook"/>
                <img onClick={() => promotePawn(PieceType.BISHOP,'bishop')} src={`assets/images/bishop_${promotionPawnTeam()}.png`} alt="Bishop"/>
                <img onClick={() => promotePawn(PieceType.KNIGHT,'knight')} src={`assets/images/knight_${promotionPawnTeam()}.png`} alt="Knight"/>
            </div>
        </div>
        </>
    );
}