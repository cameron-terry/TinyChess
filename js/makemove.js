/**
 * @file MakeMove
 * @author Cameron Terry <cwterry314@gmail.com>
 * @version 0.1
 */

/**
 * Moves the piece on the gui if possible.
 * @param {string} from - the square name to move from (note from is lowercase)
 * @param {string} to - the square name to move to (note to is lowercase)
 * @returns if the move can be made on the gui
 */
function makeMove(from, to, debug = false) {
  // convert so they can be searched in SQUARES
  from = SQUARES[from.toUpperCase()];
  to = SQUARES[to.toUpperCase()];

  var promoted = false; // check for promotion later

  /* check for promotion */
  if (gameBoard.side == COLORS.WHITE) {
    // is pawn advancing to opponent's first rank?
    if (
      (to == SQUARES.A6 ||
        to == SQUARES.B6 ||
        to == SQUARES.C6 ||
        to == SQUARES.D6) &&
      gameBoard.area[from].piece == PIECES.PAWN &&
      gameBoard.area[from].color == COLORS.WHITE
    ) {
      promoted = movePiece(from, to, gameBoard);

      if (promoted) {
        gameBoard.area[to].piece = PIECES.QUEEN;
        gameBoard.area[to].color = COLORS.WHITE;
        updateBoard();
        gameBoard.createFen();
        updateFenGUI();
        if (debug) gameBoard.printBoard();
        gameBoard.fiftymove = 0;

        gameBoard.checkState();

        if (gameBoard.gameOver) {
          gameBoard.side = -1;
        } else {
          gameBoard.side ^= 1;
          // look for check
          if (gameBoard.inCheck()) {
            // find king square on board
            var found_king = false;
            for (var i = 0; i < gameBoard.area.length; i++) {
              found_king =
                gameBoard.area[i].piece == PIECES.KING &&
                gameBoard.area[i].color == gameBoard.side;

              if (found_king) {
                var sq_name = "#" + gameBoard.printSq(i);
                if (gameBoard.side == COLORS.WHITE) {
                  $(sq_name).attr("src", "img/wK_check.png");
                } else {
                  $(sq_name).attr("src", "img/bK_check.png");
                }
              }
            }
          }
        }

        return true;
      }
    }
  } else {
    // is pawn advancing to opponent's first rank?
    if (
      (to == SQUARES.A1 ||
        to == SQUARES.B1 ||
        to == SQUARES.C1 ||
        to == SQUARES.D1) &&
      gameBoard.area[from].piece == PIECES.PAWN &&
      gameBoard.area[from].color == COLORS.BLACK
    ) {
      promoted = movePiece(from, to, gameBoard);

      if (promoted) {
        gameBoard.area[to].piece = PIECES.QUEEN;
        gameBoard.area[to].color = COLORS.BLACK;
        updateBoard();
        gameBoard.createFen();
        updateFenGUI();
        if (debug) gameBoard.printBoard();
        gameBoard.fiftymove = 0;

        gameBoard.checkState();

        if (gameBoard.gameOver) {
          gameBoard.side = -1;
        } else {
          gameBoard.side ^= 1;
          // look for check
          if (gameBoard.inCheck()) {
            // find king square on board
            var found_king = false;
            for (var i = 0; i < gameBoard.area.length; i++) {
              found_king =
                gameBoard.area[i].piece == PIECES.KING &&
                gameBoard.area[i].color == gameBoard.side;

              if (found_king) {
                var sq_name = "#" + gameBoard.printSq(i);
                if (gameBoard.side == COLORS.WHITE) {
                  $(sq_name).attr("src", "img/wK_check.png");
                } else {
                  $(sq_name).attr("src", "img/bK_check.png");
                }
              }
            }
          }
        }

        return true;
      }
    }
  }

  /* normal move */
  if (!promoted) {
    var possible_moves = [];

    var sq = gameBoard.area[from];
    var p_move = [];

    if (sq.piece != PIECES.EMPTY && sq.color == gameBoard.side) {
      var p_move = [];
      if (!sq.offboard) {
        p_move = gameBoard.createMoves(from, sq.piece);
        if (p_move.length > 0) {
          for (var m in p_move) {
            possible_moves.push(p_move[m]);
          }
        }
      }
    }

    gameBoard.moves = possible_moves;

    //        console.log('making move from ' + from + ' to ' + to + '.');

    if (gameBoard.moves.length > 0) {
      for (var move in gameBoard.moves) {
        if (move.length > 0) {
          try {
            if (
              gameBoard.moves[move][0] == from &&
              gameBoard.moves[move][1] == to
            ) {
              var captured_piece = gameBoard.area[to].piece;
              var piece_moved = movePiece(from, to, gameBoard);

              if (piece_moved) {
                // is it a capture?
                if (captured_piece != PIECES.EMPTY) {
                  gameBoard.fiftymove = 0;
                }

                updateBoard();
                gameBoard.createFen();
                updateFenGUI();
                if (debug) gameBoard.printBoard();

                gameBoard.checkState();

                if (gameBoard.gameOver) {
                  gameBoard.side = -1;
                } else {
                  gameBoard.side ^= 1;
                  // look for check
                  if (gameBoard.inCheck()) {
                    // find king square on board
                    var found_king = false;
                    for (var i = 0; i < gameBoard.area.length; i++) {
                      found_king =
                        gameBoard.area[i].piece == PIECES.KING &&
                        gameBoard.area[i].color == gameBoard.side;

                      if (found_king) {
                        var sq_name = "#" + gameBoard.printSq(i);
                        if (gameBoard.side == COLORS.WHITE) {
                          $(sq_name).attr("src", "img/wK_check.png");
                        } else {
                          $(sq_name).attr("src", "img/bK_check.png");
                        }
                      }
                    }
                  }
                }

                return true;
              }
            }
          } catch (err) {
            continue;
          }
        }
      }
    } else {
      return false;
    }
  }

  return false;
}

/**
 * Moves the piece on a game board if possible.
 * @param {number} from - the square to move from
 * @param {number} to - the square to move to
 * @returns {boolean} if piece was moved
 */
function movePiece(from, to, board) {
  // save in case move is not valid
  const from_pce = board.area[from].piece;
  const from_color = board.area[from].color;
  const to_pce = board.area[to].piece;
  const to_color = board.area[to].color;

  board.area[from].piece = PIECES.EMPTY;
  board.area[from].color = COLORS.NONE;
  board.area[to].piece = from_pce;
  board.area[to].color = board.side;

  //    console.log("in check: " + board.inCheck() + ", side white: " + (board.side == COLORS.WHITE));
  if (board.inCheck()) {
    takeMove(from, to, from_pce, to_pce, from_color, to_color, board);
    return false;
  }

  return true;
}

function takeMove(from, to, from_pce, to_pce, from_color, to_color, board) {
  board.area[to].piece = to_pce;
  board.area[from].piece = from_pce;
  board.area[from].color = from_color;
  board.area[to].color = to_color;
}
