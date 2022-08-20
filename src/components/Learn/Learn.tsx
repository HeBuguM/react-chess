import "../Chessboard/Chessboard.css";
import "./Learn.css";
import { useRef, useState } from "react";
import Square from "../Squere/Square";
import { HORIZONTAL_AXIS, VERTICAL_AXIS, SQUARE_SIZE, samePosition, initialBoardPieces , Position, translatePosition } from "../../Constants";
import { Box, Button, FormControlLabel, FormLabel, Paper, Switch } from "@mui/material";
import { Stack } from "@mui/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";

export default function Learn() {
    const chessboardRef = useRef<HTMLDivElement>(null);

    const [boardFlipped, setBoardFlipped] = useState<boolean>(false);
    const [showPieces, setShowPieces] = useState<boolean>(true);
    const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
    const [previewNext, setPreviewNext] = useState<boolean>(true);

    const [score, setScore] = useState<number>(0);
    const [mistakes, setMistakes] = useState<number>(0);
    const [current, setCurrent] = useState<string>("");
    const [next, setNext] = useState<string>("");
    
    const [startLearning, setStartLearning] = useState<boolean>(false);
    
    const generateCoordinate = () => {
        return translatePosition({
            x: Math.floor(Math.random() * (7 - 1 + 1)) + 1,
            y: Math.floor(Math.random() * (7 - 1 + 1)) + 1
        });
    }

    const initCoordinates = () => {
        let newCurrent = generateCoordinate();
        let newNext = generateCoordinate();
        while(newNext === newCurrent) {
            newNext = generateCoordinate();
        }
        setCurrent(newCurrent);
        setNext(newNext);
    }

    function selectCoordinates(e: React.MouseEvent) {        
        const chessboard = chessboardRef.current;
        if(chessboard) {
            const selectedCoordinates: Position = {
                x: Math.abs((boardFlipped ? 7 : 0) - Math.floor((e.clientX - chessboard.offsetLeft) / SQUARE_SIZE)),
                y: Math.abs((boardFlipped ? 7 : 0) - Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - (SQUARE_SIZE*8)) / SQUARE_SIZE)))
            }
            const score_card = document.getElementById("score-card");
            if(translatePosition(selectedCoordinates) === current) {
                if(score_card) {
                    score_card.style.backgroundColor = "green";
                    setTimeout(function () {
                        score_card.style.backgroundColor = "";
                    }, 200);
                }
                setScore(score+1);
                setCurrent(next);
                let newNext = generateCoordinate();
                while(newNext === next) {
                    newNext = generateCoordinate();
                }
                setNext(newNext);
            } else {
                setMistakes(mistakes+1);
                if(score_card) {
                    score_card.style.backgroundColor = "#d32f2f";
                    setTimeout(function () {
                        score_card.style.backgroundColor = "";
                    }, 200);
                }
            }
        }
    }

    const startHandler = () => {
        initCoordinates();
        setStartLearning(true);
        setScore(0);
        setMistakes(0);
    }

    const stopHandler = () => {
        setStartLearning(false);
    }
    
    // Render Board
    let board = [];
    for(let j = HORIZONTAL_AXIS.length - 1; j >= 0; j--) {
        for(let i = 0; i < VERTICAL_AXIS.length; i++) {
            const square = i + j + 2;
            const position = {x: Math.abs((boardFlipped ? 7 : 0) - i), y:  Math.abs((boardFlipped ? 7 : 0) - j)};
            const piece = showPieces ? initialBoardPieces.find(p => samePosition(p.position, position)) : null;
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

    return (
        <>
        <Stack direction="row" spacing={2} justifyContent="center">
            <Box display={"flex"}>
                <div 
                    id="chessboard"
                    className="learn-coordinates"
                    ref={chessboardRef}
                    onMouseDown={e => e.button === 0 ? selectCoordinates(e) : null}
                >
                    {board}
                    {showCoordinates && <div className="horizontalLabels" style={{flexDirection: boardFlipped ? "row-reverse" : "row"}}>{horizontalLabels}</div>}
                    {showCoordinates && <div className="verticalLabels" style={{flexDirection: boardFlipped ? "column" : "column-reverse"}}>{verticalLabels}</div>}
                    {startLearning &&
                    <div id="learningTargets">
                        <div className="current">{current}</div>
                        {previewNext && <div className="next">{next}</div>}
                    </div>}
                </div>
            </Box>
            <Box display={"flex"} flexDirection="column" width={350}>
                <Box>
                    <Paper sx={{padding: '10px', textAlign: "center", fontSize: "24px"}} elevation={2}>
                        <FontAwesomeIcon icon={faGraduationCap} fontSize="24px"></FontAwesomeIcon> Learn Coordinates
                    </Paper>
                </Box>
                <Box sx={{marginTop: 2}}>
                    <Paper sx={{padding: '10px', textAlign: "center", fontSize: "24px"}} elevation={2}>
                        <FormLabel component="legend">Side</FormLabel>
                        <Stack display={"flex"} direction="row" spacing={1} alignItems="center" justifyContent="space-evenly">
                            <img alt="White" src="assets/images/king_w.png" style={{cursor:"pointer", opacity: !boardFlipped ? "1" : "0.3"}} height={"80px"} onClick={() => setBoardFlipped(false)}/>
                            <img alt="Black" src="assets/images/king_b.png" style={{cursor:"pointer", opacity: boardFlipped ? "1" : "0.3"}} height={"80px"} onClick={() => setBoardFlipped(true)} />
                        </Stack>
                        <FormLabel component="legend" sx={{marginTop: 5}}>Board</FormLabel>
                        <FormControlLabel
                            label="Pieces"
                            control={<Switch color="success" checked={showPieces} onChange={e => setShowPieces(!showPieces)} />}
                            labelPlacement="end"
                        />
                        <FormControlLabel
                            control={<Switch color="success" checked={showCoordinates} onChange={e => setShowCoordinates(!showCoordinates)} />}
                            label="Coordinates"
                            labelPlacement="end"
                        />
                        <FormLabel component="legend" sx={{marginTop: 5}}>Target Coordinates</FormLabel>
                        <FormControlLabel
                            control={<Switch color="success" checked={previewNext} onChange={e => setPreviewNext(!previewNext)} />}
                            label="Preview next"
                            labelPlacement="end"
                        />
                    </Paper>                     
                </Box>
                {startLearning && <Box sx={{marginTop: 2}}>
                    <Paper sx={{padding: '15px', textAlign: "center"}} elevation={2} id="score-card">
                        <Stack display={"flex"} direction="row" spacing={1} alignItems="center" justifyContent="space-evenly">
                            <FormLabel component="legend" sx={{fontSize: "24px"}}>Score</FormLabel>
                            <span style={{fontSize: "64px", fontWeight: "bold"}}>{score}</span>
                            <FormLabel component="legend" sx={{marginTop: 5}}>Mistakes</FormLabel>
                            <span style={{fontSize: "24px"}}>{mistakes}</span>
                        </Stack>
                    </Paper>                     
                </Box>}
                <Box sx={{marginTop: 6, textAlign: "center"}}>
                    {!startLearning && <Button size="large" sx={{fontSize: "21px"}} variant="contained" onClick={startHandler}>Start</Button>}
                    {startLearning && <Button size="large" sx={{fontSize: "21px"}} variant="contained" onClick={stopHandler}>Stop</Button>}
                </Box>
            </Box>
        </Stack>
        </>
    );
}