/* global describe, it, animorph, requestAnimationFrame, assert */

function requestAnimationFramePromise (frames) {
  return new Promise(function (resolve) {
    requestAnimationFrame(function () {
      if (frames > 1) {
        return requestAnimationFramePromise(frames - 1).then(resolve);
      }
      resolve();
    });
  });
}

function createDemo (html, css, test) {
  var style = document.createElement('style');
  style.innerHTML = css;
  var div = document.createElement('div');
  div.innerHTML = html;
  document.head.appendChild(style);
  document.body.appendChild(div);
  function cleanup () {
    document.body.removeChild(div);
    document.head.removeChild(style);
    document.body.innerHTML = '';
  }
  return Promise.resolve()
        .then(function () {
          return test(div);
        })
        .then(cleanup);
}

function _getElementPosition (node) {
  const rect = node.getBoundingClientRect();
  const offset = {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
  };
  return offset;
}

describe('test replaceClasses', function () {
  it('animorph was loaded', function () {
    assert.equal(typeof animorph, 'object');
    assert.equal(typeof animorph.animorph, 'function');
  });

  it('adds the prepare class before the animation starts', function () {
    return createDemo(
      '<div class="demo">A</div>',
      '.am-enter { transition: 2s }',
      function (done) {
        var demo = document.querySelector('.demo');
        animorph.replaceClasses(demo);
        assert.equal(demo.className, 'demo am-enter-prepare am-enter am-animate');
      });
  });

  it('adds prepare styles without transition', function () {
    return createDemo(
      '<div class="demo"></div>',
      '.am-enter { transition: 2s } .am-enter-prepare { background-color: #000 } .am-enter-active { background-color: #f00 }',
      function () {
        var demo = document.querySelector('.demo');
        animorph.replaceClasses(demo);
        return requestAnimationFramePromise().then(function () {
          var startColor = window.getComputedStyle(demo).backgroundColor;
          assert.equal(startColor, 'rgb(0, 0, 0)');
        });
      });
  });

  it('removes the prepare class once the animation starts', function () {
    return createDemo(
      '<div class="demo">A</div>',
      '.am-enter { transition: 2s }',
      function (done) {
        var demo = document.querySelector('.demo');
        animorph.replaceClasses(demo);
        return requestAnimationFramePromise(2).then(function () {
          assert.equal(demo.className, 'demo am-enter am-animate am-enter-active');
        });
      });
  });

  it('removes all animorph classes after the animation ends', function () {
    return createDemo(
      '<div class="demo">A</div>',
      '.am-enter { transition: 0s }',
      function (done) {
        var demo = document.querySelector('.demo');
        animorph.replaceClasses(demo);
        return requestAnimationFramePromise(2).then(function () {
          assert.equal(demo.className, 'demo');
        });
      });
  });
});

describe('test appendTo', function () {
  it('should create clone', function () {
    return createDemo(
    '<div class="source"><div class="element">Demo</div></div><div class="target"></div>',
    '.am-animate { transition: 2s }',
    function () {
      var element = document.querySelector('.element');
      var target = document.querySelector('.target');
      animorph.appendTo(element, target);
      return requestAnimationFramePromise().then(function () {
        var clone = document.querySelector('body > .element');
        assert.isOk(clone, 'test that clone was found as direct child in body element');
      });
    });
  });
});

describe('test enter placeholder position', function () {
  it('should calculate the correct clone position', function () {
    return createDemo(
            '<div class="source"><div class="element">Demo</div></div><div class="target"></div>',
            '.am-animate { transition: 2s } body { margin: 0 }',
            function () {
              var element = document.querySelector('.element');
              var target = document.querySelector('.target');
              var positionElement = _getElementPosition(element);
              animorph.appendTo(element, target);
              var clone = document.querySelector('body > .element');
              var positionClone = _getElementPosition(clone);
              assert.deepEqual(positionElement, positionClone, 'test that placeholder has the correct start position');
            });
  });
  it('should calculate the correct clone position if body has a margin', function () {
    return createDemo(
            '<div class="source"><div class="element">Demo</div></div><div class="target"></div>',
            '.am-animate { transition: 2s } body { margin: 100px }',
            function () {
              var element = document.querySelector('.element');
              var target = document.querySelector('.target');
              var positionElement = _getElementPosition(element);
              animorph.appendTo(element, target);
              var clone = document.querySelector('body > .element');
              var positionClone = _getElementPosition(clone);
              assert.deepEqual(positionElement, positionClone, 'test that placeholder has the correct start position');
            });
  });
  it('should calculate the correct clone position (with margin)', function () {
    return createDemo(
        '<div class="source"><div class="element">Demo</div></div><div class="target"></div>',
        '.am-animate { transition: 2s } .element { margin-top: -10px }',
        function (container) {
          var element = container.querySelector('.element');
          var target = container.querySelector('.target');
          var positionElement = _getElementPosition(element);
          animorph.appendTo(element, target);
          var clone = document.querySelector('body > .element');

          return requestAnimationFramePromise().then(function () {
            var positionClone = _getElementPosition(clone);
            assert.deepEqual(positionElement, positionClone, 'test that placeholder has the correct start position');
          });
        });
  });

  it('should calculate the correct clone position (with borders)', function () {
    return createDemo(
            '<div class="wrapper"><div class="source"><div class="element">Demo</div></div><div class="target"></div></div>',
            '.am-animate { transition: 2s } .element { margin-top: -10px } .wrapper { border: 10px solid black; margin: -5px }',
            function (container) {
              var element = container.querySelector('.element');
              var target = container.querySelector('.target');
              var positionElement = _getElementPosition(element);
              animorph.appendTo(element, target);
              var clone = document.querySelector('body > .element');

              return requestAnimationFramePromise().then(function () {
                var positionClone = _getElementPosition(clone);
                assert.deepEqual(positionElement, positionClone, 'test that placeholder has the correct start position');
              });
            });
  });

  it('should calculate the correct clone position (with morph parent)', function () {
    return createDemo(
            '<div class="wrapper"><div class="source"><div class="element">Demo</div></div><div class="target"></div></div>',
            '.am-animate { transition: 2s } .element { } .wrapper { margin: -5px; position: relative }',
            function (container) {
              var element = container.querySelector('.element');
              var target = container.querySelector('.target');
              var wrapper = container.querySelector('.wrapper');
              var positionElement = _getElementPosition(element);
              animorph.appendTo(element, target, { morphParent: wrapper });
              var clone = document.querySelector('.wrapper > .element');
              return requestAnimationFramePromise().then(function () {
                var positionClone = _getElementPosition(clone);
                assert.deepEqual(positionElement, positionClone, 'test that placeholder has the correct start position');
              });
            });
  });
});
