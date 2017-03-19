var javascriptserialize = require('javascript-serialize')
var escapehtml = require('escape-html')
var jsbeautify = require('js-beautify')
var type = require('component-type')

module.exports = getLogger

var konsole
var beautifyhtml  = jsbeautify.html
var devToolsLog   = console.log.bind(console)
var devToolsError = console.error.bind(console)
var devToolsInfo  = console.info.bind(console)
var logger = {
  log   : console.log.bind(console),
  info  : console.info.bind(console),
  error : console.error.bind(console)
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

function getKonsole () {
  var style = document.createElement('style')
  style.innerHTML = [
    ".konsole-wrapper {",
      "position: fixed;",
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
    ".konsole-info{",
      "color: blue;",
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
  toggleButton.innerHTML = 'expand'
  toggleButton.className = 'konsole-button'

  clearButton.addEventListener('click', clearKonsole)
  toggleButton.addEventListener('click', toggle)

  var nav = document.createElement('div')
  nav.className = 'konsole-nav'
  nav.appendChild(clearButton)
  nav.appendChild(toggleButton)

  var wrapper = document.createElement('div')
  wrapper.className = 'konsole-wrapper'

  konsole = document.createElement('div')
  konsole.className = 'konsole '

  wrapper.appendChild(konsole)
  wrapper.appendChild(nav)

  document.body.appendChild(wrapper)

  return konsole
}

function toggle () {
  var toggleButton = konsole.parentElement.querySelector('.konsole-button')
  var next = toggleButton.innerHTML === 'expand' ? 'minimize' : 'expand'
  toggleButton.innerHTML = next
  if (next === 'expand') konsole.classList.add('konsole-nav--hidden')
  else konsole.classList.remove('konsole-nav--hidden')
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
  lines.forEach(function (line) { line.parentNode.removeChild(line) })
}

function getLogger () {
  if (!konsole) {
    getKonsole()
    console.log   = logger.log   = logging.bind('normal')
    console.error = logger.error = logging.bind('error')
    console.info  = logger.info  = logging.bind('info')
  }
  var api = {
    toggle: toggle,
    clear: clearKonsole,
    serialize: function () { return konsole.innerText }
  }
  return api
}

function splitString (string, size) {
	return string.match(new RegExp('.{1,' + size + '}', 'g'));
}

function logging () {
  var mode = this + ''
  if (mode === 'normal') { devToolsLog.apply(null,arguments) }
  else if (mode === 'error') { devToolsError.apply(null,arguments) }
  else if (mode === 'info') { devToolsInfo.apply(null,arguments) }

  var types = [].slice.call(arguments).map(function(arg){ return type(arg)})
  javascriptserialize.apply(null, arguments).forEach(function(val, idx){
    if (types[idx] === 'element') val = beautifyhtml(val)
    if (mode === 'normal') splitString(val, 60).forEach(function (line) {
      domlog.call('normal', line)
    })
    else if (mode === 'info') splitString(val, 60).forEach(function (line) {
      domlog.call('info', line)
    })
    else splitString(val, 60).forEach(function (line) {
      domlog.call('error', line)
    })
  })
  var hr = document.createElement('hr')
  hr.className = 'konsole-seperator'
  konsole.appendChild(hr)
}
