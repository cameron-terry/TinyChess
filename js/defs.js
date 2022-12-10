/**
 * @file Definitions
 * @author Cameron Terry <cwterry314@gmail.com>
 * @version 0.1
 */

// TODO: make values of key a list? e.g. A6: ["a6", 7]

/**
 * A mapping between square names and their index in {@link Board#area|Board.area}.
 * @enum {number}
 */
var SQUARES = {
  A6: 7,
  B6: 8,
  C6: 9,
  D6: 10,
  A5: 13,
  B5: 14,
  C5: 15,
  D5: 16,
  A4: 19,
  B4: 20,
  C4: 21,
  D4: 22,
  A3: 25,
  B3: 26,
  C3: 27,
  D3: 28,
  A2: 31,
  B2: 32,
  C2: 33,
  D2: 34,
  A1: 37,
  B1: 38,
  C1: 39,
  D1: 40,
};

/**
 * A mapping between piece names and their representation on the board.
 * @enum {number}
 */
var PIECES = {
  EMPTY: 0,
  KING: 1,
  ROOK: 2,
  KNIGHT: 3,
  BISHOP: 4,
  PAWN: 5,
  QUEEN: 6,
};

/**
 * A mapping between colors and their representation in {@link board.js}.
 * @enum {number}
 */
var COLORS = {
  WHITE: 1,
  BLACK: 0,
  NONE: 2,
};

var PIECENAMES = {
  WHITEKING: {
    color: COLORS.WHITE,
    piece: PIECES.KING,
  },
  WHITEROOK: {
    color: COLORS.WHITE,
    piece: PIECES.ROOK,
  },
  WHITEKNIGHT: {
    color: COLORS.WHITE,
    piece: PIECES.KNIGHT,
  },
  WHITEBISHOP: {
    color: COLORS.WHITE,
    piece: PIECES.BISHOP,
  },
  WHITEPAWN: {
    color: COLORS.WHITE,
    piece: PIECES.PAWN,
  },
  WHITEQUEEN: {
    color: COLORS.WHITE,
    piece: PIECES.QUEEN,
  },
  BLACKKING: {
    color: COLORS.BLACK,
    piece: PIECES.KING,
  },
  BLACKROOK: {
    color: COLORS.BLACK,
    piece: PIECES.ROOK,
  },
  BLACKKNIGHT: {
    color: COLORS.BLACK,
    piece: PIECES.KNIGHT,
  },
  BLACKBISHOP: {
    color: COLORS.BLACK,
    piece: PIECES.BISHOP,
  },
  BLACKPAWN: {
    color: COLORS.BLACK,
    piece: PIECES.PAWN,
  },
  BLACKQUEEN: {
    color: COLORS.BLACK,
    piece: PIECES.QUEEN,
  },
  EMPTY: {
    color: COLORS.NONE,
    piece: PIECES.EMPTY,
  },
};

// map starting position
var startingPosition = {
  [SQUARES.A1]: PIECENAMES.WHITEROOK,
  [SQUARES.B1]: PIECENAMES.WHITEKNIGHT,
  [SQUARES.C1]: PIECENAMES.WHITEBISHOP,
  [SQUARES.D1]: PIECENAMES.WHITEKING,
  [SQUARES.A2]: PIECENAMES.WHITEPAWN,
  [SQUARES.B2]: PIECENAMES.WHITEPAWN,
  [SQUARES.C2]: PIECENAMES.WHITEPAWN,
  [SQUARES.D2]: PIECENAMES.WHITEPAWN,
  [SQUARES.A5]: PIECENAMES.BLACKPAWN,
  [SQUARES.B5]: PIECENAMES.BLACKPAWN,
  [SQUARES.C5]: PIECENAMES.BLACKPAWN,
  [SQUARES.D5]: PIECENAMES.BLACKPAWN,
  [SQUARES.A6]: PIECENAMES.BLACKROOK,
  [SQUARES.B6]: PIECENAMES.BLACKKNIGHT,
  [SQUARES.C6]: PIECENAMES.BLACKBISHOP,
  [SQUARES.D6]: PIECENAMES.BLACKKING,
};

var fenCharacterRepresentation = {
  P: PIECENAMES.WHITEPAWN,
  N: PIECENAMES.WHITEKNIGHT,
  B: PIECENAMES.WHITEBISHOP,
  R: PIECENAMES.WHITEROOK,
  Q: PIECENAMES.WHITEQUEEN,
  K: PIECENAMES.WHITEKING,
  p: PIECENAMES.BLACKPAWN,
  n: PIECENAMES.BLACKKNIGHT,
  b: PIECENAMES.BLACKBISHOP,
  r: PIECENAMES.BLACKROOK,
  q: PIECENAMES.BLACKQUEEN,
  k: PIECENAMES.BLACKKING,
  1: PIECENAMES.EMPTY,
  2: PIECENAMES.EMPTY,
  3: PIECENAMES.EMPTY,
  4: PIECENAMES.EMPTY,
};

var pieceToFenCharacterRepresentation = {
  [PIECENAMES.WHITEPAWN]: "P",
  [PIECENAMES.WHITEKNIGHT]: "N",
  [PIECENAMES.WHITEBISHOP]: "B",
  [PIECENAMES.WHITEROOK]: "R",
  [PIECENAMES.WHITEQUEEN]: "Q",
  [PIECENAMES.WHITEKING]: "K",
  [PIECENAMES.BLACKPAWN]: "p",
  [PIECENAMES.BLACKKNIGHT]: "n",
  [PIECENAMES.BLACKBISHOP]: "b",
  [PIECENAMES.BLACKROOK]: "r",
  [PIECENAMES.BLACKQUEEN]: "q",
  [PIECENAMES.BLACKKING]: "k",
  [PIECENAMES.EMPTY]: "-",
};

/**
 * A mapping containing all directions a given piece can move in.
 * @enum {number[]}
 */
var MOVEMENTS = {
  KING: [1, -1, 6, -6, 7, -7, 5, -5],
  ROOK: [1, -1, 6, -6],
  KNIGHT: [13, -13, 8, -8, 4, -4, 11, -11],
  BISHOP: [-7, 7, -5, 5],
  PAWN: [-6, -12],
  QUEEN: [1, -1, 6, -6, 7, -7, 5, -5],
};

var SCORES = {
  PAWN: 10,
  KNIGHT: 30,
  BISHOP: 35,
  ROOK: 50,
  QUEEN: 90,
  KING: 900,
};

/**
 * replaces a given substring in a string
 * @param {string} str - the string to search
 * @param {string} find - the string to find
 * @param {string} replace - the string to replace 'find' with
 */
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

// (0 to 33) + 7 = (7 to 40) = SQUARES.A6 to SQUARES.D1
function getRandomSquare() {
  return Math.floor(Math.random() * Math.floor(34)) + 7;
}
