var javascriptserialize = require('javascript-serialize')
var escapehtml = require('escape-html')
var jsbeautify = require('js-beautify')
var type = require('component-type')
var bel = require('bel')
var csjs = require('csjs-inject')

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

window.onerror = function (msg, url, lineno, col, error) {
  error = error ? error : currentError
  var val = { msg: msg, url: url, lineno: lineno, col: col, error: error }
  console.error(val)
}

var KONSOLES = [{
  error       : console.error.bind(console),
  info        : console.info.bind(console),
  log         : console.log.bind(console)
}]
console.error = broadcast('error')
console.info = broadcast('info')
console.log = broadcast('log')

function broadcast (mode) {
  return function broadcastMode () {
    var args = arguments
    KONSOLES.forEach(function (api) { api[mode].apply(null, args) })
  }
}

module.exports = domconsole

var css = csjs`
  .wrapper            {
    position          : fixed;
    box-sizing        : border-box;
    background-color  : black;
    padding           : 15px 20px 15px 20px;
    border-radius     : 15px;
    bottom            : 0;
    width             : 98%;
    min-height        : 50px;
    display           : flex;
    flex-direction    : column;
  }
  @media screen and (min-width: 0px) {
    .konsole          {
      font-size       : calc(0.5em + 1vmin);
    }
  }
  .konsole            {
    font-family       : Courier;
    color             : white;
    overflow-y        : scroll;
    overflow          : auto;
    height            : 45vh;
    margin-bottom     : 30px;
  }
  .nav                {
    position          : absolute;
    bottom            : 0;
    padding-bottom    : 15px;
  }
  .btn                {
    margin-right      : 10px;
  }
  .line               {
    margin            : 0;
    line-height       : 1.5em;
  }
  .seperator          {
    border            : 1px dashed #333
  }
  .error              {
    color             : red;
  }
  .info               {
    color             : blue;
  }
  .log                {
    color             : white;
  }
  .hidden             {
    display           : none;
  }
`

function domconsole (opts) {
  if (!opts) opts = { auto: true }
  if (!opts.lineLength) opts.lineLength = 60

  var konsole = bel`<div class=${css.konsole}></div>`
  var bToggle = bel`<button onclick=${flip} class=${css.btn}>minimize</button>`
  var wrapper = bel`
    <div class=${css.wrapper}>
      ${konsole}
      <div class=${css.nav}>
        <button onclick=${cleanse} class=${css.btn}> clear </button>
        ${bToggle}
        <button class=${css.stats}> ... </button>
      </div>
    </div>
  `

  var dispatch = dispatcher(konsole, opts)

  var api = {
    log         : dispatch('log'),
    info        : dispatch('info'),
    error       : dispatch('error'),
    toggle      : flip,
    clear       : cleanse,
    serialize   : function serializeKonsole () { return konsole.innerText }
  }
  wrapper.api = api

  register(api)

  if (opts.auto) {
    flip() // start minimized
    document.body.appendChild(wrapper)
  }

  return wrapper

  function flip () {
    var state = konsole.classList.toggle(css.hidden)
    bToggle.innerHTML = state ? 'expand' : 'minimize'
  }
  function cleanse () { konsole.innerHTML = '' }
}

function register (api) { KONSOLES.push(api) }

function dispatcher (konsole, opts) {
  return function dispatch (mode) {
    return function logger () {
      if (this !== window) KONSOLES[0][mode].apply(null, arguments)
      var types = [].slice.call(arguments).map(type)
      javascriptserialize.apply(null, arguments).forEach(function (val, idx) {
        if (types[idx] === 'element') val = jsbeautify.html(val)
        var lines = val.match(new RegExp('.{1,' + opts.lineLength + '}', 'g'))
        lines.forEach(function (line) {
          var el = bel`<pre class="${css.line} ${css[mode]}">${line}</pre>`
          konsole.appendChild(el)
        })
        var sep = bel`<hr class=${css.seperator}>`
        konsole.appendChild(sep)
        sep.scrollIntoView()
      })
    }
  }
}
