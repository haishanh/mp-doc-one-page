'use strict';

var d = document.querySelector('time');
d.innerText = new Date(d.innerText).toLocaleString();
document.querySelector('.hidden').classList.remove('hidden');

var s =
  '' +
  '     (   )  \n' +
  '  (   ) (   \n' +
  '   ) _   )  \n' +
  '    ( _    \n' +
  '  _(_ )__ \n' +
  ' (_______))\n';

var l =
  '       \u5C0F' +
  '       \n' +
  '       \u7A0B' +
  '       \n' +
  '       \u5E8F' +
  '       \n' +
  '       \u5C31' +
  '       \n' +
  '       \u662F' +
  '       \n' +
  '       \u4E00' +
  '       \n' +
  '       \u5768' +
  '       \n' +
  s;

console.log(l);
