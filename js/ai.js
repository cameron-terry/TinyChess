class MinimaxNode {
  constructor(board, move, pieceSqTable) {
    this.board = board;
    this.move = move;
    this.value = this.h(pieceSqTable);
    this.side = board.side === COLORS.BLACK;
    this.children = [];

    if (move !== null) {
      const t_board = new Board();
      this.move_name =
        t_board.printSq(this.move[0]) + t_board.printSq(this.move[1]);
    }
  }

  h(pieceSqTable) {
    // is side to move checkmated?
    if (
      this.board.sqAttacked(this.board.findKingSq(this.board.side)) && // side to move is attacked
      this.moves().length == 0 // has no moves
    ) {
      return this.board.side === COLORS.BLACK ? 1000 : -1000;
    }

    if (this.moves().length == 0) return 0; // stalemate
    else {
      const weights = [1, 20, -20, -0.5, 0.5, 1];
      const heuristics = [
        this.board.getMaterialCount(),
        this.board.sqAttacked(this.board.findKingSq(this.board.side ^ 1)),
        this.board.sqAttacked(this.board.findKingSq(this.board.side)),
        this.board.squaresAttacked(true).length,
        this.board.squaresAttacked().length,
        pieceSqTable.calculate(this.board), // endgame
      ];

      let score = 0;

      for (let w in weights) {
        score += weights[w] * heuristics[w];
      }

      return score;
    }
  }

  fen() {
    return this.board.fen;
  }

  moves() {
    return this.board.generateMoveList();
  }

  isLeaf() {
    return this.children.length == 0 || this.moves().length == 0;
  }
}

class MinimaxTree {
  constructor(boardFen, depth, side, clockStart, pieceSqTable) {
    let rootBoard = new Board(); // create new board
    rootBoard.boardFromFen(boardFen); // set board to fen
    rootBoard.createFen(); // set fen
    rootBoard.side = side; // set side

    this.pieceSqTable = pieceSqTable;

    this.depth = depth; // set depth
    this.root = new MinimaxNode(rootBoard, null, this.pieceSqTable); // create root node

    this.nodesBuilt = 1;
    this.clockStart = clockStart;

    this.build(0, this.root); // build tree from root node
  }

  build(currentDepth, currentNode) {
    // start at root, continue until depth reached
    while (
      currentDepth < this.depth &&
      performance.now() - this.clockStart < 5000
    ) {
      const newMovesToMakeNodes = currentNode.moves(); // get all moves for current node

      // for each move
      for (let move_idx in newMovesToMakeNodes) {
        let newBoard = new Board(); // create a new board for the move (will turn it into a node)
        newBoard.boardFromFen(currentNode.board.fen); // set up the board given the current node's fen
        newBoard.side = currentNode.board.side;
        const move = newMovesToMakeNodes[move_idx]; // get move
        const moveMade = movePiece(move[0], move[1], newBoard); // try to make the move on the board

        // success?
        if (moveMade) {
          newBoard.createFen(); // set fen (so boardFromFen works for children of this move)
          newBoard.side =
            newBoard.side == COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE; // flip turn, since move was made

          let newNode = new MinimaxNode(newBoard, move, this.pieceSqTable); // create a new node
          this.nodesBuilt++;

          currentNode.children.push(newNode); // add new node to children

          if (!newBoard.gameOver) this.build(currentDepth + 1, newNode); // continue building the tree, starting at the child
        }
      }

      break;
    }
  }
}

class PieceSquareTable {
  constructor() {
    const boardSize = 48; // set board size

    // piece square tables
    this.whitePawnPST = new Array(boardSize);
    this.blackPawnPST = new Array(boardSize);

    const white_pawn_goal_squares = [
      SQUARES.A6,
      SQUARES.B6,
      SQUARES.C6,
      SQUARES.D6,
    ];

    const white_pawn_next_goal_squares = [
      SQUARES.A5,
      SQUARES.B5,
      SQUARES.C5,
      SQUARES.D5,
    ];

    const black_pawn_goal_squares = [
      SQUARES.A1,
      SQUARES.B1,
      SQUARES.C1,
      SQUARES.D1,
    ];

    const black_pawn_next_goal_squares = [
      SQUARES.A2,
      SQUARES.B2,
      SQUARES.C2,
      SQUARES.D2,
    ];

    for (var i = 0; i < boardSize; i++) {
      this.whitePawnPST[i] = white_pawn_goal_squares.includes(i) ? 30 : 0;
      this.blackPawnPST[i] = black_pawn_goal_squares.includes(i) ? 30 : 0;

      this.whitePawnPST[i] = white_pawn_next_goal_squares.includes(i) ? 15 : 0;
      this.blackPawnPST[i] = black_pawn_next_goal_squares.includes(i) ? 15 : 0;
    }
  }

