/* @gaip-page-cache:start */
"use strict";
// Generated from this channel’s index.html. Edit its HTML and run npm run build:templates.
window.__GAIP_HTML_VIEW__.register({"login-gaip-login-source-style-1":{"tag":"div","component":"gaip_login_source_style_1Type","propsBinding":"gaip_login_source_style_1Props","key":null,"kind":"jsx","props":{"className":"gaip-login-source-style-1"},"childrenType":null,"children":[]},"login-captchaImg":{"tag":"img","component":null,"propsBinding":"captchaImgProps","key":null,"kind":"jsx","props":{"className":"captchaImg___aJJJ5","alt":"验证码"},"childrenType":null,"children":[]},"login-captchaWrap":{"tag":"div","component":null,"propsBinding":"captchaWrapProps","key":null,"kind":"jsx","props":{"className":"captchaWrap___PjoYB"},"childrenType":"single","children":[{"slot":"captchaWrapContent"}]},"login-loginBtn":{"tag":"div","component":"loginBtnType","propsBinding":"loginBtnProps","key":null,"kind":"jsxs","props":{"type":"primary","htmlType":"submit","className":"loginBtn___IRejT"},"childrenType":"array","children":[{"text":"立即登录 "},{"tag":"div","component":"componentType","propsBinding":null,"key":null,"kind":"jsx","props":{},"childrenType":null,"children":[]}]},"login-component-2":{"tag":"div","component":"componentType","propsBinding":"componentProps","key":null,"kind":"jsx","props":{"size":"small"},"childrenType":null,"children":[]},"login-component":{"tag":"div","component":"componentType","propsBinding":"componentProps","key":null,"kind":"jsx","props":{"label":"验证码","name":"captcha","placeholder":"请输入验证码"},"childrenType":null,"children":[]},"login-pageContainer":{"tag":"div","component":null,"propsBinding":null,"key":null,"kind":"jsxs","props":{"className":"pageContainer___Vztwf"},"childrenType":"array","children":[{"tag":"img","component":null,"propsBinding":"logoProps","key":null,"kind":"jsx","props":{"className":"logo___Cf9cM","alt":"GLORY GAIP"},"childrenType":null,"children":[]},{"tag":"img","component":null,"propsBinding":"sloganProps","key":null,"kind":"jsx","props":{"className":"slogan___GhIaI","alt":"GLORY ADVISOR INTELLIGENCE PLATFORM"},"childrenType":null,"children":[]},{"tag":"div","component":null,"propsBinding":null,"key":null,"kind":"jsxs","props":{"className":"loginPanel___JBy38"},"childrenType":"array","children":[{"tag":"h1","component":null,"propsBinding":null,"key":null,"kind":"jsxs","props":{"className":"title___zhtS2"},"childrenType":"array","children":[{"text":"登录"},{"tag":"span","component":null,"propsBinding":null,"key":null,"kind":"jsx","props":{"className":"subTitle___ljisp"},"childrenType":"single","children":[{"text":"Sign In"}]}]},{"tag":"div","component":"componentType","propsBinding":"componentProps4","key":null,"kind":"jsx","props":{"tip":"登录中...","wrapperClassName":"loginSpin___Ieq_Q"},"childrenType":"single","children":[{"tag":"div","component":"componentType2","propsBinding":"componentProps3","key":null,"kind":"jsxs","props":{"name":"login-form"},"childrenType":"array","children":[{"tag":"div","component":"componentType3","propsBinding":"componentProps","key":null,"kind":"jsx","props":{"label":"域账号","name":"domainAccount","placeholder":"请输入域账号"},"childrenType":null,"children":[]},{"tag":"div","component":"componentType4","propsBinding":"componentProps2","key":null,"kind":"jsx","props":{"label":"域账号密码","name":"password","placeholder":"请输入域账号密码"},"childrenType":null,"children":[]},{"slot":"componentContent"}]}]},{"tag":"p","component":null,"propsBinding":null,"key":null,"kind":"jsxs","props":{"className":"cprt___jpxO2"},"childrenType":"array","children":[{"text":"Copyright © "},{"slot":"cprtContent"},{"text":" Gloryfh Ltd. All Rights Reserved."}]}]}]}});
/* @gaip-page-cache:end */

