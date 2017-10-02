/** Copyright 2013 mocking@gmail.com * http://github.com/relay-zz/anim

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

/* exported anim */
var anim = (function (A) {
  'use strict'

  A = function (n, g, t, e) {
    var a
    var o
    var q = []
    var cb = function (err, i) {
      if (err) {}
      // our internal callback function maintains a queue of objects
      // that contain callback info. If the object is an array of length
      // over 2, then it is parameters for the next animation. If the object
      // is an array of length 1 and the item in the array is a number,
      // then it is a timeout period, otherwise it is a callback function.
      if ((i = q.shift())) {
        if (i[1]) {
          A.apply(this, i).anim(cb)
        } else if (i[0] > 0) {
          setTimeout(cb, i[0] * 1000)
        } else {
          i[0]()
          cb()
        }
      }
    }

    if (n.charAt) n = document.getElementById(n)

    //  if the 1st param is a number then treat it as a timeout period.
    //  If the node reference is null, then we skip it and run the next callback
    //  so that we can continue with the animation without throwing an error.
    if (n > 0 || !n) {
      g = {}
      t = 0
      cb(null, q = [[n || 0]])
    }

    //  firefox don't allow reading shorthand CSS styles like "margin" so
    //  we have to expand them to be "margin-left", "margin-top", etc.
    //  Also, expanding them allows the 4 values to animate independently
    //  in the case that the 4 values are different to begin with.
    expand(g, {padding: 0, margin: 0, border: 'Width'}, [T, R, B, L])
    expand(g, {borderRadius: 'Radius'}, [T + L, T + R, B + R, B + L])

    // if we animate a property of a node, we set a unique number on the
    // node, so that if we run another animation concurrently, it will halt
    // the first animation. This is needed so that if we animate on mouseover
    // and want to reverse the animation on mouseout before the mouseover
    // is complete, they won't clash and the last animation prevails.
    ++mutex

    for (a in g) {
      o = g[a]
      if (!o.to && o.to !== 0) o = g[a] = {to: o} // shorthand {margin:0} => {margin:{to:0}}

      A.defs(o, n, a, e) // set defaults, get initial values, selects animation fx
    }

    A.iter(g, t * 1000, cb)

    return {
      // this allows us to queue multiple animations together in compact syntax
      anim: function () {
        q.push([].slice.call(arguments))
        return this
      }
    }
  }

  var T = 'Top'
  var R = 'Right'
  var B = 'Bottom'
  var L = 'Left'
  var mutex = 1

  // {border:1} => {borderTop:1, borderRight:1, borderBottom:1, borderLeft:1}
  var expand = function (g, dim, dir, a, i, d, o) {
    for (a in g) { // for each animation property
      if (a in dim) {
        o = g[a]
        for (i = 0; (d = dir[i]) ; i++) { // for each dimension (Top, Right, etc.)
          // margin => marginTop
          // borderWidth => borderTopWidth
          // borderRadius => borderTopRadius
          g[a.replace(dim[a], '') + d + (dim[a] || '')] = {
            to: (o.to === 0) ? o.to : (o.to || o), fr: o.fr, e: o.e
          }
        }
        delete g[a]
      }
    }
  }

  var timeout = (function (w, a) {
    return w['r' + a] || w['webkitR' + a] || w['mozR' + a] || w['msR' + a] || w['oR' + a]
  })(window, 'equestAnimationFrame')

  A.defs = function (o, n, a, e, s) {
    s = n.style
    o.a = a // attribute
    o.n = n // node
    o.s = (a in s) ? s : n // = n.style || n
    o.e = o.e || e // easing

    o.fr = o.fr || (o.fr === 0 ? 0 : o.s === n ? n[a] : (window.getComputedStyle ? getComputedStyle(n, null) : n.currentStyle)[a])

    o.u = (/\d(\D+)$/.exec(o.to) || /\d(\D+)$/.exec(o.fr) || [0, 0])[1] // units (px, %)

    // which animation fx to use. Only color needs special treatment
    o.fn = /color/i.test(a) ? A.fx.color : (A.fx[a] || A.fx._)

    // the mutex is composed of the animating property name and a unique number
    o.mx = 'anim_' + a
    n[o.mx] = o.mxv = mutex
    if (n[o.mx] !== o.mxv) o.mxv = null // test expando
  }

  A.iter = function (g, t, cb) {
    var _
    var i
    var o
    var p
    var e
    var z = +new Date() + t

    _ = function () {
      i = z - new Date().getTime()

      if (i < 50) {
        for (o in g) {
          o = g[o]
          o.p = 1
          o.fn(o, o.n, o.to, o.fr, o.a, o.e)
        }

        cb && cb()
      } else {
        i = i / t

        for (o in g) {
          o = g[o]

          if (o.n[o.mx] !== o.mxv) return // if mutex not match then halt.

          e = o.e
          p = i

          if (e) {
            console.log(e)
            p = 1 - A.easeFn[e](p)
          } else {
            p = 1 - A.easeFn['linear'](p)
          }

          o.p = p
          o.fn(o, o.n, o.to, o.fr, o.a, o.e)
        }
        timeout ? timeout(_) : setTimeout(_, 20)
      }
    }
    _()
  }

  A.fx = { // CSS names which need special handling

    _: function (o, n, to, fr, a, e) { // for generic fx
      fr = parseFloat(fr) || 0
      to = parseFloat(to) || 0
      o.s[a] = (o.p >= 1 ? to : (o.p * (to - fr) + fr)) + o.u
    },

    width: function (o, n, to, fr, a, e) { // for width/height fx
      if (!(o._fr >= 0)) {
        o._fr = !isNaN(fr = parseFloat(fr)) ? fr : a === 'width' ? n.clientWidth : n.clientHeight
      }

      A.fx._(o, n, to, o._fr, a, e)
    },

    opacity: function (o, n, to, fr, a, e) {
      if (isNaN(fr = fr || o._fr)) {
        fr = n.style
        fr.zoom = 1
        fr = o._fr = (/alpha\(opacity=(\d+)\b/i.exec(fr.filter) || {})[1] / 100 || 1
      }

      fr *= 1
      to = (o.p * (to - fr) + fr)
      n = n.style
      if (a in n) {
        n[a] = to
      } else {
        n.filter = to >= 1 ? '' : 'alpha(' + a + '=' + Math.round(to * 100) + ')'
      }
    },

    color: function (o, n, to, fr, a, e, i, v) {
      if (!o.ok) {
        to = o.to = A.toRGBA(to)
        fr = o.fr = A.toRGBA(fr)

        if (to[3] === 0) {
          to = [].concat(fr)
          to[3] = 0
        }

        if (fr[3] === 0) {
          fr = [].concat(to)
          fr[3] = 0
        }

        o.ok = 1
      }

      v = [0, 0, 0, o.p * (to[3] - fr[3]) + 1 * fr[3]]

      for (i = 2; i >= 0; i--) v[i] = Math.round(o.p * (to[i] - fr[i]) + 1 * fr[i])

      if (v[3] >= 1 || A.rgbaIE) v.pop()

      try {
        o.s[a] = (v.length > 3 ? 'rgba(' : 'rgb(') + v.join(',') + ')'
      } catch (e) {
        A.rgbaIE = 1
      }
    }
  }

  A.fx.height = A.fx.width

  A.RGBA = /#(.)(.)(.)\b|#(..)(..)(..)\b|(\d+)%,(\d+)%,(\d+)%(?:,([\d.]+))?|(\d+),(\d+),(\d+)(?:,([\d.]+))?\b/

  A.toRGBA = function (s, v) {
    v = [0, 0, 0, 0]
    s.replace(/\s/g, '').replace(A.RGBA, function (i, a, b, c, f, g, h, l, m, n, o, w, x, y, z) {
      h = [a + a || f, b + b || g, c + c || h]
      var p = [l, m, n]

      for (i = 0; i < 3; i++) {
        h[i] = parseInt(h[i], 16)
        p[i] = Math.round(p[i] * 2.55)
      }

      v = [h[0] || p[0] || w || 0, h[1] || p[1] || x || 0, h[2] || p[2] || y || 0, o || z || 1]
    })
    return v
  }

  /*
  * Easing Functions from https://gist.github.com/gre/1650294
  * The t value for the range [0, 1] => [0, 1]
  */

  A.easeFn = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t * t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t * (2 - t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t < 0.5 ? 2 * t * t : -1 + 2 * (2 - t) * t },
    // alternative on that function
    // easeOutInQuad: function (t) { return t < 0.5 ? A.easeFn.easeOutQuad(2 * t) * 0.5 : A.easeFn.easeInQuad((2 * (t - 0.5))) * 0.5 + 0.5 },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t * t * t },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t) * t * t + 1 },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
    // accelerating from zero velocity
    easeInQuart: function (t) { return t * t * t * t },
    // decelerating to zero velocity
    easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t * t * t * t * t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t },
    // elastic bounce effect at the beginning
    easeInElastic: function (t) { return (0.04 - 0.04 / t) * Math.sin(25 * t) + 1 },
    // elastic bounce effect at the end
    easeOutElastic: function (t) { return 0.04 * t / (--t) * Math.sin(25 * t) },
    // elastic bounce effect at the beginning and end
    easeInOutElastic: function (t) { return (t -= 0.5) < 0 ? (0.01 + 0.01 / t) * Math.sin(50 * t) : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1 },
    easeInSine: function (t) { return -1 * Math.cos(t * (Math.PI / 2)) + 1 },
    easeOutSine: function (t) { return Math.sin(t * (Math.PI / 2)) },
    easeInOutSine: function (t) { return -0.5 * (Math.cos(Math.PI * t) - 1) },
    // Increasing velocity until stop
    easeInCirc: function (t) { var scaledTime = t / 1; return -1 * (Math.sqrt(1 - scaledTime * t) - 1) },
    // Start fast, decreasing velocity until stop
    easeOutCirc: function (t) { var t1 = t - 1; return Math.sqrt(1 - t1 * t1) },
    // Fast increase in velocity, fast decrease in velocity
    easeInOutCirc: function (t) { var scaledTime = t * 2; var scaledTime1 = scaledTime - 2; return scaledTime < 1 ? -0.5 * (Math.sqrt(1 - scaledTime * scaledTime) - 1) : 0.5 * (Math.sqrt(1 - scaledTime1 * scaledTime1) + 1) },
    easeInBounce: function (t) {
      return 1 - A.easeFn.easeOutBounce(1 - t)
    },
    easeOutBounce: function (t) {
      var scaledTime = t / 1
      var scaledTime2

      if (scaledTime < (1 / 2.75)) {
        return 7.5625 * scaledTime * scaledTime
      } else if (scaledTime < (2 / 2.75)) {
        scaledTime2 = scaledTime - (1.5 / 2.75)
        return (7.5625 * scaledTime2 * scaledTime2) + 0.75
      } else if (scaledTime < (2.5 / 2.75)) {
        scaledTime2 = scaledTime - (2.25 / 2.75)
        return (7.5625 * scaledTime2 * scaledTime2) + 0.9375
      } else {
        scaledTime2 = scaledTime - (2.625 / 2.75)
        return (7.5625 * scaledTime2 * scaledTime2) + 0.984375
      }
    },
    easeInOutBounce: function (t) {
      return (t < 0.5) ? A.easeFn.easeInBounce(t * 2) * 0.5 : (A.easeFn.easeOutBounce((t * 2) - 1) * 0.5) + 0.5
    }
  }

  return A
})()
