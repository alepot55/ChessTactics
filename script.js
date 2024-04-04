var board = Chessboard2('scacchiera', 'start')

function onDragStart (source, piece, position, orientation) {
  if (game.in_checkmate() === true || game.in_draw() === true ||
      piece.search(/^b/) !== -1) {
    return false
  }
}

function onDrop (source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  })

  if (move === null) {
    return 'snapback'
  }
}

function onSnapEnd () {
  board.position(game.fen())
}

board = Chessboard2('scacchiera', {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
})
