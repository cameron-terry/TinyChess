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
    /** @description 7 */
    A6: 7,
    /** @description 8 */
    B6: 8,
    /** @description 9 */
    C6: 9,
    /** @description 10 */
    D6: 10,
    /** @description 13 */
    A5: 13,
    /** @description 14 */
    B5: 14,
    /** @description 15 */
    C5: 15,
    /** @description 16 */
    D5: 16,
    /** @description 19 */
    A4: 19,
    /** @description 20 */
    B4: 20,
    /** @description 21 */
    C4: 21,
    /** @description 22 */
    D4: 22,
    /** @description 25 */
    A3: 25,
    /** @description 26 */
    B3: 26,
    /** @description 27 */
    C3: 27,
    /** @description 28 */
    D3: 28,
    /** @description 31 */
    A2: 31,
    /** @description 32 */
    B2: 32,
    /** @description 33 */
    C2: 33,
    /** @description 34 */
    D2: 34,
    /** @description 37 */
    A1: 37,
    /** @description 38 */
    B1: 38,
    /** @description 39 */
    C1: 39,
    /** @description 40 */
    D1: 40
};

/**
 * A mapping between piece names and their representation on the board.
 * @enum {number}
 */
var PIECES = {
    /** @description 0 */
    EMPTY:  0,
    /** @description 1 */
    KING:   1,
    /** @description 2 */
    ROOK:   2,
    /** @description 3 */
    KNIGHT: 3,
    /** @description 4 */
    BISHOP: 4,
    /** @description 5 */
    PAWN:   5,
    /** @description 6 */
    QUEEN:  6
};

/**
 * A mapping between colors and their representation in {@link board.js}.
 * @enum {number}
 */
var COLORS = {
    /** @description 1 */
    WHITE: 1,
    /** @description 0 */
    BLACK: 0,
    /** @description 2 */
    NONE:  2
}

/**
 * A mapping containing all directions a given piece can move in.
 * @enum {number[]}
 */
var MOVEMENTS = {
    /** @description [1, -1, 6, -6, 7, -7, 5, -5] */
    KING:   [1, -1, 6, -6, 7, -7, 5, -5],
    /** @description [1, -1, 6, -6] */
    ROOK:   [1, -1, 6, -6],
    /** @description [13, -13, 8, -8, 4, -4, 11, -11] */
    KNIGHT: [13, -13, 8, -8, 4, -4, 11, -11],
    /** @description [-7, 7, -5, 5] */
    BISHOP: [-7, 7, -5, 5],
    /** @description [-6, -12] */
    PAWN:   [-6, -12],
    /** @description [1, -1, 6, -6, 7, -7, 5, -5] */
    QUEEN:  [1, -1, 6, -6, 7, -7, 5, -5]
};

/* number of games for MCTS to play per move */
var LEVELS = {
    LEVEL_0: 2500,
    LEVEL_1: 5000,
    LEVEL_2: 7500,
    LEVEL_3: 10000,
    LEVEL_4: 50000,
    LEVEL_5: 100000,
    LEVEL_6: 200000,
    LEVEL_8: 350000,
    LEVEL_9: 500000,
    LEVEL_10: 1000000
}

var SCORES = {
    PAWN: 10,
    KNIGHT: 30,
    BISHOP: 35,
    ROOK: 50,
    QUEEN: 90,
    KING: 900
}

var RAND_PIECE_VALUES = {
    WHITE_KING: 1,
    BLACK_KING: 1,
    WHITE_PAWNS: 0.75,
    WHITE_PAWNS_4: 0.05,
    WHITE_PAWNS_3: 0.1,
    WHITE_PAWNS_2: 0.45,
    WHITE_PAWNS_1: 0.4,
    BLACK_PAWNS: 0.75,
    BLACK_PAWNS_4: 0.05,
    BLACK_PAWNS_3: 0.1,
    BLACK_PAWNS_2: 0.45,
    BLACK_PAWNS_1: 0.4,
    WHITE_BISHOP: 0.5,
    BLACK_BISHOP: 0.5,
    WHITE_KNIGHT: 0.5,
    BLACK_KNIGHT: 0.5,
    WHITE_ROOK: 0.35,
    BLACK_ROOK: 0.35,
    WHITE_QUEEN: 0.05,
    BLACK_QUEEN: 0.05
}

/**
 * replaces a given substring in a string
 * @param {string} str - the string to search
 * @param {string} find - the string to find
 * @param {string} replace - the string to replace 'find' with
 */
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

// (0 to 33) + 7 = (7 to 40) = SQUARES.A6 to SQUARES.D1
function getRandomSquare() {
    return Math.floor(Math.random() * Math.floor(34)) + 7;
}