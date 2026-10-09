/* Generated migration map; original web/ baseline remains read-only. */
(function () {
  var files = {
  "p__workspace__index.9d8a5f47.chunk.css": "channels/workspace/page.css?v=20260930-local-icons-3",
  "p__workspace__index.b984c5d7.async.js": "channels/workspace/page.js?v=20260930-local-icons-3",
  "p__customer__index.cf63b31b.async.js": "channels/customer/page.js?v=20261008-expand-1",
  "p__customer__index.fa91e9e7.chunk.css": "channels/customer/page.css?v=20260930-local-icons-3",
  "p__policy__index.109db1c0.async.js": "channels/policy/page.js?v=20260930-local-icons-3",
  "p__policy__index.599aa5be.chunk.css": "channels/policy/page.css?v=20260930-local-icons-3",
  "p__proposal__index.0e756085.async.js": "channels/proposal-center/page.js?v=20261008-close-2",
  "p__proposal__index.fa9c3807.chunk.css": "channels/proposal-center/page.css",
  "p__dashboard__product__index.48332667.chunk.css": "channels/product/page.css?v=20261008-product-details-1",
  "p__dashboard__product__index.5ead150d.async.js": "channels/product/page.js?v=20261008-close-2",
  "p__dashboard__activity__index.1198cb77.async.js": "channels/activity/page.js?v=20261008-close-2",
  "p__dashboard__activity__index.2dae1e6c.chunk.css": "channels/activity/page.css?v=20260930-local-icons-3",
  "p__induction__index.04bbc58b.async.js": "channels/induction/page.js?v=20261008-close-2",
  "p__induction__index.ec144457.chunk.css": "channels/induction/page.css?v=20260925-owned-images-1",
  "p__clues__index.29eaa724.chunk.css": "channels/clues/page.css?v=20260930-local-icons-3",
  "p__clues__index.d44f30db.async.js": "channels/clues/page.js?v=20261001-merge-2",
  "p__login__index.365b806e.async.js": "channels/login/page.js?v=20260930-local-icons-3",
  "p__login__index.6320a9c4.chunk.css": "channels/login/page.css"
};
  self.webpackChunk = self.webpackChunk || [];
  self.webpackChunk.push([['gaip-local-channel-bundles'], {}, function (require) {
    ['u', 'miniCssF'].forEach(function (key) {
      var original = require[key];
      if (!original) return;
      require[key] = function (id) { var name = original(id); return files[name] ? '../' + files[name] : name; };
    });
  }]);
}());