  calculate(board) {
    let white_value = 0;
    let black_value = 0;

    for (let i in board.area) {
      // piece is a white pawn?
      white_value =
        board.area[i].piece === PIECES.PAWN &&
        board.area[i].color === COLORS.WHITE
          ? white_value + this.whitePawnPST[i]
          : white_value;

      // piece is a black pawn?
      black_value =
        board.area[i].piece === PIECES.PAWN &&
        board.area[i].color === COLORS.BLACK
          ? black_value + this.blackPawnPST[i]
          : black_value;
    }

    return white_value - black_value;
  }
}

class AI {
  constructor(board, algorithm = "minimax", moves = 2) {
    this.board = board;
    this.algorithm = algorithm;
    this.depth = moves;
    this.params = {
      nodesBuilt: 0,
      nodesSearched: 0,
    };

    this.PST = new PieceSquareTable();
  }

  setMoves(newMoves) {
    this.depth = newMoves;
  }

  setBoard(newFen) {
    this.board.boardFromFen(newFen);
  }

  async randomMove() {
    const moves = this.board.generateMoveList();
    return moves[Math.floor(Math.random() * moves.length)];
  }

  async minimax(node, depth = 0, isMaximizingPlayer, alpha, beta, clockStart) {
    this.params.nodesSearched++;

    // terminal node
    if (node.isLeaf() || performance.now() - clockStart > 5000)
      return [node, node.value];

    // max wants to pick the largest min
    if (isMaximizingPlayer) {
      let bestVal = -Infinity;
      let bestChild = null;

      // each child will get the smallest max
      for (let child_idx in node.children) {
        const [_, value] = await this.minimax(
          node.children[child_idx],
          depth + 1,
          false,
          alpha,
          beta,
          clockStart
        );

        // new largest min
        if (value > bestVal) {
          bestVal = value;
          bestChild = node.children[child_idx];
        }

        // alpha-beta pruning
        alpha = Math.max(alpha, bestVal);
        if (beta <= alpha) break;
      }

      return [bestChild, bestVal];

      // min wants to pick the smallest max
    } else {
      let bestVal = Infinity;
      let bestChild = null;

      // each child will get the largest min
      for (let child_idx in node.children) {
        const [_, value] = await this.minimax(
          node.children[child_idx],
          depth + 1,
          true,
          alpha,
          beta,
          clockStart
        );

        // new smallest max
        if (value < bestVal) {
          bestVal = value;
          bestChild = node.children[child_idx];
        }

        // alpha-beta pruning
        beta = Math.min(beta, bestVal);
        if (beta <= alpha) break;
      }

      return [bestChild, bestVal];
    }
  }

  async search() {
    const moves = this.board.generateMoveList();
    if (moves == 0) return 0;

    if (this.algorithm === "random" || this.depth == 0) {
      const move = await this.randomMove();
      return move;
    } else if (this.algorithm === "minimax") {
      const ply = 2 * this.depth; // from experimentation, the algorithm plays better when seeing a move for both sides

      this.params = {
        nodesBuilt: 0,
        nodesSearched: 0,
      };

      const tree = new MinimaxTree(
        this.board.fen,
        ply,
        this.board.side,
        performance.now(),
        this.PST
      );

      this.params.nodesBuilt = tree.nodesBuilt;

      // display children nodes
      //   for (let child in tree.root.children) {
      //     console.log(tree.root.children[child]);
      //   }

      const [bestChild, bestScore] = await this.minimax(
        tree.root,
        0,
        this.side == COLORS.WHITE,
        -Infinity,
        Infinity,
        performance.now()
      );

      console.log(
        `nodes built -> searched at ply ${ply}: ${this.params.nodesBuilt} -> ${this.params.nodesSearched}, eval: ${bestScore}`
      );
      return bestChild.move;
    }
  }
}
