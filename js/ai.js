class Node {
    /**
     * The Node definition.
     * Used to hold and evaluate game states in different search algorithms.
     */
    constructor(gameBoard) {
        /**
         * @name Node#board - the board state
         * @type Board
         */
        this.board = new Board();
        this.setBoard(gameBoard);
        /**
         * @name Node#rating - the evaluation of the current Node -- used in MCTS
         * @type number[]
         * @default [0,0]
         */
        this.rating = [0, 0];
        /**
         * @name Node#policy_value - the current policy value of the current Node -- used in MCTS
         * @type number
         * @default 0
         */
        this.policy_value = 0;
        /**
         * @name Node#children - the children of the current Node
         * @type Node[]
         */
        this.children = [];
        /**
         * @name Node#iterations - the number of times the Node has been visited -- used in MCTS
         * @type number
         * @default 0
         */
        this.iterations = 0;
        /**
         * @name Node#material - the material count of the current Node -- used in MCTS, MM
         * @type number
         * @default 0
         */
        this.material = 0;
    }

    /**
     * Sets the board to the board given
     * @param {Square[]} gameBoard -- the board state to set to
     */
    setBoard(gameBoard) {
        this.board.area = JSON.parse(JSON.stringify(gameBoard.area));
    }

    /**
     * Create a FEN of the current board state.
     */
    createFen() {
        var sq;
        var rank = 0;
        var current_fen = "";
        for (var i = SQUARES.A6; i <= SQUARES.D1; i++) {
            sq = this.board.area[i];

            if (!sq.offboard) {
                switch (sq.piece) {
                    case PIECES.EMPTY:
                        current_fen += '-';
                        break;
                    case PIECES.PAWN:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += 'P';
                        } else {
                            current_fen += 'p';
                        }
                        break;
                    case PIECES.ROOK:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += 'R';
                        } else {
                            current_fen += 'r';
                        }
                        break;
                    case PIECES.KNIGHT:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += 'N';
                        } else {
                            current_fen += 'n';
                        }
                        break;
                    case PIECES.BISHOP:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += 'B';
                        } else {
                            current_fen += 'b';
                        }
                        break;
                    case PIECES.KING:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += 'K';
                        } else {
                            current_fen += 'k';
                        }
                        break;
                    case PIECES.QUEEN:
                        if (sq.color == COLORS.WHITE) {
                            current_fen += 'Q';
                        } else {
                            current_fen += 'q';
                        }
                        break;
                }
                rank++;

                if (rank % 4 === 0 && rank > 0) {
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
        this.board.fen = current_fen;
    }

    /**
     * Create a board from the given FEN.
     */
    parseFen() {
        var i = SQUARES.A6;
        var valid_input = true;

        for (var letter = 0; letter < this.board.fen.length; letter++) {
            var current_letter = this.board.fen[letter];

            switch(current_letter) {
                case 'P':
                    this.board.area[i].piece = PIECES.PAWN;
                    this.board.area[i].color = COLORS.WHITE;
                    break;
                case 'R':
                    this.board.area[i].piece = PIECES.ROOK;
                    this.board.area[i].color = COLORS.WHITE;
                    break;
                case 'N':
                    this.board.area[i].piece = PIECES.KNIGHT;
                    this.board.area[i].color = COLORS.WHITE;
                    break;
                case 'B':
                    this.board.area[i].piece = PIECES.BISHOP;
                    this.board.area[i].color = COLORS.WHITE;
                    break;
                case 'K':
                    this.board.area[i].piece = PIECES.KING;
                    this.board.area[i].color = COLORS.WHITE;
                    break;
                case 'Q':
                    this.board.area[i].piece = PIECES.QUEEN;
                    this.board.area[i].color = COLORS.WHITE;
                    break;
                case 'p':
                    this.board.area[i].piece = PIECES.PAWN;
                    this.board.area[i].color = COLORS.BLACK;
                    break;
                case 'r':
                    this.board.area[i].piece = PIECES.ROOK;
                    this.board.area[i].color = COLORS.BLACK;
                    break;
                case 'n':
                    this.board.area[i].piece = PIECES.KNIGHT;
                    this.board.area[i].color = COLORS.BLACK;
                    break;
                case 'b':
                    this.board.area[i].piece = PIECES.BISHOP;
                    this.board.area[i].color = COLORS.BLACK;
                    break;
                case 'k':
                    this.board.area[i].piece = PIECES.KING;
                    this.board.area[i].color = COLORS.BLACK;
                    break;
                case 'q':
                    this.board.area[i].piece = PIECES.QUEEN;
                    this.board.area[i].color = COLORS.BLACK;
                    break;
                case '1':
                    this.board.area[i].piece = PIECES.EMPTY;
                    this.board.area[i].color = COLORS.NONE;
                    break;
                case '2':
                    for (var j = 0; j < 2; j++) {
                        if (!this.board.area[i + j].offboard) {
                            this.board.area[i + j].piece = PIECES.EMPTY;
                            this.board.area[i + j].color = COLORS.NONE;
                        } else {
                            throw "Something went wrong parsing the FEN.";
                        }
                    }
                    i += 1;
                    break;
                case '3':
                    for (var j = 0; j < 3; j++) {
                        if (!this.board.area[i + j].offboard) {
                            this.board.area[i + j].piece = PIECES.EMPTY;
                            this.board.area[i + j].color = COLORS.NONE;
                        } else {
                            throw "Something went wrong parsing the FEN.";
                        }
                    }
                    i += 2;
                    break;
                case '4':
                    for (var j = 0; j < 4; j++) {
                        if (!this.board.area[i + j].offboard) {
                            this.board.area[i + j].piece = PIECES.EMPTY;
                            this.board.area[i + j].color = COLORS.NONE;
                        } else {
                            throw "Something went wrong parsing the FEN.";
                        }
                    }
                    i += 3;
                    break;
                case '/':
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
     * Return if the game is a win/loss, draw, or still ongoing
     * @return found_state -- the current state of the game
     */
    checkState() {
        var found_state = false;

        if (!found_state) {
            // check for mate
            this.board.isMate();

            if (this.board.gameOver) {
                found_state = true;
            }
        }

        if (!found_state) {
            // check for draw by insufficient material
            var found_material = false;
            var sq = 0;

            for (var i = 0; i < this.board.area.length; i++) {
                sq = this.board.area[i];

                if (!sq.offboard) {
                    if (sq.piece == PIECES.ROOK || sq.piece == PIECES.PAWN|| sq.piece == PIECES.QUEEN) {
                        found_material = true;
                        break;
                    }
                }
            }

            this.board.gameOver = (found_material) ? false : true;
            if (this.board.gameOver) {
                this.board.side = -1;
                found_state = true;
            }
        }

        if (!found_state) {
            // check for draw by stalemate
            var moves = this.board.generateMoveList();
            if (moves.length > 0) {
                for (var move in moves) {
                    try {
                        var sq1 = moves[1];
                        var sq2 = moves[2];
                    } catch(err) {
                        this.board.side = -1;
                        found_state = true;
                    }
                }
            } else {
                this.board.side = -1;
                found_state = true;
            }
        }

        return found_state;
    }

    /**
     * Choose a random move to play.
     * @return the move chosen (false if none)
     */
    pickRandomMove() {
        var p_moves = this.board.generateMoveList();
        var chosen_move = [];
        var move;

        if (p_moves.length > 0) {
            move = Math.floor(Math.random() * Math.floor(p_moves.length));
            var from = p_moves[move][0];
            var to = p_moves[move][1];

            var from_pce = this.board.area[from].piece;
            var from_color = this.board.area[from].color;
            var to_pce = this.board.area[to].piece;
            var to_color = this.board.area[to].color;

            // test move
            var pce_moved = movePiece(from, to, this.board);

            if (pce_moved) {
                takeMove(from, to, from_pce, to_pce, from_color, to_color, this.board);
                chosen_move.push(from, to);
                return chosen_move;
            }
        }

        return false;
    }
}

class MM {
    /**
     * The Minimax algorithm, represented as a class.
     */
    constructor(board) {
        this.board = board;
        this.side = board.side;
        this.best_move = 0;
    }

    /**
     * Assign a numerical value to the state of the board, used as a heuristic.
     */
    evaluate(board) {
        if (board.gameOver) {
            if (board.side == side) { return 5000; }
            else if (board.side == side^1) { return -5000; }
            else { return 0; }
        } else if (board.inCheck() && board.side == side) { return -1000; }
        return board.getMaterial();
    }

    /**
     * Runs the Minmax algorithm.
     * @return the move to choose
     */
    minimax(node, depth, maximizingPlayer, original) {
        var move_list = [];
        var value;
        var old;
        var valid_moves = this.board.generateMoveList();
        var best_score;
        var best_index;

        // if depth = 0 or node is a terminal node then return the heuristic value of node
        if (depth == 0 || valid_moves.length == 0) { return this.evaluate(this.board); }

        // initialize nodes
        for (var move = 0; move < valid_moves.length; move++) {
            var newState = new Node(this.board);
            if (movePiece(valid_moves[move][0], valid_moves[move][1], newState.board)) {
                newState.material = newState.board.getMaterial();
                newState.createFen();
//                newState.board.area = [];
                move_list.push(newState);
            }
        }

        if (maximizingPlayer) {
            value = -Infinity;
            best_score = value;
            for (var child = 0; child < move_list.length; child++) {
                value = Math.max(value, this.minimax(move_list[child], depth - 1, false, false));
                if (original) { if (value > best_score) { best_score = value; best_index = child; } }
            }
            if (original) { this.best_move = best_index; }
            return value;
        } else /* minimizing player */ {
            value = Infinity;
            best_score = value;
            for (var child = 0; child < move_list.length; child++) {
                value = Math.min(value, this.minimax(move_list[child], depth - 1, true, false));
                if (original) { if (value < best_score) { best_score = value; best_index = child; } }
            }
            if (original) { this.best_move = best_index; }
            return value;
        }
    }
}

class MCTS {
    /**
     * The Monte Carlo Tree Search algorithm, represented as a class.
     */
    constructor(gameBoard, move_list, k) {
        this.updateMCTS(gameBoard, move_list);
        this.k = k;
    }

    /**
     * Sets the MCTS start position and children to given inputs.
     * @param {Board} gameBoard -- the board position to start at
     * @param {Node[]} move_list -- the possible moves from the board position
     */
    updateMCTS(gameBoard, move_list) {
        this.selectedNodes = [];
        this.move_list = new Node(gameBoard);
        this.move_list.children = move_list;
        this.side = gameBoard.side;
        this.total_simulations = 1;
    }

    /**
     * Free the memory when not needed.
     */
    clearNodes() {
        this.selectedNodes = [];
        this.move_list = [];
    }

    /**
     * Get the Node with the highest rated policy value.
     * @param {Node} node -- the node to evaluate
     * @return Node with the hightest rated policy value
     */
    getHighestPolicyIndex(node) {
        var highest_policy_value = 0;
        var highest_policy_value_index = 0;
        var selectedChildren = [];

        for (var child = 0; child < node.children.length; child++) {
            var v_i1 = node.children[child].rating[0];
            var v_i2 = node.children[child].rating[1];

            var v_i = (v_i1 == 0 && v_i2 == 0) ? Infinity : v_i1 / v_i2;

            v_i += node.iterations * node.material; // * (1 - node.depth?)

            var part1 = 2 * Math.log(this.total_simulations);
            var part2 = node.children[child].rating[1];

            var exploration = (part1 == 0 && part2 == 0) ? Infinity : part1 / part2;

            node.children[child].policy_value = v_i + Math.sqrt(exploration);

            if (node.children[child].policy_value >= highest_policy_value) {
                highest_policy_value_index = child;
                highest_policy_value = node.children[child].policy_value;
                selectedChildren.push(child);
            }
        }

        if (selectedChildren.length > 1) {
            var randomChild = Math.floor(Math.random() * Math.floor(selectedChildren.length));
            return selectedChildren[randomChild];
        }

        return highest_policy_value_index;
    }

    /**
     * Select a leaf node using the policy.
     * @param {Node} node -- the node to evaluate
     * @return the chosen child
     */
    select(node) {
//        console.log('in select');
        if (node.children.length == 0) {
            return node;
        } else {
            this.selectedNodes.push(node);

            var highest_policy_value_index = this.getHighestPolicyIndex(node);

            var chosenChild = node.children[highest_policy_value_index];

            return this.select(chosenChild);
        }
    }

    /**
     * Expand the leaf node chosen, if possible.
     * @return result of simulate / expansion
     */
    expand(leafNode) {
//        console.log('in expand');
        leafNode.board.area = new Array(48);

        for (var i = 0; i < leafNode.board.area.length; i++) {
            leafNode.board.area[i] = new Square(PIECES.EMPTY);
            if (i >= SQUARES.A6 && i <= SQUARES.D1) {
                if (!(i == 11 || i == 17 || i == 23 || i == 29 || i == 35)) { // right offboard squares
                    if (!(i == 12 || i == 18 || i == 24 || i == 30 || i == 36)) { // left offboard squares
                        leafNode.board.area[i].offboard = false;
                    }
                }
            }
        }

        leafNode.parseFen();
//        console.log(leafNode.board.fen);
//        leafNode.board.printBoard();
//        leafNode.board.createFen();
//        console.log(leafNode.board.fen);
        var result = leafNode.checkState();
//        console.log(leafNode.board.area);
        if (!result) {
           // create k child nodes
           for (var i = 0; i < this.k; i++) {
                var move = leafNode.pickRandomMove();
                if (move != false) {
                    var childNode = new Node(leafNode.board);
                    childNode.side = leafNode.board.side^1;
                    if (movePiece(move[0], move[1], childNode.board)) {
                        childNode.material = childNode.board.getMaterial();
                        childNode.createFen();
                        leafNode.children.push(childNode);
                    }
                } else {
                    return 0.5; // invalid move found -- sign of stalemate
                }
           }
           // choose child node C at random
           var C = leafNode.children[Math.floor(Math.random() * Math.floor(leafNode.children.length))];

           var result = this.simulate(C);

           leafNode.board.area = [];

           for (var child in leafNode.children) {
               leafNode.children[child].board.area = [];
           }

           return result;
        } else {
            return (leafNode.board.side == this.side) ? 1 : 0;
        }
    }

    /**
     * Simulate the game from a given node.
     * @param {Node} C - the node to evaluate
     * @return the result of the game
     */
    simulate(C) {
//        console.log('in simulate.');
        // play game randomly
        var move;
        var pce_moved;
        var result;
        var i = 0;
        while (!C.board.gameOver) {
            i++;
            if (i > 20) { return 0.5; }
            move = C.pickRandomMove();
            if (move != false) {
                pce_moved = false;
                pce_moved = movePiece(move[0], move[1], C.board);

                if (pce_moved) {
                    result = C.checkState();
                    if (result) {
                        if (C.board.side == -1) { return 0.5; }
                        return (C.board.side == this.side) ? 1 : 0;
                    }
                } else {
                    do {
                         move = C.pickRandomMove();
                         pce_moved = movePiece(move[0], move[1], C.board);
                         i++;
                         if (pce_moved) {
                             result = C.checkState();
                             if (result) {
                                if (C.board.side == -1) { return 0.5; }
                                return (C.board.side == this.side) ? 1 : 0;
                             }
                         }
                         if (i > 20) { return (C.board.side == this.side) ? 1 : 0; }
                    } while (!pce_moved);
                }
            } else {
                return 0.5;
            }

            C.board.side ^= 1;
        }
    }

    /**
     * Run the MCTS algorithm.
     */
    run() {
        var leaf = this.select(this.move_list);

        this.selectedNodes.push(this.move_list);
        this.selectedNodes.push(leaf);

        var result = this.expand(leaf);
//        console.log("result: " + result);

        for (var node in this.selectedNodes) {
            this.selectedNodes[node].rating[0] += result;
            this.selectedNodes[node].rating[1] += 1;
            this.selectedNodes[node].iterations += 1;
        }

        this.total_simulations++;
        this.selectedNodes = [];
    }
}

class AI {
    constructor(gameBoard) {
       this.aiBoard = new Node(gameBoard);
       this.aiBoard.board.side = 0;
       this.searching = false;

       var move_list = [];
       var valid_moves = this.aiBoard.board.generateMoveList();

       for (var move = 0; move < valid_moves.length; move++) {
           var newState = new Node(this.aiBoard.board);
           if (movePiece(valid_moves[move][0], valid_moves[move][1], newState.board)) {
               newState.material = newState.board.getMaterial();
               newState.createFen();
               newState.board.area = [];
               move_list.push(newState);
           }
       }

       this.ai_mcts = new MCTS(this.aiBoard.board, move_list, 3);
       this.mm = new MM(this.aiBoard.board);
    }

    runMinimax(depth) {
        this.mm.board = this.aiBoard.board;
        var moves = this.mm.board.generateMoveList();

        this.mm.minimax(this.mm.board, depth, true, true);

        console.log(this.mm.best_move);
        return moves[this.mm.best_move];
    }

    runMCTS(valid_moves, games) {
        var move_list = [];

        for (var move = 0; move < valid_moves.length; move++) {
           var newState = new Node(this.aiBoard.board);
           newState.board.side = this.aiBoard.board.side;
           if (movePiece(valid_moves[move][0], valid_moves[move][1], newState.board)) {
               newState.createFen();
               newState.board.area = [];
               move_list.push(newState);
           }
        }

        this.ai_mcts.updateMCTS(this.aiBoard.board, move_list);

        for (var i = 0; i < games; i++) {
            try {
                this.ai_mcts.run();
            } catch (err) {
                gameBoard.side = -1;
                return -1;
            }

        }

        var move_ratings = [];
        var most_visited = 0;
        var most_visited_index = 0;

        try {
            for (var move = 0; move < move_list.length; move++) {
                move_ratings.push(move_list[move].rating[0] / move_list[move].rating[1]);
                console.log("move " + this.aiBoard.board.printSq(valid_moves[move][0])+this.aiBoard.board.printSq(valid_moves[move][1]) + ": " + move_ratings[move]);

                if (move_list[move].rating[1] > most_visited) {
                    most_visited = move_list[move].rating[1];
                    most_visited_index = move;
                }
            }
            console.log("============");

            this.ai_mcts.clearNodes();

            return valid_moves[most_visited_index];
//            return valid_moves[move_ratings.indexOf(Math.max(...move_ratings))];
        } catch (err) {
            this.aiBoard.board.gameOver = true;
            console.log('game is a draw [stalemate]');
            playSound('end');
            setTimeout(function() { alert('game is a draw [stalemate]'); }, 1500);

            var dom = document.getElementById('fenTitle');
            dom.style.backgroundImage = '-webkit-linear-gradient(top right, #af4038, #ffbcb7)';

            this.aiBoard.board.side = -1;
            return 0;
        }
    }

    search(type, search_limit) {
        var valid_moves = this.aiBoard.board.generateMoveList();

        if (valid_moves.length == 1) { return valid_moves[0]; }

        if (type == 'MCTS') { return this.runMCTS(valid_moves, search_limit); }
        else if (type == 'MM') { return this.runMinimax(search_limit); }
    }

    makeRandomMove() {
        var valid_moves = gameBoard.generateMoveList();
//        console.log(valid_moves);

        var move_made = false;
        var move = null;

        var move_from = null;
        var move_to = null;


        if (valid_moves.length > 0) {
            while (!move_made) {
                try {
                    move = Math.floor(Math.random() * Math.floor(valid_moves.length));
                    move_from = gameBoard.printSq(valid_moves[move][0]);
                    move_to = gameBoard.printSq(valid_moves[move][1]);
                    move_made = makeMove(move_from, move_to);
                } catch (err) {
                    if (valid_moves.length > 0) {
                        valid_moves.slice(move, 1);
                    } else {
                        gameBoard.gameOver = true;
                        gameBoard.side = -1;

                        console.log("Game is a draw [stalemate]");
                        playSound('end');
                        setTimeout(function() { alert("Game is a draw [stalemate]"); }, 1500);

                        var dom = document.getElementById('fenTitle');
                        dom.style.backgroundImage = '-webkit-linear-gradient(top right, #af4038, #ffbcb7)';
                        break;
                    }
                }
            }

            var comp_move = move_from + move_to;

            gameBoard.move_list.push(comp_move);
            gameBoard.side = COLORS.WHITE;

            if (gameBoard.isMate()) {
                return (comp_move+"#");
            } else if(gameBoard.inCheck()) {
                return (comp_move+"+");
            } else { return (comp_move) };
        } else {
            gameBoard.gameOver = true;
            gameBoard.side = -1;

            console.log("Game is a draw [stalemate]");
            alert("Game is a draw [stalemate]");

            var dom = document.getElementById('fenTitle');
            dom.style.backgroundImage = '-webkit-linear-gradient(top right, #af4038, #ffbcb7)';
        }
    }
}