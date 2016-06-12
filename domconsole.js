'use strict'
var javascriptserialize = require('javascript-serialize')
var escapehtml = require('escape-html')
var beautifyhtml = require('js-beautify').html
var type = require('component-type')
/********************************************************************
  LOGGING
********************************************************************/
var konsole
function getKonsole () {
  var style = document.createElement('style')
  style.innerHTML = [
    ".konsole-wrapper {",
      "position: absolute;",
      "box-sizing: border-box;",
      "background-color: black;",
      "padding: 15px 20px 15px 20px;",
      "border-radius: 15px;",
      "bottom: 0;",
      "width:98%;",
      "min-height: 50px;",
      "display: flex;",
      "flex-direction:column;",
    "}",
    ".konsole{",
      "font-family: Courier;",
      "font-size: 1.9vw;",
      "color: white;",
      "overflow-y: scroll;",
      "overflow: auto;",
      "height: 45vh;",
      "margin-bottom: 30px;",
    "}",
    ".konsole-error{",
      "color: red;",
    "}",
    ".konsole-nav{",
      "position: absolute;",
      "bottom: 0;",
      "padding-bottom: 15px;",
    "}",
    ".konsole-line{",
      "margin: 0;",
      "line-height: 1.5em;",
    "}",
    ".konsole-seperator{",
      "border: 1px dashed #333",
    "}",
    ".konsole-button{",
      "margin-right: 10px;",
    "}",
    ".konsole-normal{",
      "color: white;",
    "}",
    ".konsole-nav--hidden{",
      "display: none;",
    "}"
  ].join('')
  document.body.appendChild(style)
  var clearButton = document.createElement('button')
  clearButton.innerHTML = 'clear'
  clearButton.className = 'konsole-button'
  var toggleButton = document.createElement('button')
  var state = localStorage.getItem('dom-console/konsole')
  toggleButton.innerHTML = state ? state : 'expand'
  toggleButton.className = 'konsole-button'
  clearButton.addEventListener('click', function () {
    clearKonsole()
  })
  toggleButton.addEventListener('click', function () {
    var next = toggleButton.innerHTML === 'expand' ? 'minimize' : 'expand'
    toggleButton.innerHTML = next
    localStorage.setItem('dom-console/konsole', next)
    if (next === 'expand') konsole.classList.add('konsole-nav--hidden')
    else konsole.classList.remove('konsole-nav--hidden')
  })
  var nav = document.createElement('div')
  nav.className = 'konsole-nav'
  nav.appendChild(clearButton)
  nav.appendChild(toggleButton)
  var konsole = document.createElement('div')
  var wrapper = document.createElement('div')
  wrapper.className = 'konsole-wrapper'
  var name = 'konsole ' + ((state==='expand')?'konsole-nav--hidden':'')
  konsole.className = name
  document.body.appendChild(wrapper)
  wrapper.appendChild(konsole)
  wrapper.appendChild(nav)
  return konsole
}

function domlog (content) {
  var x = document.createElement('pre')
  x.className = 'konsole-'+this + '  konsole-line'
  x.innerHTML = escapehtml(content)
  konsole.appendChild(x)
  konsole.scrollTop = konsole.scrollHeight
}
function clearKonsole () {
  var lines = [].slice.call(document.querySelectorAll('.konsole > *'))
  lines.forEach(function (line) {
    line.parentNode.removeChild(line)
  })
}


var devToolsLog = console.log.bind(console)
var devToolsError = console.error.bind(console)

var logger = {
  log: logging.bind({mode:'normal',console:false}),
  error: logging.bind({mode:'error',console:false})
}
var init = false

module.exports = getLogger

getLogger.clear = clearKonsole

function getLogger (opts) {
  if (!konsole) { konsole = getKonsole() }
  opts = opts || {}
  if (opts.console && !init) {
    init = true
    console.log = logger.log = logging.bind({mode:'normal',console:true})
    console.error = logger.error = logging.bind({mode:'error',console:true})
  }
  return logger
}
function splitString (string, size) {
	return string.match(new RegExp('.{1,' + size + '}', 'g'));
}
function logging () {
  var mode = this.mode, c = this.console
  if (mode === 'normal') { if (c) devToolsLog.apply(null,arguments) }
  else if (c) devToolsError.apply(null, arguments)
  var types = [].slice.call(arguments).map(function(arg){ return type(arg)})
  javascriptserialize.apply(null, arguments).forEach(function(val, idx){
    if (types[idx] === 'element') val = beautifyhtml(val)
    if (mode === 'normal') splitString(val, 60).forEach(function (line) {
      domlog.call('normal', line)
    })
    else splitString(val, 60).forEach(function (line) {
      domlog.call('error', line)
    })
  })
  var hr = document.createElement('hr')
  hr.className = 'konsole-seperator'
  konsole.appendChild(hr)
}

var currentError
window.addEventListener('error', function (event) {
  currentError = new Error(event.message)
  currentError.timeStamp = event.timeStamp
  currentError.isTrusted = event.isTrusted
  currentError.filename = event.filename
  currentError.lineno = event.lineno
  currentError.colno = event.colno
  currentError.error = event.error
  currentError.type = event.type
})
window.onerror = function(msg, url, lineno, col, error) {
  error = error ? error : currentError
  var val = { msg: msg, url: url, lineno: lineno, col: col, error: error }
  logger.error(val)
}
