var style = [
  '#terminal {',
  '  box-sizing    : border-box;',
  '  width         : 100%;',
  '  height        : 50%;',
  '  background    : black;',
  '  padding       : 15px 20px 15px 20px;',
  '  border-radius : 15px;',
  '  border        : 2px solid #CEE1F0;',
  '  font-family   : Monaco;',
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
function tt (content) { term.write(content+'<br>') }
var logger = { log: tt }
var init = false

module.exports = function getLogger (opts) {
  opts = opts || {}
  if (opts.console && !init) {
    init = true
    var old = console.log.bind(console)
    function consoleLog() {
      old.apply(null, arguments)
      var arr = [].slice.call(arguments)
      tt(arr.join(' '))
    }
    console.log = consoleLog
    logger.log = consoleLog
  }
  return logger
}
