# Bannimator

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![https://raw.githubusercontent.com/bonoagency/bannimator/master/anim.min.js](http://img.badgesize.io/bonoagency/bannimator/master/anim.min.js.svg)

Мини-библиотека для анимации, без зависимостей (основана на библиотеке [anim by relay-zz](https://github.com/relay-zz/anim)). Минифицированная версия - `3 KB`. Удобный вариант, когда отстутствует возможность использования более серзьезных библиотек для анимации (GSAP, Anime.js, Move.js и т.п.), в случае, когда необходима поддержка старых IE (IE6+) и нельзя использовать CSS-анимации.

Например: баннерные размещения от Рамблер.

С помощью библиотеки можно анимировать любое свойство параметром которого является число или цвет (top, left, color, opacity, width, height и т.п.).

## Функционал

- Простой синтаксис цепочки вызовов `anim(---).anim(---).anim(---)`
- Easing-функции
- Сокращенный синтаксис `anim('div1', {opacity: 0.6}, 2)`

## Использование

`anim(node, properties, duration, ease*)` или `anim(delay)` или `anim(callbackFunction)`

- **node**: элемент DOM для анимации или его ID
- **properties**: CSS-свойства для анимации (см. ниже)
- **duration**: время анимации в секундах
- **ease** (необязательный параметр): имя easing-функции.
- **delay** : время ожидания перед стартом следующей анимации
- **callbackFunction** функция, которую нужно вызвать после завершения анимации

`properties` объект свойств может быть следующего вида:

`{cssName: endValue}` или `{cssName: {to:endValue, fr:startValue*, e:easingFunction*, u:units*}}`

- **cssName**: CSS-свойство для анимации; писать в camelCase (margin-left -> marginLeft)
- **to**: конечное значение CSS-свойства. Может быть числом или строкой с дополнительными единицами, например: 100, '100px', '50%', '3em'
- **fr** (optional): the starting value of the CSS property. If not supplied, it is read from the node
- **e** (необязательный параметр): имя easing-функции.
- **u** (необязательный параметр): единицы измерения свойства, например: px, %, pt

Функция возвращает объект с одним методом ('anim'), позволяющим запустить следующую анимаци после того как завершилась первая. Если эта функция вызвана с одним параметром, предполагается, что это колбек-функция и будет вызвана после завершения последней анимации.

## Примеры

```javascript
anim(box, {opacity: {to: 0.2, fr: 1}}, 2) // полный формат описывающий изменение свойства 'от-до'
anim(box, {opacity: 0.2}, 2)
anim(box, {height: 300}, 2, 'ease-in')
anim(box, {height: '14em',  width: '14em'}, 2)
anim(box, {marginLeft: '2%', fontSize: '20px'}, 2, 'ease-out')
anim(document.body, {scrollTop: 500}, 5, 'lin')
```

Запуск двух анимаций последовательно

```javascript
anim(box, {height: 300}, 2)
  .anim(box, {width: 300}, 2)
  .anim(function () { console.log('Done!') })
```

Запуск двух анимаций последовательно с задержкой в 1 секунду между ними

```javascript
anim(box, {height: 300}, 2)
  .anim(1)
  .anim(box, {width: 300}, 2)
```

## Браузерная поддержка

| Chrome | Safari | IE  | Firefox |
| --- | --- | --- | --- |
| 24+ | 6+ | 6+ | 2+ |

Если в браузере доступна функция `requestAnimationFrame` то для анимации будет использоваться она, а не setTimeout, RAF позоволяет увеличить частоту кадров, плавность анимации и оптимизировать рендер если CPU загружен или в фокусе другая вкладка.
