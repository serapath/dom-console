'use strict'
var javascriptserialize = require('javascript-serialize')

var style = [
  '#terminal {',
  '  box-sizing    : border-box;',
  '  width         : 100%;',
  '  height        : 50%;',
  '  background    : black;',
  '  padding       : 15px 20px 15px 20px;',
  '  border-radius : 15px;',
  '  border        : 2px solid #CEE1F0;',
  '  font-family   : Courier;',
  '  font-size     : 16px;',
  '  position      : absolute;',
  '  bottom        : 0;',
  '}'
].join('\n')
var s = document.createElement('style')
s.innerHTML = style
var t = document.createElement('div')
t.setAttribute('id', 'terminal')
document.head.appendChild(s)
document.body.appendChild(t)

var term = require('hypernal')()
term.appendTo('#terminal')
var logger = { log: javascriptserialize }
var init = false

module.exports = getLogger

function getLogger (opts) {
  opts = opts || {}
  if (opts.console && !init) {
    init = true
    var old = console.log.bind(console)
    function consoleLog() {
      old.apply(null, arguments)
      var arr = javascriptserialize.apply(null, arguments)
      term.write(arr.join('')+'<br><hr><br>')
    }
     console.log = consoleLog
    logger.log = consoleLog
  }
  return logger
}
