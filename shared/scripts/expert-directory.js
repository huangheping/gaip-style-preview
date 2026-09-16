(function () {
  'use strict';
  if (window.__GAIP_EXPERT_DIRECTORY__) return;

  var scriptUrl = document.currentScript.src;
  var profile = {
    id: 'zhou-keqin-william',
    name: '周克勤William',
    avatar: 'zhou-keqin-william.jpg',
    type: '美保专家',
    tags: ['美保专家', '综合专家'],
    qrCode: 'zhou-keqin-william-qr.png',
    experiences: [
      '拥有19年以上金融行业从业经验，长期深耕财富管理、保险保障、税务身份及家族财富传承领域，兼具丰富的研究经验与一线实战经验。',
      '曾任职于中信保诚人寿、渣打银行等多家金融机构，先后担任销售团队经理、支行行长等管理岗位，服务数百组高净值客户，对境内外财富管理市场、金融产品及高净值客户需求有深入理解。',
      '2017年加入诺亚，担任理财师并连续多年获得“精英理财师”称号；2021年参与公司增值业务板块转型，担任SR，连续多年荣获诺亚全国年度优秀SR等荣誉。',
      '在财富保障与传承实务方面，曾为诺亚全球数百组黑卡客户、上市公司企业家及公司内部高管提供境内外信托、保险及相关财富保全架构的规划与落地服务。',
      '目前主要负责Glory美国保险业务，擅长结合客户家庭、资产、身份及传承需求，提供涵盖保险、信托、身份规划等在内的一站式综合财富解决方案。'
    ]
  };
  var assets = {};
  assets['./' + profile.avatar] = new URL('../assets/expert-directory/' + profile.avatar, scriptUrl).href;
  assets['./' + profile.qrCode] = new URL('../assets/expert-directory/' + profile.qrCode, scriptUrl).href;
  window.__GAIP_EXPERT_DIRECTORY__ = { profile: profile };

  // Both induction 5.2 and the existing product-expert modal consume these
  // same source modules. The modal shell and its existing registration stay intact.
  function updateData(original) {
    var section = original.Lg[4].sections[1];
    section.content.forEach(function (block) {
      if (block.type === 'expertDock') {
        block.list.forEach(function (line) {
          if (line.type !== '美保' && line.type !== '综合专家') return;
          var names = line.experts ? line.experts.split('、') : [];
          if (names.indexOf(profile.name) === -1) names.push(profile.name);
          line.experts = names.join('、');
        });
      }
      if (block.type === 'expertList' && !block.value.some(function (expert) { return expert.name === profile.name; })) {
        block.value.push(profile);
      }
    });
    return original;
  }

  function updateAssets(original) {
    var context = function (key) {
      return Object.prototype.hasOwnProperty.call(assets, key) ? assets[key] : original(key);
    };
    Object.assign(context, original);
    context.keys = function () { return original.keys().concat(Object.keys(assets)); };
    return context;
  }

  function updateRenderer(original, require) {
    var React = require(67294);
    var Content = original.Z;
    function decorate(node) {
      if (Array.isArray(node)) {
        var mapped = node.map(decorate);
        return mapped.some(function (child, i) { return child !== node[i]; }) ? mapped : node;
      }
      if (!React.isValidElement(node)) return node;
      if (node.props.className === 'expertCardHeader___My9Or') {
        var children = React.Children.toArray(node.props.children);
        if (children[0] && children[0].props.children === profile.name) {
          return React.cloneElement(node, { 'data-expert-id': profile.id }, [children[0]].concat(profile.tags.map(function (tag) {
            return React.cloneElement(children[1], { key: tag }, tag);
          })));
        }
      }
      var children = decorate(node.props.children);
      if (node.props.className === 'expertCardContent___XjMml' && Array.isArray(children) &&
          children[0] && children[0].props['data-expert-id'] === profile.id) {
        // The source QR is absolutely positioned. Reserve its 84px width plus
        // a 24px gap so this expert's longer biography cannot run underneath it.
        return React.cloneElement(node, { style: Object.assign({}, node.props.style, { paddingRight: 108 }) }, children);
      }
      return children === node.props.children ? node : React.cloneElement(node, null, children);
    }
    return Object.assign({}, original, { Z: function ExpertDirectoryContent(props) {
      return decorate(Content(props));
    } });
  }

  var transforms = { 23856: updateData, 70165: updateAssets, 99803: updateRenderer };
  function wrapFactories(factories) {
    Object.keys(transforms).forEach(function (id) {
      var factory = factories[id];
      if (!factory || factory.__gaipExpertsWrapped) return;
      var wrapped = function (module, exports, require) {
        factory.call(this, module, exports, require);
        module.exports = transforms[id](module.exports, require);
      };
      wrapped.__gaipExpertsWrapped = true;
      factories[id] = wrapped;
    });
  }

  self.webpackChunk = self.webpackChunk || [];
  self.webpackChunk.push([['gaip-expert-directory'], {}, function (require) {
    wrapFactories(require.m);
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
