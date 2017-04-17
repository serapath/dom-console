# dom-console
console.log output in the dom

## description
very convenient when experimenting with npm libraries in the browser. For example using [requirebin.com](http://requirebin.com/)

By default.it adds a console DOM element to the bottom of the page, which can be cleared and minimized/maximized via buttons and shows everything that can otherwise be seen in the DevTools JavaScript console.

## example
see http://serapath.github.io/dom-console

## usage
```js
var Buffer = require('buffer').Buffer
var domconsole = require('dom-console')
var opts = { lineLength: 60 } // default
var api = /*element*/ domconsole(/*opts*/).api

console.log(new Buffer(5))

var x = { leaf: 'leaf' }
x['circular1'] = x
x.y = {}
x.y.circular2 = x.y
console.log(x)

console.log({a:'x', fn:function(x){return 5}})
console.log(new Date)
console.log({a:'b',c:[1,2,3],x:{y:{z:['a',{b:'c'}]}}})
console.log(null)
console.log(undefined)
console.log("hey")
console.log(false)
console.log(true)
console.log(function asdf () {})
console.log(12)
console.log(/asdf/)
console.log((function(){ return arguments })(1,true))
console.log([])
console.log(document.createElement('div'))
console.log(NaN)

console.log({a: '5'})
console.error({a: '5'})
console.log(document.createElement('div'))
console.error(document.createElement('div'))
var div = document.createElement('div')
div.innerHTML = '<div><div>asdf</div></div>'
console.log(div)
console.log('WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW ')

console.info('it works :-)')

// api usage
api.toggle() // expand or minimize the dom-console
console.log(api.serialize()) // retrieve the log that was logged to the dom-console
api.clear() // clear the content of the dom-console

api.log('visible in devtools console & only this dom-console instance')
api.info('visible in devtools console & only this dom-console instance')
api.error('visible in devtools console & only this dom-console instance')

// also logs errors nicely
function test (p) { var x = JSON.parse(p) }
test(function(){})

console.log(new Error('Ups! Something wrong...'))
console.error(new Error('Ups! Something wrong...'))
```