// Page state, event handlers, data requests and Umi module registration.
"use strict";
(self.webpackChunk = self.webpackChunk || []).push([
  [652],
  {
    23463: function (Be, L, a) {
      (a.r(L),
        a.d(L, {
          default: function () {
            return he;
          },
        }));
      var W = a(97857),
        g = a.n(W),
        Q = a(15009),
        f = a.n(Q),
        X = a(99289),
        A = a.n(X),
        q = a(5574),
        I = a.n(q),
        _ = a(27442),
        b = a(6742),
        p = a(39580),
        F = a(49424),
        ee = a(27454),
        ae = a(66268),
        re = a(50888),
        ne = a(87462),
        u = a(67294),
        te = {
          icon: {
            tag: "svg",
            attrs: { viewBox: "64 64 896 896", focusable: "false" },
            children: [
              {
                tag: "path",
                attrs: {
                  d: "M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 000-48.4z",
                },
              },
            ],
          },
          name: "arrow-right",
          theme: "outlined",
        },
        se = te,
        ue = a(84089),
        le = function (v, y) {
          return u.createElement(ue.Z, (0, ne.Z)({}, v, { ref: y, icon: se }));
        },
        ie = u.forwardRef(le),
        ce = ie,
        oe = a(97269),
        T = a(5966),
        S = a(92016),
        m = a(85829),
        w = a(57381),
        de = a(83622),
        fe = a.p + "../channels/login/assets/images/slogan.7ccf7d3e.png",
        o = {
          pageContainer: "pageContainer___Vztwf",
          logo: "logo___Cf9cM",
          slogan: "slogan___GhIaI",
          loginPanel: "loginPanel___JBy38",
          title: "title___zhtS2",
          subTitle: "subTitle___ljisp",
          captchaWrap: "captchaWrap___PjoYB",
          captchaImg: "captchaImg___aJJJ5",
          loginBtn: "loginBtn___IRejT",
          loginSpin: "loginSpin___Ieq_Q",
          cprt: "cprt___jpxO2",
        },
        s = a(85893),
        N = {
          size: "large",
          onKeyDown: function (v) {
            v.key === " " && v.preventDefault();
          },
        },
        pe = new Date().getFullYear(),
        E = window.__GAIP_HTML_VIEW__.render(
          "login-gaip-login-source-style-1",
          s,
          {
            gaip_login_source_style_1Type: () => re.Z,
            gaip_login_source_style_1Props: () => ({ spin: !0 }),
          },
        ),
        ve = ["401006", "42307"],
        ge = function () {
          var v = (0, u.useRef)(),
            y = (0, u.useRef)(String(Math.random())),
            me = (0, u.useState)(""),
            M = I()(me, 2),
            O = M[0],
            Ce = M[1],
            P = (0, u.useRef)(null),
            x = (0, S.useModel)("global"),
            G = x.saveUserInfo,
            Ae = x.setAiStatementVisible,
            Se = (0, S.useModel)("@@initialState"),
            Re = Se.setInitialState,
            Ie = (0, u.useState)(!1),
            $ = I()(Ie, 2),
            ye = $[0],
            k = $[1],
            Pe = (0, u.useState)(!1),
            z = I()(Pe, 2),
            j = z[0],
            je = z[1],
            Fe = (0, u.useState)(!1),
            K = I()(Fe, 2),
            Te = K[0],
            Ne = K[1],
            V = (0, u.useCallback)(
              (function () {
                var i = A()(
                  f()().mark(function c(l) {
                    var r, t;
                    return f()().wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (r = !1),
                                (e.prev = 1),
                                (e.next = 4),
                                (0, b.gf)(l)
                              );
                            case 4:
                              ((t = e.sent),
                                (r = (t == null ? void 0 : t.data) === !0),
                                je(r),
                                (e.next = 12));
                              break;
                            case 9:
                              ((e.prev = 9),
                                (e.t0 = e.catch(1)),
                                console.error("err", e.t0));
                            case 12:
                              return (
                                (e.prev = 12),
                                Ne(!1),
                                e.abrupt("return", r)
                              );
                            case 16:
                            case "end":
                              return e.stop();
                          }
                      },
                      c,
                      null,
                      [[1, 9, 12, 16]],
                    );
                  }),
                );
                return function (c) {
                  return i.apply(this, arguments);
                };
              })(),
              [],
            ),
            R = (0, u.useCallback)(function () {
              var i = "/api/gaip/auth/getCaptcha?v="
                .concat(Math.random(), "&captchaId=")
                .concat(y.current);
              Ce(i);
            }, []),
            Y = (0, S.useRequest)(b.x4, {
              manual: !0,
              onSuccess: (function () {
                var i = A()(
                  f()().mark(function l(r) {
                    var t;
                    return f()().wrap(function (e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (!r) {
                              e.next = 10;
                              break;
                            }
                            return (
                              G(r),
                              (0, ae.lo)(r),
                              (e.next = 5),
                              Re(function (C) {
                                return g()(g()({}, C), {}, { userInfo: r });
                              })
                            );
                          case 5:
                            (m.ZP.success("\u767B\u5F55\u6210\u529F"),
                              r.disclaimerConfirmed !== !0 && Ae(!0),
                              (t =
                                window.__GAIP_SESSION_STORAGE__.getItem(
                                  "redirectAfterLogin",
                                )),
                              window.__GAIP_SESSION_STORAGE__.removeItem(
                                "redirectAfterLogin",
                              ),
                              setTimeout(function () {
                                t ? S.history.replace(t) : (0, ee.N)();
                              }, 0));
                          case 10:
                          case "end":
                            return e.stop();
                        }
                    }, l);
                  }),
                );
                function c(l) {
                  return i.apply(this, arguments);
                }
                return c;
              })(),
              onError: (function () {
                var i = A()(
                  f()().mark(function l(r) {
                    var t, d, e, C, n, J, B;
                    return f()().wrap(function (h) {
                      for (;;)
                        switch ((h.prev = h.next)) {
                          case 0:
                            if (
                              ((C =
                                r == null ||
                                (t = r.info) === null ||
                                t === void 0
                                  ? void 0
                                  : t.errorCode),
                              !ve.includes(C))
                            ) {
                              h.next = 6;
                              break;
                            }
                            return (
                              (J =
                                (n = v.current) === null || n === void 0
                                  ? void 0
                                  : n.getFieldValue("domainAccount")),
                              G({ domainAccount: J }),
                              S.history.replace("/no-permission"),
                              h.abrupt("return")
                            );
                          case 6:
                            if (
                              (m.ZP.error(
                                (r == null ||
                                (d = r.info) === null ||
                                d === void 0
                                  ? void 0
                                  : d.errorMessage) ||
                                  "\u767B\u5F55\u5931\u8D25",
                              ),
                              (B =
                                (e = v.current) === null ||
                                e === void 0 ||
                                (e = e.getFieldValue("domainAccount")) ===
                                  null ||
                                e === void 0
                                  ? void 0
                                  : e.trim()),
                              !B)
                            ) {
                              h.next = 11;
                              break;
                            }
                            return ((h.next = 11), V((0, F.KT)(B)));
                          case 11:
                            R();
                          case 12:
                          case "end":
                            return h.stop();
                        }
                    }, l);
                  }),
                );
                function c(l) {
                  return i.apply(this, arguments);
                }
                return c;
              })(),
            }),
            U = Y.loading,
            D = Y.run,
            H = (0, u.useCallback)(
              (function () {
                var i = A()(
                  f()().mark(function c(l) {
                    var r, t, d, e;
                    return f()().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            if (((r = P.current), r)) {
                              n.next = 4;
                              break;
                            }
                            return (
                              m.ZP.error(
                                "\u767B\u5F55\u6570\u636E\u4E22\u5931\uFF0C\u8BF7\u91CD\u65B0\u586B\u5199",
                              ),
                              n.abrupt("return")
                            );
                          case 4:
                            return (
                              (t = r.encryptedAccount),
                              (d = r.encryptedPassword),
                              (e = r.values),
                              (n.next = 7),
                              D(
                                g()(
                                  g()({}, e),
                                  {},
                                  {
                                    domainAccount: t,
                                    password: d,
                                    captcha: j ? e.captcha : "",
                                    captchaId: j ? y.current : "",
                                    lotNumber: l.lot_number,
                                    captchaOutput: l.captcha_output,
                                    passToken: l.pass_token,
                                    genTime: l.gen_time,
                                  },
                                ),
                                { skipErrorHandler: !0 },
                              )
                            );
                          case 7:
                            P.current = null;
                          case 8:
                          case "end":
                            return n.stop();
                        }
                    }, c);
                  }),
                );
                return function (c) {
                  return i.apply(this, arguments);
                };
              })(),
              [D, j],
            ),
            Oe = (0, u.useCallback)(
              (function () {
                var i = A()(
                  f()().mark(function c(l) {
                    var r, t, d, e;
                    return f()().wrap(function (n) {
                      for (;;)
                        switch ((n.prev = n.next)) {
                          case 0:
                            if (
                              ((r = (0, F.KT)(l.domainAccount)),
                              (t = (0, F.KT)(l.password)),
                              !(!r || !t))
                            ) {
                              n.next = 5;
                              break;
                            }
                            return (
                              m.ZP.error(
                                "\u52A0\u5BC6\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5",
                              ),
                              n.abrupt("return")
                            );
                          case 5:
                            if (l.captcha) {
                              n.next = 11;
                              break;
                            }
                            return ((n.next = 8), V(r));
                          case 8:
                            if (((d = n.sent), !d)) {
                              n.next = 11;
                              break;
                            }
                            return n.abrupt("return");
                          case 11:
                            if (
                              ((P.current = {
                                encryptedAccount: r,
                                encryptedPassword: t,
                                values: l,
                              }),
                              (0, p.KT)())
                            ) {
                              n.next = 22;
                              break;
                            }
                            return (k(!0), (n.next = 16), (0, p.Se)());
                          case 16:
                            if (((e = n.sent), k(!1), e)) {
                              n.next = 22;
                              break;
                            }
                            return (
                              m.ZP.error(
                                "\u9A8C\u8BC1\u7801\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5",
                              ),
                              (P.current = null),
                              n.abrupt("return")
                            );
                          case 22:
                            (0, p.aj)();
                          case 23:
                          case "end":
                            return n.stop();
                        }
                    }, c);
                  }),
                );
                return function (c) {
                  return i.apply(this, arguments);
                };
              })(),
              [D],
            ),
            De = (0, u.useMemo)(
              function () {
                return window.__GAIP_HTML_VIEW__.render(
                  "login-captchaWrap",
                  s,
                  {
                    captchaWrapContent: () =>
                      O &&
                      window.__GAIP_HTML_VIEW__.render("login-captchaImg", s, {
                        captchaImgProps: () => ({ src: O }),
                      }),
                    captchaWrapProps: () => ({ onClick: R }),
                  },
                );
              },
              [O, R],
            );
          return (
            (0, u.useLayoutEffect)(function () {
              document.title = "\u767B\u5F55";
            }, []),
            (0, u.useEffect)(
              function () {
                R();
              },
              [R],
            ),
            (0, u.useEffect)(
              function () {
                return (
                  (0, p.Ul)(),
                  (0, p.A0)(H),
                  (0, p.Ik)(function () {
                    m.ZP.error(
                      "\u9A8C\u8BC1\u7801\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5",
                    );
                  }),
                  function () {
                    ((0, p.A0)(null), (0, p.Ik)(null));
                  }
                );
              },
              [H],
            ),
            window.__GAIP_HTML_VIEW__.render("login-pageContainer", s, {
              logoProps: () => ({ src: _ }),
              sloganProps: () => ({ src: fe }),
              componentType: () => w.Z,
              componentType2: () => oe.A,
              componentType3: () => T.Z,
              componentProps: () => ({
                rules: [{ required: !0, message: "" }],
                allowClear: !1,
                fieldProps: g()({}, N),
              }),
              componentType4: () => T.Z.Password,
              componentProps2: () => ({
                rules: [{ required: !0, message: "" }],
                allowClear: !1,
                fieldProps: N,
              }),
              componentContent: () =>
                j
                  ? window.__GAIP_HTML_VIEW__.render("login-component", s, {
                      componentType: () => T.Z,
                      componentProps: () => ({
                        rules: [{ required: !0, message: "" }],
                        allowClear: !1,
                        fieldProps: g()(
                          g()({}, N),
                          {},
                          {
                            suffix: Te
                              ? window.__GAIP_HTML_VIEW__.render(
                                  "login-component-2",
                                  s,
                                  {
                                    componentType: () => w.Z,
                                    componentProps: () => ({ indicator: E }),
                                  },
                                )
                              : De,
                          },
                        ),
                      }),
                    })
                  : null,
              componentProps3: () => ({
                onFinish: Oe,
                formRef: v,
                requiredMark: !1,
                submitter: {
                  render: function () {
                    return window.__GAIP_HTML_VIEW__.render(
                      "login-loginBtn",
                      s,
                      {
                        loginBtnType: () => de.ZP,
                        componentType: () => ce,
                        loginBtnProps: () => ({
                          block: !0,
                          loading: ye,
                          disabled: U,
                        }),
                      },
                    );
                  },
                },
              }),
              componentProps4: () => ({ spinning: U, indicator: E }),
              cprtContent: () => pe,
            })
          );
        },
        he = ge;
    },
  },
]);
