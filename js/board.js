/**
 * @file Board
 * @author Cameron Terry <cwterry314@gmail.com>
 * @version 0.1
 */

// TODO: refactor this file! imo it's too large & hard to debug. separate files
// TODO: add a way to uniquely define each position across all games. (use board position?)
// TODO: rewrite check / possible moves code? possible bug when ai is implemented
// TODO: write helper code to find all pieces of a given side

class GameState {
  /**
   * The GameState definition.
   * GameStates are used to hold the state of the board at a certain point in the game.
   */
  constructor() {
    /*
     * @name GameState#board - the current state of the board
     * @type Square[]
     */
    this.board = [];
    /*
     * @name GameState#fen - the current fen of the board
     * @type string[]
     */
    this.fen = [];
    /*
     * @name GameState#fen - the current fen of the board
     * @type string
     * @default "no_move"
     */
    this.move = "no_move";
  }
}

class Square {
  /**
   * The Square definition.
   * @param {number} piece - the type of piece to occupy the square.
   * Note that the piece type is an integer (see {@link defs.js})
   * and that by default a square is considered offboard and no color/side controls it.
   */
  constructor(piece) {
    /**
     * @name Square#offboard - is the square offboard?
     * @type boolean
     * @default true
     */
    this.offboard = true;
    /**
     * @name Square#piece - the piece controlling the square
     * @type number
     */
    this.piece = piece;
    /**
     * @name Square#color - the side controlling the square
     * @type number
     * @default COLORS.NONE
     */
    this.color = COLORS.NONE;
  }
}

class Board {
  /**
   * The Board definition.
   */
  constructor() {
    // will hold GameStates
    this.game = [];
    /**
     * @name Board#area - the size of the board (including offboard squares)
     * @type Square[]
     */
    this.area = new Array(48); // board is 4 * 6 plus a border of 1 of offboard squares all around -- 4 * 6 + (4*6) = 48
    /**
     * @name Board#boardStates - all of the board states thus far
     * @type Square[]
     */
    this.boardStates = [];
    /**
     * @name Board#side - the side to move
     * @type number
     * @default COLORS.WHITE
     */
    this.side = COLORS.WHITE;
    /**
     * @name Board#moves - current list of possible moves
     * @type number[]
     */
    this.moves = [];
    /**
     * @name Board#fen - the FEN of the current game state
     * @type boolean
     */
    this.fen = "";
    /**
     * @name Board#fiftymove - the current progress towards the fifty move rule
     */
    this.fiftymove = 0;
    /**
     * @name Board#movelist - the list of moves made
     */
    this.move_list = [];
    /**
     * @name Board#gameOver - is the game over?
     * @type boolean
     * @default false
     */
    this.gameOver = false;

    /* set all squares offboard */
    for (var i = 0; i < this.area.length; i++) {
      this.area[i] = new Square(PIECES.EMPTY);
    }

    /* set main squares to pieces */
    for (var j = 0; j < this.area.length; j++) {
      for (var val in SQUARES) {
        /* square found in SQUARES dict (see {@link defs.js}) */
        if (SQUARES[val] == j) {
          this.area[j].offboard = false;

          /* populate square if needed */
          switch (j) {
            case SQUARES.A1:
              this.area[j].piece = PIECES.ROOK;
              this.area[j].color = COLORS.WHITE;
              break;
            case SQUARES.A2:
              this.area[j].piece = PIECES.PAWN;
              this.area[j].color = COLORS.WHITE;
              break;
            case SQUARES.A5:
              this.area[j].piece = PIECES.PAWN;
              this.area[j].color = COLORS.BLACK;
              break;
            case SQUARES.A6:
              this.area[j].piece = PIECES.ROOK;
              this.area[j].color = COLORS.BLACK;
              break;
            case SQUARES.B1:
              this.area[j].piece = PIECES.KNIGHT;
              this.area[j].color = COLORS.WHITE;
              break;
            case SQUARES.B2:
              this.area[j].piece = PIECES.PAWN;
              this.area[j].color = COLORS.WHITE;
              break;
            case SQUARES.B5:
              this.area[j].piece = PIECES.PAWN;
              this.area[j].color = COLORS.BLACK;
              break;
            case SQUARES.B6:
              this.area[j].piece = PIECES.KNIGHT;
              this.area[j].color = COLORS.BLACK;
              break;
            case SQUARES.C1:
              this.area[j].piece = PIECES.BISHOP;
              this.area[j].color = COLORS.WHITE;
              break;
            case SQUARES.C2:
              this.area[j].piece = PIECES.PAWN;
              this.area[j].color = COLORS.WHITE;
              break;
            case SQUARES.C5:
              this.area[j].piece = PIECES.PAWN;
              this.area[j].color = COLORS.BLACK;
              break;
            case SQUARES.C6:
              this.area[j].piece = PIECES.BISHOP;
              this.area[j].color = COLORS.BLACK;
              break;
            case SQUARES.D1:
              this.area[j].piece = PIECES.KING;
              this.area[j].color = COLORS.WHITE;
              break;
            case SQUARES.D2:
              this.area[j].piece = PIECES.PAWN;
              this.area[j].color = COLORS.WHITE;
              break;
            case SQUARES.D5:
              this.area[j].piece = PIECES.PAWN;
              this.area[j].color = COLORS.BLACK;
              break;
            case SQUARES.D6:
              this.area[j].piece = PIECES.KING;
              this.area[j].color = COLORS.BLACK;
              break;
            default:
              break;
          }
        }
      }
    }

    this.createFen();
  }

