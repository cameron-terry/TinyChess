class FenHandler {
    constructor() {
        this.fen = "";
    }
    /**
     * Create a FEN of the current game state.
     */
    createFen(board) {
        var current_fen = "";
        var rank = 0;
        for (var i = 0; i < board.area.length; i++) {
            var sq = board.area[i];

            if (!sq.offboard) {
                switch (sq.piece) {
                    case PIECES.EMPTY:
                        current_fen += "-";
                        break;
                    case PIECES.KING:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += "K";
                        } else {
                            current_fen += "k";
                        }
                        break;
                    case PIECES.ROOK:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += "R";
                        } else {
                            current_fen += "r";
                        }
                        break;
                    case PIECES.KNIGHT:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += "N";
                        } else {
                            current_fen += "n";
                        }
                        break;
                    case PIECES.BISHOP:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += "B";
                        } else {
                            current_fen += "b";
                        }
                        break;
                    case PIECES.PAWN:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += "P";
                        } else {
                            current_fen += "p";
                        }
                        break;
                    case PIECES.QUEEN:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += "Q";
                        } else {
                            current_fen += "q";
                        }
                        break;
                    default:
                        break;
                }
                rank += 1;

                if (rank % 4 == 0) {
                    current_fen += "/";
                }
            }
        }

        // remove last "/"
        current_fen = current_fen.slice(0, -1);
        // change - to 1, 2, etc
        current_fen = replaceAll(current_fen, "----", "4");
        current_fen = replaceAll(current_fen, "---", "3");
        current_fen = replaceAll(current_fen, "--", "2");
        current_fen = replaceAll(current_fen, "-", "1");
        this.fen = current_fen;

        return this.fen;
    }
}