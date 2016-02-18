require('..')({console:true})

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
