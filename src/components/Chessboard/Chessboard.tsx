import "./Chessboard.css";
import { useRef, useState } from "react";
import Square from "../Squere/Square";
import Arbiter from "../../arbiter/Arbiter";
import Notation from "../Notation/Notation";
import { HORIZONTAL_AXIS, VERTICAL_AXIS, SQUARE_SIZE, samePosition, Piece, PieceType, TeamType, initialBoardPieces, Position, CastleRights, MoveType, ArbiterDecision, translatePosition, CapturedPieces} from "../../Constants";
import { Box, Button, ButtonGroup, Dialog, DialogContent, DialogContentText, Paper, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackwardFast, faBackwardStep, faCircle, faFlag, faForwardFast, faForwardStep, faHandshakeSimple, faPenToSquare, faRetweet, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import Captured from "../Captured/Captured";

export default function Chessboard() {
    const arbiter = new Arbiter();
    const [boardFlipped, setBoardFlipped] = useState<boolean>(false);
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [promotionPawn, setPromotionPawn] = useState<Piece>();
    const [turnTeam, setTurnTeam] = useState<TeamType>(TeamType.WHITE);
    const [halfMoves, setHalfMoves] = useState<number>(0);
    const [fullMoves, setFullMoves] = useState<number>(1);
    const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
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
            element.style.position = "fixed";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            // document.getElementById("active-piece")?.remove();
            // const active_sq = document.createElement('div');
            // active_sq.setAttribute("id", "active-piece");
            // active_sq.style.cssText = `width: 100px; height: 100px;position: absolute; background-color: #a3ff003d; z-index: 1;`
            // element.parentElement?.appendChild(active_sq);

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
            activePiece.style.position = "fixed";
            activePiece.style.left = x < minX ? `${minX}px` : (x > maxX ? `${maxX}px` : `${x}px`)
            activePiece.style.top = y < minY ? `${minY}px` : (y > maxY ? `${maxY}px` : `${y}px`)
        }
    } 

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if(activePiece && chessboard) {
            const grabbedPiece = boardPieces.find(p => p.position.x === grabPosition.x && p.position.y === grabPosition.y);
            const dropPosition: Position = {
                x: Math.floor((e.clientX - chessboard.offsetLeft) / SQUARE_SIZE),
                y: Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - (SQUARE_SIZE*8)) / SQUARE_SIZE))
            }
            
            if(grabbedPiece) {
                const moveValidation = arbiter.validateMove(grabbedPiece, dropPosition, boardPieces, enPassantTarget, castleRights);
                const correctTeam = turnTeam === grabbedPiece.team;
                if(correctTeam && moveValidation.valid) {
                    completeMove(grabbedPiece, dropPosition,moveValidation);
                } else {
                    resetActivePiece(activePiece);
                }
            }
            setActivePiece(null);
        }
    }

    function completeMove(grabbedPiece: Piece, dropPosition: Position, moveValidation: ArbiterDecision) {
        setBoardPieces(moveValidation.newBoard);
        setEnPassantTarget(moveValidation.enPassantTarget);
        setCastleRights(moveValidation.castleRights);
        setTurnTeam(grabbedPiece.team === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE);
        setHalfMoves(grabbedPiece.type === PieceType.PAWN || moveValidation.type === MoveType.EN_PASSANT ? 0 : halfMoves+1);
        setFullMoves(fullMoves+(grabbedPiece.team === TeamType.BLACK ? 1 : 0));
        addNotation(grabbedPiece, dropPosition, moveValidation);
        if(moveValidation.promotionPawn) {
            modalRef.current?.classList.add("active");
            setPromotionPawn(moveValidation.promotionPawn);
        }
    }

    function resetActivePiece(activePiece:HTMLElement) {
        activePiece.style.removeProperty("z-index");
        activePiece.style.removeProperty("position");
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");
    }

    function addNotation(grabbedPiece: Piece, dropPosition: Position, moveValidation: ArbiterDecision) {
        let old_coordinates = translatePosition(grabPosition);
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
            document.querySelectorAll(`.square.new`).forEach(el => el.classList.remove("new"));
        }
    };
      


    // Render Board
    let board = [];
    if(boardFlipped === false) {
        for(let j = HORIZONTAL_AXIS.length - 1; j >= 0; j--) {
            for(let i = 0; i < VERTICAL_AXIS.length; i++) {
                const square = i + j + 2;
                const piece = boardPieces.find(p => samePosition(p.position, {x: i, y: j}))
                let coordinates = HORIZONTAL_AXIS[i]+VERTICAL_AXIS[j];
                board.push(<Square key={`${i},${j}`} coordinates={coordinates} number={square} piece_type={piece?.type} team={piece?.team} />)
            }
        }
    } else {
        // Flipped
        for(let j = 0; j < 8; j++) {
            for(let i = VERTICAL_AXIS.length - 1; i >= 0; i--) {
                const square = i + j + 2;
                const piece = boardPieces.find(p => samePosition(p.position, {x: i, y: j}))
                let coordinates = HORIZONTAL_AXIS[i]+VERTICAL_AXIS[j];
                board.push(<Square key={`${i},${j}`} coordinates={coordinates} number={square} piece_type={piece?.type} team={piece?.team} />)
            }
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
                    onMouseDown={e => grabPiece(e)}
                    onMouseUp={e => dropPiece(e)}
                >
                    {board}
                    <div className="horizontalLabels" style={{flexDirection: boardFlipped ? "row-reverse" : "row"}}>{horizontalLabels}</div>
                    <div className="verticalLabels" style={{flexDirection: boardFlipped ? "column" : "column-reverse"}}>{verticalLabels}</div>
                </div>
            </Box>
            <Box display={"flex"} flexDirection="column" justifyContent="space-between" width={350}>
                <Box>
                    <Paper sx={{padding: '10px'}} elevation={turnTeam === TeamType.BLACK ? 3 : 1}>
                        <Stack direction="row" spacing={1} alignContent="center">
                            <FontAwesomeIcon icon={faCircle} fontSize="32px" color="black" beatFade={turnTeam === TeamType.BLACK}></FontAwesomeIcon>
                            <Captured pieces={captured} showTeam={TeamType.BLACK}/>
                        </Stack>
                    </Paper>
                </Box>
                <Box>
                    <Notation moves={moves}/>
                    <ButtonGroup sx={{marginTop: 2}} fullWidth={true}>
                        <Button variant="contained" onClick={() => setBoardFlipped(!boardFlipped)}><FontAwesomeIcon icon={faRetweet} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained"><FontAwesomeIcon icon={faBackwardFast} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained"><FontAwesomeIcon icon={faBackwardStep} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained"><FontAwesomeIcon icon={faForwardStep} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained"><FontAwesomeIcon icon={faForwardFast} fontSize="24px"></FontAwesomeIcon></Button>
                        <Button variant="contained" onClick={handleClickOpen}><FontAwesomeIcon icon={faShareNodes} fontSize="24px"></FontAwesomeIcon></Button>
                    </ButtonGroup>
                    <ButtonGroup sx={{marginTop: 2}} fullWidth={true}>
                        <Button variant="contained" color="warning"  startIcon={<FontAwesomeIcon icon={faHandshakeSimple}></FontAwesomeIcon>}>Offer Draw</Button>
                        <Button variant="contained" color="error"  startIcon={<FontAwesomeIcon icon={faFlag}></FontAwesomeIcon>}>Resign</Button>
                    </ButtonGroup>
                </Box>
                <Box>
                    <Paper sx={{padding: '10px'}} elevation={turnTeam === TeamType.WHITE ? 3 : 1}>
                        <Stack direction="row" spacing={1} alignContent="center">
                            <FontAwesomeIcon icon={faCircle} fontSize="32px" color="white" beatFade={turnTeam === TeamType.WHITE}></FontAwesomeIcon>
                            <Captured pieces={captured} showTeam={TeamType.WHITE}/>
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
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <Stack direction="row" spacing={2} alignContent="center">
                        <TextField id="outlined-basic" label="FEN" variant="outlined" value={generateFEN()} fullWidth disabled />
                        <Button variant="outlined" onClick={loadFEN}><FontAwesomeIcon icon={faPenToSquare} fontSize="24px"></FontAwesomeIcon></Button>
                    </Stack>
                </DialogContentText>
            </DialogContent>
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