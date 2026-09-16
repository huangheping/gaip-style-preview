(function () {
  'use strict';

  if (window.__GAIP_INDUCTION_UPDATE__) return;
  window.__GAIP_INDUCTION_UPDATE__ = true;

  // Adapt the original modules before their first evaluation. Keep the source
  // bundle, downloads, expert data and React-owned navigation intact.
  function updateData(original) {
    var chapters = original.Lg;
    var training = chapters[1];
    if (training.sections.length !== 3) return original;
    var learning = training.sections[0];
    learning.label = '2.1 GAIP学习中心';
    learning.title = 'GAIP学习中心';
    learning.content = [{ type: 'list', value: [
      '1. 打开<a href="#/workspace?gaip-channel=learning">学习中心</a>',
      '2. 进入“薄荷新人班课程”，开启学习之旅'
    ] }];
    training.sections.splice(1, 1);
    training.sections[1].label = '2.2 微信班级群规';
    // FF / qk already calculate offsets from the same mutable chapter array.
    return Object.assign({}, original, {
      Q1: chapters.reduce(function (total, chapter) { return total + chapter.sections.length; }, 0)
    });
  }

  function updateRenderer(original, require) {
    var React = require(67294);
    var Content = original.Z;
    return Object.assign({}, original, { Z: function InductionContent(props) {
      var result = Content(props);
      if (props.activeChapter !== 1 || props.activeSection !== 1) return result;
      // The source chooses its layout class by positional index. Retain the
      // group-rules layout after reindexing; its heading still renders as 2.2.
      var children = React.Children.toArray(result.props.children).map(function (child) {
        if (!React.isValidElement(child) || !child.props.className) return child;
        var className = child.props.className.replace('content11___ppJij', 'content12___CfKgO');
        return className === child.props.className ? child : React.cloneElement(child, { className: className });
      });
      return React.cloneElement(result, null, children);
    } });
  }

  function updateProgress(original) {
    return Object.assign({}, original, {
      G: function () {
        return original.G.apply(this, arguments).then(function (progress) {
          // Preserve the API's original coordinates: old 2.2 and 2.3 both
          // resume at the remaining group-rules section; other chapters keep IDs.
          if (!progress || progress.chapter !== 1 || progress.section < 1) return progress;
          return Object.assign({}, progress, { section: 1 });
        });
      },
      A: function (progress, options) {
        var stored = progress && progress.chapter === 1 && progress.section === 1
          ? Object.assign({}, progress, { section: 2 }) : progress;
        return original.A.call(this, stored, options);
      }
    });
  }

  var transforms = { 23856: updateData, 99803: updateRenderer, 92771: updateProgress };
  function wrapFactories(factories) {
    Object.keys(transforms).forEach(function (id) {
      var factory = factories[id];
      if (!factory || factory.__gaipInductionWrapped) return;
      var wrapped = function (module, exports, require) {
        factory.call(this, module, exports, require);
        module.exports = transforms[id](module.exports, require);
      };
      wrapped.__gaipInductionWrapped = true;
      factories[id] = wrapped;
    });
  }

  self.webpackChunk = self.webpackChunk || [];
  self.webpackChunk.push([['gaip-induction-update'], {}, function (require) {
    wrapFactories(require.m);
    // Webpack assigns push after processing the bootstrap queue. Install at
    // the microtask boundary, before any asynchronously loaded chapter chunk.
    Promise.resolve().then(function () {
      var chunks = self.webpackChunk;
      var push = chunks.push;
      chunks.push = function () {
        for (var i = 0; i < arguments.length; i++) {
          if (arguments[i] && arguments[i][1]) wrapFactories(arguments[i][1]);
        }
        return push.apply(this, arguments);
      };
    });
  }]);
})();
