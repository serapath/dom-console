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
  .nav                {
    display           : flex;
    position          : absolute;
    bottom            : 0;
    padding-bottom    : 15px;
  }
  .btn                {
    margin-right      : 10px;
  }
  .dashboard          {
    display           : flex;
  }
  .stats              {
    padding           : 1px 10px;
    margin-left       : 10px;
    background-color  : white;
    color             : black;
    border-radius     : 5px;
  }
  .errorstats         {
    background-color  : red;
  }
  .infostats          {
    background-color  : blue;
  }
  .logstats           {
    background-color  : white;
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
  var error   = bel`
    <div title="error" class="${css.errorstats} ${css.stats}">0</div>
  `
  var info    = bel`
    <div title="info" class="${css.infostats} ${css.stats}">0</div>
  `
  var log     = bel`
    <div title="log" class="${css.logstats} ${css.stats}">0</div>
  `
  var stats   = bel`
    <div class="${css.dashboard} ${css.hidden}">
     ${error} ${info} ${log}
    </div>
  `
  stats.log   = log
  stats.info  = info
  stats.error = error
  var wrapper = bel`
    <div class=${css.wrapper}>
      ${konsole}
      <div class=${css.nav}>
        <button onclick=${cleanse} class=${css.btn}> clear </button>
        ${bToggle}
        ${stats}
      </div>
    </div>
  `

  var dispatch = dispatcher(konsole, stats, opts)

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

  function hide () {
    error.innerHTML = info.innerHTML = log.innerHTML = 0
    error.style.visibility = 'hidden'
    info.style.visibility = 'hidden'
    log.style.visibility = 'hidden'
  }
  function flip () {
    var hidden = konsole.classList.toggle(css.hidden)
    if (hidden) hide()
    stats.classList.toggle(css.hidden)
    bToggle.innerHTML = hidden ? 'expand' : 'minimize'
  }
  function cleanse () {
    konsole.innerHTML = ''
    hide()
  }
}

function register (api) { KONSOLES.push(api) }

function dispatcher (konsole, stats, opts) {
  return function dispatch (mode) {
    return function logger () {
      if (this !== window) KONSOLES[0][mode].apply(null, arguments)
      var types = [].slice.call(arguments).map(type)
      var isHidden = konsole.classList.contains(css.hidden)
      javascriptserialize.apply(null, arguments).forEach(function (val, idx) {
        if (types[idx] === 'element') val = jsbeautify.html(val)
        var lines = val.match(new RegExp('.{1,' + opts.lineLength + '}', 'g'))
        lines.forEach(function (line) {
          var el = bel`<pre class="${css.line} ${css[mode]}">${line}</pre>`
          konsole.appendChild(el)
          if (isHidden) {
            stats[mode].innerHTML = (stats[mode].innerHTML|0) + 1
            stats[mode].style.visibility = ''
          }
        })
        var sep = bel`<hr class=${css.seperator}>`
        konsole.appendChild(sep)
        if (!isHidden) sep.scrollIntoView()
      })
    }
  }
}
