class MinimaxNode {
  constructor(board, move) {
    this.board = board;
    this.move = move;
    this.value = this.h();
    this.side = board.side === COLORS.BLACK;
    this.children = [];

    if (move !== null) {
      const t_board = new Board();
      this.move_name =
        t_board.printSq(this.move[0]) + t_board.printSq(this.move[1]);
    }
  }

  h() {
    if (this.board.gameOver) {
      return this.board.side === COLORS.BLACK ? -1000 : 1000;
    } else return this.board.getMaterialCount();
  }

  fen() {
    return this.board.fen;
  }

  moves() {
    return this.board.generateMoveList();
  }

  isLeaf() {
    return this.children.length == 0;
  }
}

class MinimaxTree {
  constructor(boardFen, depth, side) {
    let rootBoard = new Board(); // create new board
    rootBoard.boardFromFen(boardFen); // set board to fen
    rootBoard.side = side; // set side
    rootBoard.createFen(); // set fen

    this.depth = depth; // set depth
    this.root = new MinimaxNode(rootBoard, null); // create root node
    this.build(0, this.root); // build tree from root node
  }

  build(currentDepth, currentNode) {
    // start at root, continue until depth reached
    while (currentDepth < this.depth) {
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
            newBoard.side == COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

          let newNode = new MinimaxNode(newBoard, move); // create a new node

          currentNode.children.push(newNode); // add new node to children
          this.build(currentDepth + 1, newNode); // continue building the tree, starting at the child
        }
      }

      break;
    }
  }
}

class AI {
  constructor(board, algorithm = "minimax") {
    this.board = board;
    this.algorithm = algorithm;
  }

  setBoard(newFen) {
    this.board.boardFromFen(newFen);
  }

  async randomMove() {
    const moves = this.board.generateMoveList();
    return moves[Math.floor(Math.random() * moves.length)];
  }

  async minimax(node, depth = 0, isMaximizingPlayer, alpha, beta) {
    if (node.isLeaf()) return [node, node.value];

    if (isMaximizingPlayer) {
      let bestVal = -Infinity;
      let bestChild = null;

      for (let child_idx in node.children) {
        const [_, value] = await this.minimax(
          node.children[child_idx],
          depth + 1,
          false,
          alpha,
          beta
        );

        if (value > bestVal) {
          bestVal = value;
          bestChild = node.children[child_idx];
        }

        alpha = Math.max(alpha, bestVal);

        if (beta <= alpha) break;
      }

      return [bestChild, bestVal];
    } else {
      let bestVal = Infinity;
      let bestChild = null;

      for (let child_idx in node.children) {
        const [_, value] = await this.minimax(
          node.children[child_idx],
          depth + 1,
          true,
          alpha,
          beta
        );

        if (value < bestVal) {
          bestVal = value;
          bestChild = node.children[child_idx];
        }

        beta = Math.min(beta, bestVal);

        if (beta <= alpha) break;
      }

      return [bestChild, bestVal];
    }
  }

  async search() {
    if (this.board.generateMoveList() == 0) return 0;

    if (this.algorithm === "random") {
      const move = await this.randomMove();
      return move;
    } else if (this.algorithm === "minimax") {
      const depth = 2;
      const tree = new MinimaxTree(this.board.fen, depth, this.board.side);

      for (let child in tree.root.children) {
        console.log(tree.root.children[child]);
      }

      const [bestChild, _] = await this.minimax(
        tree.root,
        0,
        false,
        -Infinity,
        Infinity
      );

      return bestChild.move;
    }
  }
}