  /**
   * Adds a new GameState to the game array.
   */
  addNewBoardState() {
    this.boardStates.push(this.fen);

    var state = new GameState();

    var board = JSON.parse(JSON.stringify(this.area)); // deep copying is kinda annoying in js

    state.board = Object.assign({}, board);

    state.fen = this.fen;

    // TODO: note, [--.length] decreases the array by 1

    this.game.push(state);
  }

  boardFromFen(fen) {
    var i = SQUARES.A6;

    for (var letter = 0; letter < fen.length; letter++) {
      var current_letter = fen[letter];

      switch (current_letter) {
        case "P":
          this.area[i].piece = PIECES.PAWN;
          this.area[i].color = COLORS.WHITE;
          break;
        case "R":
          this.area[i].piece = PIECES.ROOK;
          this.area[i].color = COLORS.WHITE;
          break;
        case "N":
          this.area[i].piece = PIECES.KNIGHT;
          this.area[i].color = COLORS.WHITE;
          break;
        case "B":
          this.area[i].piece = PIECES.BISHOP;
          this.area[i].color = COLORS.WHITE;
          break;
        case "K":
          gameBoard.area[i].piece = PIECES.KING;
          gameBoard.area[i].color = COLORS.WHITE;
          break;
        case "Q":
          this.area[i].piece = PIECES.QUEEN;
          this.area[i].color = COLORS.WHITE;
          break;
        case "p":
          this.area[i].piece = PIECES.PAWN;
          this.area[i].color = COLORS.BLACK;
          break;
        case "r":
          this.area[i].piece = PIECES.ROOK;
          this.area[i].color = COLORS.BLACK;
          break;
        case "n":
          this.area[i].piece = PIECES.KNIGHT;
          this.area[i].color = COLORS.BLACK;
          break;
        case "b":
          this.area[i].piece = PIECES.BISHOP;
          this.area[i].color = COLORS.BLACK;
          break;
        case "k":
          this.area[i].piece = PIECES.KING;
          this.area[i].color = COLORS.BLACK;
          break;
        case "q":
          this.area[i].piece = PIECES.QUEEN;
          this.area[i].color = COLORS.BLACK;
          break;
        case "1":
          this.area[i].piece = PIECES.EMPTY;
          this.area[i].color = COLORS.NONE;
          break;
        case "2":
          for (var j = 0; j < 2; j++) {
            if (!this.area[i + j].offboard) {
              this.area[i + j].piece = PIECES.EMPTY;
              this.area[i + j].color = COLORS.NONE;
            } else {
              throw "Something went wrong parsing the FEN.";
            }
          }
          i += 1;
          break;
        case "3":
          for (var j = 0; j < 3; j++) {
            if (!gameBoard.area[i + j].offboard) {
              this.area[i + j].piece = PIECES.EMPTY;
              this.area[i + j].color = COLORS.NONE;
            } else {
              throw "Something went wrong parsing the FEN.";
            }
          }
          i += 2;
          break;
        case "4":
          for (var j = 0; j < 4; j++) {
            if (!this.area[i + j].offboard) {
              this.area[i + j].piece = PIECES.EMPTY;
              this.area[i + j].color = COLORS.NONE;
            } else {
              throw "Something went wrong parsing the FEN.";
            }
          }
          i += 3;
          break;
        case "/":
          i += 1;
          break;
        default:
          throw "Input not recognized.";
          valid_input = false;
          break;
      }
      i++;
    }
  }

