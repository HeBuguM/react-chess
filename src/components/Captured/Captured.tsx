import { faChessBishop, faChessKnight, faChessPawn, faChessQueen, faChessRook } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CapturedPieces, PieceType, TeamType } from "../../Constants";

interface Props {
    pieces: CapturedPieces
    showTeam: TeamType;
}

const pieceOrder = ['pawn', 'bishop', 'knight', 'rook', 'queen'];
const pieceSort = (arr:any, desiredOrder:any) => {
    const orderForIndexVals = desiredOrder.slice(0).reverse();
    arr.sort((a:any, b:any) => {
        const aIndex = -orderForIndexVals.indexOf(a);
        const bIndex = -orderForIndexVals.indexOf(b);
        return aIndex - bIndex;
    });
}

export default function Captured ({ pieces, showTeam }: Props){ 
    let score = {
        white: 0,
        black: 0
    };

    let figs: {white: JSX.Element[], black: JSX.Element[] } = {
        white: [],
        black: []
    }

    function getValue(piece:string) {
        switch (piece) {
            case PieceType.PAWN:
                return 1;
            case PieceType.KNIGHT:
            case PieceType.BISHOP:
                return 3;
            case PieceType.ROOK:
                return 5;
            case PieceType.QUEEN:
                return 9;
            default:
                return 0;
        }
    }
    
    function getFig(piece: string, last: string) {
        switch (piece) {
            case PieceType.PAWN:
                return <FontAwesomeIcon icon={faChessPawn} color={'gray'} fontSize="22px" style={{margin: `6px 0px 0px ${last !== piece ? 5 : -1}px`}}></FontAwesomeIcon>
            case PieceType.KNIGHT:
                return <FontAwesomeIcon icon={faChessKnight} color={'gray'} fontSize="22px" style={{margin: `6px 0px 0px ${last !== piece ? 5 : -1}px`}}></FontAwesomeIcon>
            case PieceType.BISHOP:
                return <FontAwesomeIcon icon={faChessBishop} color={'gray'} fontSize="22px" style={{margin: `6px 0px 0px ${last !== piece ? 5 : -1}px`}}></FontAwesomeIcon>
            case PieceType.ROOK:
                return <FontAwesomeIcon icon={faChessRook} color={'gray'} fontSize="22px" style={{margin: `6px 0px 0px ${last !== piece ? 5 : -1}px`}}></FontAwesomeIcon>
            case PieceType.QUEEN:
                return <FontAwesomeIcon icon={faChessQueen} color={'gray'} fontSize="22px" style={{margin: `6px 0px 0px ${last !== piece ? 5 : -1}px`}}></FontAwesomeIcon>
            default:
                return <></>
        }
    }

    pieceSort(pieces.white, pieceOrder);
    pieceSort(pieces.black, pieceOrder);

    let last_peace = '';
    pieces.white.forEach(piece => {
        score.white = score.white + getValue(piece);
        figs.white.push(getFig(piece,last_peace))
        last_peace = piece;
    })
    last_peace = '';
    pieces.black.forEach(piece => {
        score.black = score.black + getValue(piece);
        figs.black.push(getFig(piece,last_peace))
        last_peace = piece;
    })

    return (
        <>
            {showTeam === TeamType.WHITE && <div>
                {figs.white.map((fig,i) =>
                    <span key={i}>{fig}</span>
                )}
                {score.white-score.black > 0 &&
                    <span style={{color: 'gray'}}> +{score.white-score.black}</span>
                }
            </div>}
            {showTeam === TeamType.BLACK && <div>
                {figs.black.map((fig,i) =>
                    <span key={i}>{fig}</span>
                )}
                {score.black-score.white > 0 &&
                    <span style={{color: 'gray'}}> +{score.black-score.white}</span>
                }
            </div>}
        </>
    );
};

