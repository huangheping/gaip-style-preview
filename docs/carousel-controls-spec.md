# 轮播切换控件

`components/carousel-controls/global-carousel-controls.js` / `components/carousel-controls/global-carousel-controls.css` 为活动中心和学习中心共用源，组件目录调用同一工厂。

`__GAIP_CAROUSEL_CONTROLS__.mount(host, options)` 返回 `update({count,index})`、`destroy()`；重复挂载同一宿主返回同一实例。

- `arrowHost` 指定相对定位的箭头容器，`dotHost` 指定底部分页宿主，默认均为 host。
- `count/index` 为组数和零基当前组；`onChange(index)` 由业务更新内容。默认首尾循环，`loop:false` 改为边界禁用。
- `externalDots:true` 与 `getState()` 适配活动中心已有 Slick 指示器；不替换 React 节点、不接管自动播放。箭头与公共组件同源，原生指示器保持现有样式。
- 组件不创建定时器。直播只手动每组两场，只有一组时不挂载控件，无直播时整区隐藏。最后一组仅一张仍半宽靠左。
- 原生按钮支持 Tab、Enter、Space，指示点有当前组语义；重建直播内容后恢复原控件焦点。活动中心离开时销毁实例。
- 箭头皮肤由活动原有规则迁入；共享浅底指示点使用圆点/选中胶囊形态，点击热区不随可见图形缩小。活动图上原生白色指示器保持不变，具体视觉参数见下方台账。

视觉参数见 `design-changes/shared-carousel-controls.json`；本地 mock 不代表真实直播数据。
