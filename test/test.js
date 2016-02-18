require('..')({console:true})



var Buffer = require('buffer').Buffer


console.log(new Buffer(5))

var x = { leaf: 'leaf' }
x['aCircle'] = x
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
debugger
console.log(new Error('Ups! Something wrong...'))


console.error(new Error('Ups! Something wrong...'))
console.log({a: '5'})
console.error({a: '5'})
console.log(document.createElement('div'))
console.error(document.createElement('div'))
var div = document.createElement('div')
div.innerHTML = '<div><div>asdf</div></div>'
console.log(div)
console.log('WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW WWWWWWWWWW ')

function test (p) { var x = JSON.parse(p) }
test(function(){})