  /**
   * Create a FEN of the current game state.
   */
  createFen() {
    var current_fen = "";
    var rank = 0;
    for (var i = 0; i < this.area.length; i++) {
      var sq = this.area[i];

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
  }

  /*
   * Gets the number of available squares to move to for each side
   *
   */
  getMobility() {}

  /*
   * Gets the number of pieces being attacked
   *
   */
  getPiecesAttacked() {
    return squaresAttacked();
  }

  /*
   * Gets the number of pieces attacking another piece
   *
   */
  getPiecesAttacking() {
    this.side ^= 1;
    var sq_attacking = squaresAttacked();
    this.side ^= 1;
    return sq_attacking;
  }

  /*
   * Gets the material count for a given side.
   * Pawn is 1, Knight / Bishop are 3, Rook is 5, Queen is 9
   */
  getMaterialCount() {
    var score = 0;

    for (var i = 0; i < this.area.length; i++) {
      if (this.area[i].color == COLORS.WHITE) {
        switch (this.area[i].piece) {
          case PIECES.PAWN:
            score += SCORES.PAWN;
            break;
          case PIECES.KNIGHT:
            score += SCORES.KNIGHT;
            break;
          case PIECES.BISHOP:
            score += SCORES.BISHOP;
            break;
          case PIECES.ROOK:
            score += SCORES.ROOK;
            break;
          case PIECES.QUEEN:
            score += SCORES.QUEEN;
            break;
          case PIECES.KING:
            score += SCORES.KING;
            break;
          default:
            break;
        }
      } else if (this.area[i].color == COLORS.BLACK) {
        switch (this.area[i].piece) {
          case PIECES.PAWN:
            score -= SCORES.PAWN;
            break;
          case PIECES.KNIGHT:
            score -= SCORES.KNIGHT;
            break;
          case PIECES.BISHOP:
            score -= SCORES.BISHOP;
            break;
          case PIECES.ROOK:
            score -= SCORES.ROOK;
            break;
          case PIECES.QUEEN:
            score -= SCORES.QUEEN;
            break;
          case PIECES.KING:
            score -= SCORES.KING;
            break;
          default:
            break;
        }
      }
    }

    return score;
  }

  /**
   * Creates a list of all of the spaces a given piece for the current side can move to.
   * @param {number} sq - the square to observe
   * @param {number} piece - the piece to find moves for (see {@link defs.js})
   * @return list of possible moves
   */
  createMoves(sq, piece) {
    var possible_moves = []; // holds the possible moves and later unique captures as well
    var to_sq = 0; // the square to move to
    this.moves = []; // reset all moves found so far (needed when createMoves() is called in a loop and the result is stored in this.moves)

    var free_to_move = false; // used to separate logic from if statement for easier reading
    var is_offboard = false; // used in place of this.area[foo].offboard

    switch (piece) {
      case PIECES.KING:
        for (var dir = 0; dir < MOVEMENTS.KING.length; dir++) {
          to_sq = sq + MOVEMENTS.KING[dir];

          free_to_move =
            this.area[to_sq].piece == PIECES.EMPTY ||
            (this.area[to_sq].color == this.side) ^ 1;
          is_offboard = this.area[to_sq].offboard;

          if (!is_offboard && free_to_move) {
            possible_moves.push([sq, to_sq]);
          }
        }
        break;
      case PIECES.ROOK:
        // keep moving in in the same direction until a piece is found
        for (var dir = 0; dir < MOVEMENTS.ROOK.length; dir++) {
          to_sq = sq;

          do {
            to_sq += MOVEMENTS.ROOK[dir];

            is_offboard = this.area[to_sq].offboard;

            if (!is_offboard && this.area[to_sq].piece == PIECES.EMPTY) {
              possible_moves.push([sq, to_sq]);
            } else if ((this.area[to_sq].color == this.side) ^ 1) {
              // found a capture
              possible_moves.push([sq, to_sq]);
              break; // have to stop, can't go past other pieces!
            } else if (this.area[to_sq].color == this.side) {
              break;
            }
          } while (!is_offboard);
        }
        break;
      case PIECES.KNIGHT:
        for (var dir = 0; dir < MOVEMENTS.KNIGHT.length; dir++) {
          to_sq = sq + MOVEMENTS.KNIGHT[dir];

          is_offboard =
            this.area[to_sq] != undefined && !this.area[to_sq].offboard;
          // special case for knight due to the statement above -- is_offboard is actually is_not_offboard
          if (is_offboard) {
            free_to_move =
              this.area[to_sq].piece == PIECES.EMPTY ||
              (this.area[to_sq].color == this.side) ^ 1;
            if (free_to_move) {
              possible_moves.push([sq, to_sq]);
            }
          }
        }
        break;
      case PIECES.BISHOP:
        // keep moving in in the same direction until a piece is found
        for (var dir = 0; dir < MOVEMENTS.BISHOP.length; dir++) {
          to_sq = sq;
          do {
            to_sq += MOVEMENTS.BISHOP[dir];

            is_offboard = this.area[to_sq].offboard;

            if (!is_offboard && this.area[to_sq].piece == PIECES.EMPTY) {
              possible_moves.push([sq, to_sq]);
            } else if ((this.area[to_sq].color == this.side) ^ 1) {
              // found a capture
              possible_moves.push([sq, to_sq]);
              break; // have to stop, can't go past other pieces!
            } else if (this.area[to_sq].color == this.side) {
              break;
            }
          } while (!is_offboard);
        }
        break;
      case PIECES.PAWN:
        var sq_is_on_white_start =
          (sq == SQUARES.A2 ||
            sq == SQUARES.B2 ||
            sq == SQUARES.C2 ||
            sq == SQUARES.D2) &&
          this.side == COLORS.WHITE;
        var sq_is_on_black_start =
          (sq == SQUARES.A5 ||
            sq == SQUARES.B5 ||
            sq == SQUARES.C5 ||
            sq == SQUARES.D5) &&
          this.side == COLORS.BLACK;

        if (sq_is_on_white_start) {
          for (var dir = 0; dir < MOVEMENTS.PAWN.length; dir++) {
            // pawns only move one way -- forward!
            if (MOVEMENTS.PAWN[dir] == -12) {
              if (this.area[sq - 6].piece != PIECES.EMPTY) {
                break;
              }
            }

            to_sq = sq + MOVEMENTS.PAWN[dir];

            free_to_move = this.area[to_sq].piece == PIECES.EMPTY;
            is_offboard = this.area[to_sq].offboard;

            if (!is_offboard && free_to_move) {
              possible_moves.push([sq, to_sq]);
            }
          }
        } else if (sq_is_on_black_start) {
          for (var dir = 0; dir < MOVEMENTS.PAWN.length; dir++) {
            if (MOVEMENTS.PAWN[dir] == -12) {
              if (this.area[sq + 6].piece != PIECES.EMPTY) {
                break;
              }
            }

            // pawns only move one way -- forward!
            to_sq = sq - MOVEMENTS.PAWN[dir];

            free_to_move = this.area[to_sq].piece == PIECES.EMPTY;
            is_offboard = this.area[to_sq].offboard;

            if (!is_offboard && free_to_move) {
              possible_moves.push([sq, to_sq]);
            }
          }
        } else {
          if (this.side == COLORS.WHITE) {
            to_sq = sq + MOVEMENTS.PAWN[0];
          } else {
            to_sq = sq - MOVEMENTS.PAWN[0];
          }

          free_to_move = this.area[to_sq].piece == PIECES.EMPTY;
          is_offboard = this.area[to_sq].offboard;

          if (!is_offboard && free_to_move) {
            possible_moves.push([sq, to_sq]);
          }
        }

        break;
      case PIECES.QUEEN:
        // keep moving in in the same direction until a piece is found
        for (var dir = 0; dir < MOVEMENTS.QUEEN.length; dir++) {
          to_sq = sq;

          do {
            to_sq += MOVEMENTS.QUEEN[dir];
            is_offboard = this.area[to_sq].offboard;
            if (!is_offboard && this.area[to_sq].piece == PIECES.EMPTY) {
              possible_moves.push([sq, to_sq]);
            } else if ((this.area[to_sq].color == this.side) ^ 1) {
              // found a capture
              possible_moves.push([sq, to_sq]);
              break; // have to stop, can't go past other pieces!
            } else if (this.area[to_sq].color == this.side) {
              break;
            }
          } while (!is_offboard);
        }
        break;
      default:
        break;
    }

    possible_moves = this.createCaptures(sq, piece, possible_moves);
    return possible_moves;
  }

  /**
   * Adds captures to a given list of moves.
   * @param {number} sq - the square to observe
   * @param {number} piece - the piece to find moves for (see {@link defs.js})
   * @param {number[]} possible_moves - a list of possible moves
   * @return a list of possible moves + unique captures
   */
  createCaptures(sq, piece, possible_moves) {
    var to_sq = 0; // the square to move to
    var is_offboard = false; // used in place of this.area[foo].offboard
    var square_color = this.area[sq].color; // color of controlled square
    var to_square_color = -1; // color of square to move to

    switch (piece) {
      case PIECES.PAWN:
        if (square_color == COLORS.WHITE) {
          to_sq = sq - 5;
        } else if (square_color == COLORS.BLACK) {
          to_sq = sq + 5;
        }

        is_offboard = this.area[to_sq].offboard;
        to_square_color = this.area[to_sq].color;

        if (this.side == COLORS.WHITE) {
          if (!is_offboard && to_square_color == COLORS.BLACK) {
            possible_moves.push([sq, to_sq]);
          }
        } else {
          if (!is_offboard && to_square_color == COLORS.WHITE) {
            possible_moves.push([sq, to_sq]);
          }
        }

        if (square_color == COLORS.WHITE) {
          to_sq = sq - 7;
        } else if (square_color == COLORS.BLACK) {
          to_sq = sq + 7;
        }

        is_offboard = this.area[to_sq].offboard;
        to_square_color = this.area[to_sq].color;

        if (this.side == COLORS.WHITE) {
          if (!is_offboard && to_square_color == COLORS.BLACK) {
            possible_moves.push([sq, to_sq]);
          }
        } else {
          if (!is_offboard && to_square_color == COLORS.WHITE) {
            possible_moves.push([sq, to_sq]);
          }
        }

        break;
      default:
        break;
    }

    return possible_moves;
  }
  /**
   * Generates a list of moves for the side to move.
   */
  generateMoveList() {
    var move_list = [];
    for (var i = 0; i < this.area.length; i++) {
      var sq = this.area[i];

      if (!sq.offboard) {
        var move = null;
        if (!sq.piece == PIECES.EMPTY && sq.color == this.side) {
          move = this.createMoves(i, sq.piece);

          if (move.length > 0) {
            for (var j = 0; j < move.length; j++) {
              var from = this.area[move[j][0]];
              var to = this.area[move[j][1]];

              if (!from.offboard && !to.offboard) {
                // make sure move doesn't put player in check
                var from_pce = from.piece;
                var from_color = from.color;
                var to_pce = to.piece;
                var to_color = to.color;

                var pce_moved = movePiece(move[j][0], move[j][1], this);

                if (pce_moved) {
                  takeMove(
                    move[j][0],
                    move[j][1],
                    from_pce,
                    to_pce,
                    from_color,
                    to_color,
                    this
                  );
                  move_list.push(move[j]);
                }
              }
            }
          }
        }
      }
    }

    return move_list;
  }

  /**
   * Check to see which squares are attacked by the opposing side.
   * @return which squares are attacked
   */
  squaresAttacked() {
    this.side ^= 1;
    var move_list = generateMoveList();
    this.side ^= 1;

    var squares_attacked = [];

    if (move_list.length > 0) {
      for (var move in move_list) {
        squares_attacked.push(move_list[move][1]);
      }
    }

    return squares_attacked;
  }

  /**
   * Find where the king is.
   * Used as a helper function in mate detection, etc
   */
  findKingSq(side) {
    var king_sq = null;
    for (var i = 0; i < this.area.length; i++) {
      // find the king
      if (this.area[i].piece == PIECES.KING && this.area[i].color == side) {
        king_sq = i;
      }
    }
    return king_sq;
  }

  /**
   * Checks to see if a given square is attacked by the opposing side.
   * @return if square is attacked by opposing side
   */
  sqAttacked(to_sq) {
    // check opponent's moves
    this.side ^= 1;

    var possible_moves = [];

    for (var i = 0; i < this.area.length; i++) {
      var sq = this.area[i];

      if (!sq.offboard) {
        var p_move = []; // holds the current move list for a given piece

        // found a piece
        if (!sq.piece == PIECES.EMPTY && sq.color == this.side) {
          p_move = this.createMoves(i, sq.piece);

          if (p_move.length > 0) {
            for (var m in p_move) {
              possible_moves.push(p_move[m]);
            }
          }
        }
      }
    }

    this.side ^= 1;

    // check to see if opponent can move to square
    for (var move in possible_moves) {
      if (possible_moves[move][1] == to_sq) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks to see if given side is in check.
   * @return if given side is in check
   */
  inCheck() {
    var king_sq = this.findKingSq(this.side);

    return this.sqAttacked(king_sq);
  }

  // TODO: stalemate
  /**
   * Check mate detection.
   */
  isMate() {
    var p_move = []; // used to temporarily hold possible moves
    var squares_attacked = []; // used to hold all squares attacked
    var attacking_piece_sqs = []; // used to hold all attacked squares by attacking piece
    var king_can_move = false; // used to check king's mobility
    var king_is_mated = true; // used to assert final board position
    var attacking_piece = -1; // used to find the piece threatening mate
    var to_sq = 0; // used to temporarily hold squares for movement

    var att_pce = -1; // used to hold the attacking piece permanently

    // check for mate
    if (this.side == COLORS.BLACK) {
      // find white king square
      var king_sq = this.findKingSq(COLORS.WHITE);

      // see if white is in check
      this.side = COLORS.WHITE;

      if (this.inCheck()) {
        // find which piece is attacking the white king
        var found_black_piece = false;
        for (var j = 0; j < this.area.length; j++) {
          found_black_piece =
            this.area[j].piece != PIECES.EMPTY &&
            this.area[j].color == COLORS.BLACK;

          if (found_black_piece) {
            this.side = COLORS.BLACK;
            // look for attacking piece
            switch (this.area[j].piece) {
              case PIECES.KING:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;

              case PIECES.ROOK:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;

              case PIECES.KNIGHT:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;

              case PIECES.BISHOP:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;
              // possible cause of bug where king cannot move to safe square even though it is -- this.createCaptures was this.createMoves
              case PIECES.PAWN:
                p_move = this.createCaptures(j, this.area[j].piece, p_move);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;

              case PIECES.QUEEN:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;
            }

            if (attacking_piece != -1) {
              p_move = this.createMoves(j, this.area[j].piece);
              if (p_move.length > 0) {
                for (var move in p_move) {
                  attacking_piece_sqs.push(p_move[move][1]);
                }
              }

              // possible bug explained in white section
              attacking_piece = -1;
            }
          }
        }

        this.side = COLORS.WHITE;
        var to_sq = 0;
        var square_safe = -1;

        var king_moves = this.createMoves(king_sq, PIECES.KING);

        // see if king can move to non-attacked square
        if (king_moves.length > 0) {
          var king_to = -2;
          for (var move = 0; move < king_moves.length; move++) {
            king_to = king_moves[move][1];
            square_safe = squares_attacked.indexOf(king_to);

            // if so then king is not mated
            if (square_safe == -1) {
              var to_pce = this.area[king_to].piece;
              var to_color = this.area[king_to].color;
              var piece_moved = movePiece(king_sq, king_to, this);
              if (piece_moved) {
                if (!this.inCheck()) {
                  king_can_move = true;
                  king_is_mated = false;
                  // possible bug -- was COLORS.BLACK: shouldn't it be the white king that is moved back?
                  takeMove(
                    king_sq,
                    king_to,
                    PIECES.KING,
                    to_pce,
                    COLORS.WHITE,
                    to_color,
                    this
                  );
                  break;
                }
                // take it back in case in check could be the source of the bug where king moves regardless of how check is avoided
                takeMove(
                  king_sq,
                  king_to,
                  PIECES.KING,
                  to_pce,
                  COLORS.WHITE,
                  to_color,
                  this
                );
              }
            }
          }
        }

        // if king cannot find a safe square
        if (!king_can_move) {
          var found_white_piece = false;
          // for piece on white side
          for (var k = 0; k < this.area.length; k++) {
            found_white_piece =
              this.area[k].piece != PIECES.EMPTY &&
              this.area[k].color == COLORS.WHITE &&
              this.area[k].piece != PIECES.KING;
            if (found_white_piece) {
              // move to see if piece can block the attack
              p_move = this.createMoves(k, this.area[k].piece);

              if (p_move.length > 0) {
                var defending_square = -2;
                for (var move = 0; move < p_move.length; move++) {
                  defending_square = p_move[move][1];
                  // add to square to squares_attacked
                  if (attacking_piece_sqs.indexOf(defending_square) != -1) {
                    // make sure piece blocks path of check
                    var from_pce = this.area[k].piece;
                    var from_color = this.area[k].color;
                    var piece_moved = movePiece(k, defending_square, this);
                    if (piece_moved) {
                      if (!this.inCheck()) {
                        king_is_mated = false;
                        // move back -- piece moved to an empty square
                        takeMove(
                          k,
                          defending_square,
                          from_pce,
                          PIECES.EMPTY,
                          from_color,
                          COLORS.NONE,
                          this
                        );
                        break;
                      }
                      // again, this was inside !this.inCheck() -- could be source of check bug
                      takeMove(
                        k,
                        defending_square,
                        from_pce,
                        PIECES.EMPTY,
                        from_color,
                        COLORS.NONE,
                        this
                      );
                    }
                  }
                  // see if the piece can be captured
                  if (defending_square == att_pce) {
                    king_is_mated = false;
                    break;
                  }
                }
              }
            }
          }
        }

        this.gameOver = king_is_mated ? true : false;
      } else {
        this.gameOver = false;
      }
      this.side = COLORS.BLACK;
    } else if (this.side == COLORS.WHITE) {
      // find black king square
      var king_sq = this.findKingSq(COLORS.BLACK);

      // see if opponent is in check
      this.side = COLORS.BLACK;

      if (this.inCheck()) {
        // find which piece is attacking the king as well as squares attacked
        var found_white_piece = false;
        for (var j = 0; j < this.area.length; j++) {
          found_white_piece =
            this.area[j].piece != PIECES.EMPTY &&
            this.area[j].color == COLORS.WHITE;

          if (found_white_piece) {
            // look for attacking piece
            this.side = COLORS.WHITE;

            switch (this.area[j].piece) {
              case PIECES.KING:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;

              case PIECES.ROOK:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;

              case PIECES.KNIGHT:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;

              case PIECES.BISHOP:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;
              // as in the black case, this.createMoves might be causing safe square bug
              case PIECES.PAWN:
                p_move = this.createCaptures(j, this.area[j].piece, p_move);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;

              case PIECES.QUEEN:
                p_move = this.createMoves(j, this.area[j].piece);
                if (p_move.length > 0) {
                  for (var move in p_move) {
                    if (p_move[move][1] == king_sq) {
                      attacking_piece = this.area[j].piece;
                      att_pce = j;
                    }
                    squares_attacked.push(p_move[move][1]);
                  }
                }
                break;
            }

            // the attacking piece has been found
            if (attacking_piece != -1) {
              p_move = this.createMoves(j, this.area[j].piece);
              if (p_move.length > 0) {
                for (var move in p_move) {
                  attacking_piece_sqs.push(p_move[move][1]);
                }
              }
              /* possible bug -- attacking piece was not reset after finding.
                               since this loop continues to find all attacked squares, the attacking piece needs
                               to be reset so no other attacking squares are accidentally added.

                               this loop could probably be better suited as its own function, honestly
                               */
              attacking_piece = -1;
            }
          }
        }

        this.side = COLORS.BLACK;
        var to_sq = 0;
        var square_safe = -1;

        var king_moves = this.createMoves(king_sq, PIECES.KING);

        // see if king can move to non-attacked square
        if (king_moves.length > 0) {
          var king_to = -2;
          for (var move = 0; move < king_moves.length; move++) {
            king_to = king_moves[move][1];
            square_safe = squares_attacked.indexOf(king_to);

            // if so then king is not mated
            if (square_safe == -1) {
              var to_pce = this.area[king_to].piece;
              var to_color = this.area[king_to].color;
              // not moving to a black-occupied square
              if (to_color != COLORS.BLACK) {
                var piece_moved = movePiece(king_sq, king_to, this);
                if (piece_moved) {
                  if (!this.inCheck()) {
                    king_can_move = true;
                    king_is_mated = false;
                    // possible bug -- shouldn't black king be moved back if checking for white mate?
                    takeMove(
                      king_sq,
                      king_to,
                      PIECES.KING,
                      to_pce,
                      COLORS.BLACK,
                      to_color,
                      this
                    );
                    break;
                  }
                  takeMove(
                    king_sq,
                    king_to,
                    PIECES.KING,
                    to_pce,
                    COLORS.BLACK,
                    to_color,
                    this
                  );
                }
              }
            }
          }
        }

        // if king cannot find a safe square
        if (!king_can_move) {
          var found_black_piece = false;
          // for piece on black side
          for (var k = 0; k < this.area.length; k++) {
            found_black_piece =
              this.area[k].piece != PIECES.EMPTY &&
              this.area[k].color == COLORS.BLACK &&
              this.area[k].piece != PIECES.KING;
            if (found_black_piece) {
              // move to see if piece can block the attack
              p_move = this.createMoves(k, this.area[k].piece);

              if (p_move.length > 0) {
                var defending_square = -2;
                for (var move = 0; move < p_move.length; move++) {
                  defending_square = p_move[move][1];
                  // add to square to squares_attacked
                  if (attacking_piece_sqs.indexOf(defending_square) != -1) {
                    // make sure piece blocks path of check
                    var from_pce = this.area[k].piece;
                    var from_color = this.area[k].color;
                    var piece_moved = movePiece(k, defending_square, this);
                    if (piece_moved) {
                      if (!this.inCheck()) {
                        king_is_mated = false;
                        // move back -- piece moved to an empty square
                        takeMove(
                          k,
                          defending_square,
                          from_pce,
                          PIECES.EMPTY,
                          from_color,
                          COLORS.NONE,
                          this
                        );
                        break;
                      }
                      takeMove(
                        k,
                        defending_square,
                        from_pce,
                        PIECES.EMPTY,
                        from_color,
                        COLORS.NONE,
                        this
                      );
                    }
                  }
                  // see if the piece can be captured
                  if (defending_square == att_pce) {
                    king_is_mated = false;
                    break;
                  }
                }
              }
            }
          }
        }

        this.gameOver = king_is_mated ? true : false;
      } else {
        this.gameOver = false;
      }
      this.side = COLORS.WHITE;
    } else {
      this.gameOver = true;
      this.side = -1;
      $("#fenTitle").css("background-color", "#820303");
    }
  }

  /**
   * Checks to see if the game is over.
   */
  checkState() {
    var found_state = false;

    if (!found_state) {
      // check for mate
      this.isMate();

      if (this.gameOver) {
        if (this.side == COLORS.WHITE) {
          var found_king = false;
          for (var i = 0; i < this.area.length; i++) {
            found_king =
              this.area[i].piece == PIECES.KING &&
              this.area[i].color == COLORS.BLACK;

            if (found_king) {
              var sq_name = "#" + this.printSq(i);
              $(sq_name).attr("src", "img/bK_check.png");
            }
          }
          this.side = -1;
          console.log("Game is over [White wins by checkmate]");
          playSound("end");
          setTimeout(function () {
            alert("Game is over [White wins by checkmate]");
            $(sq_name).attr("src", "img/bK_check.png");
          }, 1000);
        } else {
          var found_king = false;
          for (var i = 0; i < this.area.length; i++) {
            found_king =
              this.area[i].piece == PIECES.KING &&
              this.area[i].color == COLORS.WHITE;

            if (found_king) {
              var sq_name = "#" + this.printSq(i);
              $(sq_name).attr("src", "img/wK_check.png");
            }
          }
          this.side = -1;
          console.log("Game is over [Black wins by checkmate]");
          playSound("end");
          setTimeout(function () {
            alert("Game is over [Black wins by checkmate]");
            $(sq_name).attr("src", "img/wK_check.png");
          }, 1500);
        }

        var dom = document.getElementById("fenTitle");
        dom.style.backgroundImage =
          "-webkit-linear-gradient(top right, #af4038, #ffbcb7)";
        this.side = -1;
        found_state = true;
      }
    }

    if (!found_state) {
      // check for draw by insufficient material
      var found_material = false;
      var sq = 0;

      for (var i = 0; i < this.area.length; i++) {
        sq = this.area[i];

        if (!sq.offboard) {
          if (
            sq.piece == PIECES.ROOK ||
            sq.piece == PIECES.PAWN ||
            sq.piece == PIECES.QUEEN
          ) {
            found_material = true;
            break;
          }
        }
      }

      this.gameOver = found_material ? false : true;
      if (this.gameOver) {
        console.log("game is a draw [insufficient material]");
        playSound("end");
        setTimeout(function () {
          alert("game is a draw [insufficient material]");
        }, 1500);

        var dom = document.getElementById("fenTitle");
        dom.style.backgroundImage =
          "-webkit-linear-gradient(top right, #af4038, #ffbcb7)";

        this.side = -1;
        found_state = true;
      }
    }

    if (!found_state) {
      // check for fifty move rule (fifty moves w/o capture / promotion
      this.gameOver = this.fiftymove >= 50 ? true : false;
      if (this.gameOver) {
        found_state = true;
        this.side = -1;
      }
    }

    if (!found_state) {
      // check for three-fold repetition
      if (this.move_list.length > 5) {
        var moves_end = this.move_list.length - 1;
        var three_fold = true;
        for (var i = 0; i < 3; i++) {
          if (
            this.move_list[moves_end - i] != this.move_list[moves_end - (i + 4)]
          ) {
            three_fold = false;
          }
        }
      }

      if (three_fold) {
        this.gameOver = true;
        console.log("game is a draw [three-fold repetition]");
        playSound("end");
        setTimeout(function () {
          alert("game is a draw [three-fold repetition]");
        }, 1500);

        var dom = document.getElementById("fenTitle");
        dom.style.backgroundImage =
          "-webkit-linear-gradient(top right, #af4038, #ffbcb7)";

        this.side = -1;
        found_state = true;
      }
    }

    if (!found_state) {
      // check for stalemate
      this.side ^= 1;
      var king_sq = this.findKingSq(this.side);
      var all_moves = this.generateMoveList();
      var valid_moves = this.createMoves(king_sq, PIECES.KING);
      this.side ^= 1;
      if (valid_moves.length == 0 && all_moves.length == 0) {
        this.gameOver = true;
        console.log("game is a draw [stalemate]");
        playSound("end");
        setTimeout(function () {
          alert("game is a draw [stalemate]");
        }, 1500);

        var dom = document.getElementById("fenTitle");
        dom.style.backgroundImage =
          "-webkit-linear-gradient(top right, #af4038, #ffbcb7)";

        this.side = -1;
        found_state = true;
      }
    }
  }

  /**
   * Print the state of the board.
   */
  printBoard() {
    var board_pic = "";
    var rank = 0;
    for (var i = 0; i < this.area.length; i++) {
      var sq = this.area[i];

      if (!sq.offboard) {
        switch (sq.piece) {
          case PIECES.EMPTY:
            board_pic += "-  ";
            break;
          case PIECES.KING:
            if (sq.color == COLORS.WHITE) {
              board_pic += "K ";
            } else {
              board_pic += "k ";
            }
            break;
          case PIECES.ROOK:
            if (sq.color == COLORS.WHITE) {
              board_pic += "R ";
            } else {
              board_pic += "r ";
            }
            break;
          case PIECES.KNIGHT:
            if (sq.color == COLORS.WHITE) {
              board_pic += "N ";
            } else {
              board_pic += "n ";
            }
            break;
          case PIECES.BISHOP:
            if (sq.color == COLORS.WHITE) {
              board_pic += "B ";
            } else {
              board_pic += "b ";
            }
            break;
          case PIECES.PAWN:
            if (sq.color == COLORS.WHITE) {
              board_pic += "P ";
            } else {
              board_pic += "p ";
            }
            break;
          case PIECES.QUEEN:
            if (sq.color == COLORS.WHITE) {
              board_pic += "Q ";
            } else {
              board_pic += "q ";
            }
            break;
          default:
            break;
        }
        rank += 1;
      }
      if (rank % 4 == 0) {
        board_pic += "\n";
      }
    }

    console.log(board_pic);
  }

  /**
   * Returns a square name from location in gameBoard.area.
   * @param {number} sq - the square to find
   * @return the square (lowercase)
   */
  printSq(sq) {
    for (var val in SQUARES) {
      if (SQUARES[val] == sq) {
        return val.toLowerCase();
      }
    }
  }
}
