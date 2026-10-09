/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_89dd6f4797 = (function () {
  var templates = {"renderTemplates-1":"\n        <button\n          class=\"template-option {{gaip:0}}\"\n          type=\"button\"\n          role=\"option\"\n          aria-selected=\"{{gaip:1}}\"\n          data-template=\"{{gaip:2}}\"\n        >\n          <span class=\"template-thumb\">\n            <img src=\"{{gaip:3}}\" alt=\"\" loading=\"lazy\">\n          </span>\n          <span class=\"template-copy\">\n            <strong>{{gaip:4}}</strong>\n            <span>{{gaip:5}}</span>\n          </span>\n          <span class=\"selected-mark\" aria-hidden=\"true\">\n            <img src=\"./../../shared/assets/icons/business/海报分享/gaip-icon-complete.svg\" alt=\"\">\n          </span>\n        </button>\n      ","renderUploader-2":"<img src=\"{{gaip:0}}\" alt=\"{{gaip:1}}\">","renderUploader-3":"<img class=\"upload-placeholder-icon\" src=\"./../../shared/assets/icons/business/海报分享/up-load-icon1.svg\" alt=\"\">","renderUploader-4":"<img class=\"upload-placeholder-icon\" src=\"./../../shared/assets/icons/business/海报分享/up-load-icon2.svg\" alt=\"\">"};
  return function (id, values) {
    if (!Object.prototype.hasOwnProperty.call(templates, id)) throw new Error("Missing HTML template: " + id);
    return templates[id].replace(/\{\{gaip:(\d+)\}\}/g, function (_, index) {
      if (!values || !Object.prototype.hasOwnProperty.call(values, index)) throw new Error("Missing HTML binding: " + id + ":" + index);
      return values[index];
    });
  };
}());
/* @gaip-markup-cache:end */
const templates = [
      { id: "medal", name: "金色勋章", note: "稳重 · 财富洞察", image: "./assets/poster-04-bull.jpg" },
      { id: "partner", name: "合作共赢", note: "柔和 · 客户关系", image: "./assets/poster-01-news.jpg" },
      { id: "global", name: "全球脉络", note: "开放 · 全球视野", image: "./assets/poster-05-globe.jpg" },
      { id: "compass", name: "财富罗盘", note: "温暖 · 方向指引", image: "./assets/poster-02-global.jpg" },
      { id: "key", name: "传承之钥", note: "经典 · 家族传承", image: "./assets/poster-08-key.jpg" },
      { id: "bull", name: "财富向上", note: "力量 · 市场趋势", image: "./assets/poster-03-medal.jpg" },
      { id: "globe", name: "全球坐标", note: "专业 · 跨境配置", image: "./assets/poster-13-digital.jpg" },
      { id: "news", name: "新闻聚焦", note: "醒目 · 重点资讯", image: "./assets/poster-07-water.jpg" },
      { id: "digital", name: "数字资讯", note: "科技 · 快速阅读", image: "./assets/poster-06-sail.jpg" },
      { id: "sail", name: "乘风而行", note: "清朗 · 长期主义", image: "./assets/poster-12-partner.jpg" },
      { id: "water", name: "流动趋势", note: "深邃 · 市场观察", image: "./assets/poster-09-shadow.jpg" },
      { id: "shadow", name: "洞见未来", note: "克制 · 人物观点", image: "./assets/poster-10-data.jpg" },
      { id: "data", name: "数据纹理", note: "理性 · 行业分析", image: "./assets/poster-11-compass.jpg" }
    ];

    const fallbackArticle = {
      title: "企业主传承讨论前置，信托架构更强调治理规则",
      summary: "越来越多企业主把家族治理、企业股权和现金流安排同时纳入传承设计，单一资产隔离已不能满足复杂需求。",
      category: "家族信托",
      tags: "受益人安排 / 企业传承",
      date: "2026-08-25 21:00",
      score: "89",
      slot: "夜间深度",
      featured: false
    };

    function queryValue(params, key, fallback) {
      const value = params.get(key);
      return value == null || value === "" ? fallback : value;
    }

    function readArticleFromQuery() {
      const params = new URLSearchParams(window.location.search);
      return {
        title: queryValue(params, "title", fallbackArticle.title),
        summary: queryValue(params, "summary", fallbackArticle.summary),
        category: queryValue(params, "category", fallbackArticle.category),
        tags: queryValue(params, "tags", fallbackArticle.tags),
        date: queryValue(params, "date", fallbackArticle.date),
        score: queryValue(params, "score", fallbackArticle.score),
        slot: queryValue(params, "slot", fallbackArticle.slot),
        featured: queryValue(params, "featured", String(fallbackArticle.featured)) === "true"
      };
    }

    const state = {
      template: templates[0],
      article: readArticleFromQuery(),
      cardEnabled: false,
      name: "",
      avatar: null,
      qr: null,
      deleted: null
    };

    const dialog = document.getElementById("shareDialog");
    const templateList = document.getElementById("templateList");
    const poster = document.getElementById("poster");
    const posterSource = document.getElementById("posterSource");
    const posterTitle = document.getElementById("posterTitle");
    const posterFeaturedBadge = document.getElementById("posterFeaturedBadge");
    const posterMeta = document.getElementById("posterMeta");
    const posterSummary = document.getElementById("posterSummary");
    const posterDateDay = document.getElementById("posterDateDay");
    const posterDateYear = document.getElementById("posterDateYear");
    const posterCard = document.getElementById("posterCard");
    const posterCardCopy = document.getElementById("posterCardCopy");
    const posterCardTitle = document.getElementById("posterCardTitle");
    const posterShare = document.getElementById("posterShare");
    const posterName = document.getElementById("posterName");
    const posterAvatar = document.getElementById("posterAvatar");
    const posterQr = document.getElementById("posterQr");
    const cardSwitch = document.getElementById("cardSwitch");
    const cardPanel = document.querySelector(".card-panel");
    const nameInput = document.getElementById("nameInput");
    const nameCount = document.getElementById("nameCount");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    const toastAction = document.getElementById("toastAction");
    const uploaders = {
      avatar: {
        root: document.getElementById("avatarUploader"),
        input: document.getElementById("avatarInput"),
        visual: document.getElementById("avatarVisual"),
        title: document.getElementById("avatarTitle")
      },
      qr: {
        root: document.getElementById("qrUploader"),
        input: document.getElementById("qrInput"),
        visual: document.getElementById("qrVisual"),
        title: document.getElementById("qrTitle")
      }
    };
    let toastTimer;

    function renderTemplates() {
      templateList.innerHTML = templates.map((template) => __gaipMarkup_89dd6f4797("renderTemplates-1", [('' + (template.id === state.template.id ? "is-active" : "")), ('' + (template.id === state.template.id)), ('' + (template.id)), ('' + (template.image)), ('' + (template.name)), ('' + (template.note))])).join("");
    }

    function setTemplate(id) {
      const nextTemplate = templates.find((template) => template.id === id);
      if (!nextTemplate || nextTemplate.id === state.template.id) return;
      state.template = nextTemplate;
      poster.classList.add("is-changing");
      setTimeout(() => {
        posterSource.src = nextTemplate.image;
        poster.dataset.template = nextTemplate.id;
        requestAnimationFrame(() => poster.classList.remove("is-changing"));
      }, 90);
      renderTemplates();
    }

    function posterDateParts(dateText) {
      const match = String(dateText).match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(.+))?/);
      if (!match) return { day: "资讯", year: dateText };
      return {
        day: `${match[2]}/${match[3]}`,
        year: match[1]
      };
    }

    function articleMeta() {
      return [
        state.article.category,
        state.article.tags
      ].filter(Boolean).join(" | ");
    }

    function renderArticlePoster() {
      const dateParts = posterDateParts(state.article.date);
      posterTitle.textContent = state.article.title;
      posterFeaturedBadge.hidden = !state.article.featured;
      posterMeta.textContent = articleMeta();
      posterSummary.textContent = state.article.summary;
      posterDateDay.textContent = dateParts.day;
      posterDateYear.textContent = dateParts.year;
    }

    function setCardEnabled(enabled) {
      state.cardEnabled = enabled;
      dialog.classList.toggle("card-enabled", enabled);
      cardSwitch.setAttribute("aria-checked", String(enabled));
      renderPosterIdentity();
      if (enabled && window.matchMedia("(min-width: 821px)").matches) {
        setTimeout(() => nameInput.focus(), 220);
      } else if (enabled) {
        setTimeout(() => {
          cardPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }

    function renderPosterIdentity() {
      const name = state.name.trim();
      const hasName = Boolean(name);
      const hasAvatar = Boolean(state.avatar);
      const hasQr = Boolean(state.qr);
      const hasIdentity = hasName || hasAvatar || hasQr;

      posterCard.classList.toggle("is-visible", state.cardEnabled && hasIdentity);
      posterCard.classList.toggle("has-name", hasName);
      posterCard.classList.toggle("has-avatar", hasAvatar);
      posterCard.classList.toggle("has-qr", hasQr);
      posterCard.classList.toggle("signature-only", hasName && !hasQr);

      posterName.textContent = name;
      posterCardTitle.hidden = !hasQr;
      posterShare.hidden = !hasName;
      posterCardCopy.hidden = !hasQr && !hasName;
      nameCount.textContent = state.name.length;
      nameInput.value = state.name;

      posterAvatar.hidden = !hasAvatar;
      posterAvatar.replaceChildren();
      if (hasAvatar) {
        const avatarImage = document.createElement("img");
        avatarImage.src = state.avatar.url;
        avatarImage.alt = hasName ? `${name}的头像` : "分享人头像";
        posterAvatar.appendChild(avatarImage);
      }

      posterQr.hidden = !hasQr;
      posterQr.replaceChildren();
      if (hasQr) {
        const qrImage = document.createElement("img");
        qrImage.src = state.qr.url;
        qrImage.alt = "个人微信二维码";
        posterQr.appendChild(qrImage);
      }
    }

    function renderUploader(kind) {
      const uploader = uploaders[kind];
      const image = state[kind];
      uploader.root.classList.toggle("has-image", Boolean(image));
      uploader.root.setAttribute("role", image ? "group" : "button");
      uploader.root.setAttribute("tabindex", image ? "-1" : "0");
      uploader.root.setAttribute("aria-label", image
        ? `${kind === "avatar" ? "头像" : "二维码"}预览与操作`
        : `上传${kind === "avatar" ? "头像" : "微信二维码"}`
      );

      if (image) {
        uploader.visual.innerHTML = __gaipMarkup_89dd6f4797("renderUploader-2", [('' + (image.url)), ('' + (kind === "avatar" ? "头像预览" : "二维码预览"))]);
        uploader.title.textContent = image.name;
      } else if (kind === "avatar") {
        uploader.visual.innerHTML = __gaipMarkup_89dd6f4797("renderUploader-3");
        uploader.title.textContent = "上传头像";
      } else {
        uploader.visual.innerHTML = __gaipMarkup_89dd6f4797("renderUploader-4");
        uploader.title.textContent = "上传二维码";
      }
      renderPosterIdentity();
    }

    function showToast(message, actionLabel = "", action = null) {
      clearTimeout(toastTimer);
      toastMessage.textContent = message;
      toastAction.textContent = actionLabel;
      toastAction.onclick = action;
      toast.classList.add("is-visible");
      toastTimer = setTimeout(() => toast.classList.remove("is-visible"), action ? 8000 : 2600);
    }

    function validateFile(file) {
      if (!file) return "未选择图片";
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return "仅支持 JPG、PNG 或 WEBP 图片";
      if (file.size > 5 * 1024 * 1024) return "图片不能超过 5MB";
      return "";
    }

    function handleFile(kind, file) {
      const error = validateFile(file);
      if (error) {
        showToast(error);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        state[kind] = { url: reader.result, name: file.name, file };
        renderUploader(kind);
        showToast(kind === "avatar" ? "头像已更新" : "二维码已更新");
      };
      reader.readAsDataURL(file);
    }

    function removeImage(kind) {
      const previous = state[kind];
      if (!previous) return;
      state[kind] = null;
      renderUploader(kind);
      showToast(kind === "avatar" ? "头像已移除" : "二维码已移除", "撤销", () => {
        state[kind] = previous;
        renderUploader(kind);
        toast.classList.remove("is-visible");
      });
    }

    function bindUploader(kind) {
      const uploader = uploaders[kind];
      const openPicker = () => {
        uploader.input.value = "";
        uploader.input.click();
      };

      uploader.root.addEventListener("click", (event) => {
        if (event.target.closest(".delete-btn")) return;
        openPicker();
      });

      uploader.root.addEventListener("keydown", (event) => {
        if (!state[kind] && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          openPicker();
        }
      });

      uploader.input.addEventListener("change", () => handleFile(kind, uploader.input.files[0]));

      ["dragenter", "dragover"].forEach((eventName) => {
        uploader.root.addEventListener(eventName, (event) => {
          event.preventDefault();
          uploader.root.classList.add("is-dragging");
        });
      });

      ["dragleave", "drop"].forEach((eventName) => {
        uploader.root.addEventListener(eventName, (event) => {
          event.preventDefault();
          uploader.root.classList.remove("is-dragging");
        });
      });

      uploader.root.addEventListener("drop", (event) => handleFile(kind, event.dataTransfer.files[0]));
    }

    function loadCanvasImage(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });
    }

    function drawImageCover(ctx, image, x, y, width, height) {
      const imageRatio = image.width / image.height;
      const frameRatio = width / height;
      let sourceWidth = image.width;
      let sourceHeight = image.height;
      let sourceX = 0;
      let sourceY = 0;
      if (imageRatio > frameRatio) {
        sourceWidth = image.height * frameRatio;
        sourceX = (image.width - sourceWidth) / 2;
      } else {
        sourceHeight = image.width / frameRatio;
        sourceY = (image.height - sourceHeight) / 2;
      }
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
    }

    function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
      let line = "";
      let lineIndex = 0;
      for (const character of text) {
        const testLine = line + character;
        if (ctx.measureText(testLine).width > maxWidth && line) {
          ctx.fillText(line, x, y + lineIndex * lineHeight);
          line = character;
          lineIndex += 1;
          if (lineIndex >= maxLines) return y + lineIndex * lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line && lineIndex < maxLines) {
        ctx.fillText(line, x, y + lineIndex * lineHeight);
        lineIndex += 1;
      }
      return y + lineIndex * lineHeight;
    }

    function roundRect(ctx, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    }

    function posterCanvasFont(size, weight = 400) {
      const family = getComputedStyle(document.body).fontFamily;
      return `${weight >= 600 ? 700 : 400} ${size}px ${family}`;
    }

    function drawArticleContent(ctx, sourcePoster) {
      const dateParts = posterDateParts(state.article.date);
      ctx.drawImage(sourcePoster, 0, 0, 750, 981);

      ctx.fillStyle = getComputedStyle(poster).getPropertyValue("--cyan").trim();
      ctx.fillRect(30, 172, 5, 61);
      ctx.fillStyle = "#ffffff";
      ctx.font = posterCanvasFont(36, 600);
      ctx.fillText(dateParts.day, 48, 207);
      ctx.font = posterCanvasFont(23);
      ctx.fillText(dateParts.year, 48, 240);

      const cardSurface = ctx.createLinearGradient(0, 277, 0, 889);
      cardSurface.addColorStop(0, "#ffffff");
      cardSurface.addColorStop(0.72, "#ffffff");
      cardSurface.addColorStop(1, "rgba(255,255,255,0.96)");
      ctx.fillStyle = cardSurface;
      ctx.fillRect(29, 277, 693, 612);

      ctx.fillStyle = "#26353b";
      ctx.font = posterCanvasFont(34, 600);
      let titleX = 64;
      if (state.article.featured) {
        ctx.fillStyle = "#f2ca61";
        roundRect(ctx, 59, 310, 86, 36, 5);
        ctx.fill();
        ctx.fillStyle = "#8a6515";
        ctx.font = posterCanvasFont(21, 600);
        ctx.fillText("AI精选", 69, 335);
        titleX = 159;
      }
      ctx.fillStyle = "#26353b";
      ctx.font = posterCanvasFont(36, 600);
      let nextY = drawWrappedText(ctx, state.article.title, titleX, 342, 633 - (titleX - 59), 57, 3) + 13;

      ctx.fillStyle = "#899397";
      ctx.font = posterCanvasFont(18);
      nextY = drawWrappedText(ctx, articleMeta(), 59, nextY, 633, 28, 2) + 23;

      ctx.fillStyle = "#47565c";
      ctx.font = posterCanvasFont(27);
      drawWrappedText(ctx, state.article.summary, 59, nextY, 633, 48, 6);
    }

    async function downloadPoster() {
      const button = document.getElementById("downloadBtn");
      const shareName = state.name.trim();
      const hasName = Boolean(shareName);
      const hasAvatar = Boolean(state.avatar);
      const hasQr = Boolean(state.qr);
      const hasIdentity = hasName || hasAvatar || hasQr;
      const saveWithIdentity = state.cardEnabled && hasIdentity;
      button.disabled = true;
      button.querySelector("span").textContent = "生成中...";

      try {
        // Canvas does not inherit CSS fonts; wait for the same project font before drawing.
        await Promise.all([
          document.fonts.load(posterCanvasFont(36)),
          document.fonts.load(posterCanvasFont(36, 600))
        ]);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 750;
        canvas.height = 981;
        const sourcePoster = await loadCanvasImage(state.template.image);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 750, 981);
        drawArticleContent(ctx, sourcePoster);

        const cardSurface = ctx.createLinearGradient(0, 800, 0, 981);
        cardSurface.addColorStop(0, "rgba(255,255,255,0.99)");
        cardSurface.addColorStop(0.72, "#f0faf9");
        cardSurface.addColorStop(1, "#e8f5f4");
        ctx.fillStyle = cardSurface;
        ctx.fillRect(0, 800, 750, 181);

        if (saveWithIdentity) {
          const noQrOffsetY = hasQr ? 0 : 22;
          ctx.strokeStyle = "#dbe4e4";
          ctx.beginPath();
          ctx.moveTo(46, 822);
          ctx.lineTo(704, 822);
          ctx.stroke();
          if (hasQr) {
            const qrImage = await loadCanvasImage(state.qr.url);
            ctx.fillStyle = "#eef3f3";
            ctx.fillRect(46, 842, 82, 82);
            drawImageCover(ctx, qrImage, 46, 842, 82, 82);

            ctx.fillStyle = "#26353b";
            ctx.font = posterCanvasFont(24, 600);
            ctx.fillText("扫码添加我的微信", 150, 872);
          }

          if (hasName) {
            const nameOnly = !hasQr && !hasAvatar;
            ctx.fillStyle = hasQr ? "#738084" : "#49585d";
            ctx.font = hasQr ? posterCanvasFont(20) : posterCanvasFont(24, 600);
            ctx.textAlign = nameOnly ? "center" : "left";
            ctx.fillText(`由 ${shareName} 分享`, nameOnly ? 375 : (hasQr ? 150 : 46), (hasQr ? 907 : 889) + noQrOffsetY);
            ctx.textAlign = "left";
          }

          if (hasAvatar) {
            const avatarCenterX = !hasQr && !hasName ? 375 : 666;
            const avatarLeft = avatarCenterX - 31;
            const avatarImage = await loadCanvasImage(state.avatar.url);
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarCenterX, 884 + noQrOffsetY, 31, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = "#e2e9e8";
            ctx.fillRect(avatarLeft, 853 + noQrOffsetY, 62, 62);
            drawImageCover(ctx, avatarImage, avatarLeft, 853 + noQrOffsetY, 62, 62);
            ctx.restore();
          }
        }

        ctx.fillStyle = "#a4adaf";
        ctx.font = posterCanvasFont(16);
        ctx.textAlign = "center";
        ctx.fillText("以上内容由 AI 辅助生成，仅供参考，不构成具体产品收益承诺", 375, 963);

        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((result) => result ? resolve(result) : reject(new Error("PNG 生成失败")), "image/png", 1);
        });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `GAIP-文章海报-${Date.now()}.png`;
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        showToast(state.cardEnabled && !hasIdentity
          ? "未填写名片信息，已按无名片海报保存"
          : "海报已生成并开始下载"
        );
      } catch (error) {
        console.error(error);
        showToast("海报生成失败，请刷新页面后重试");
      } finally {
        button.disabled = false;
        button.querySelector("span").textContent = "保存海报";
      }
    }

    templateList.addEventListener("click", (event) => {
      const option = event.target.closest("[data-template]");
      if (option) setTemplate(option.dataset.template);
    });

    cardSwitch.addEventListener("click", () => setCardEnabled(!state.cardEnabled));
    function postToHost(message) {
      if (!window.parent || window.parent === window) return;
      window.parent.postMessage(
        message,
        window.location.protocol === "file:" ? "*" : window.location.origin
      );
    }

    window.addEventListener("message", (event) => {
      if (!event.data || event.data.type !== "gaip-poster-share:update") return;
      state.article = Object.assign({}, fallbackArticle, event.data.article || {});
      renderArticlePoster();
    });

    document.getElementById("closeBtn").addEventListener("click", () => {
      if (window.parent && window.parent !== window) {
        postToHost({ type: "gaip-poster-share:close" });
        return;
      }
      showToast("这是原型预览，弹窗暂不关闭");
    });
    document.getElementById("downloadBtn").addEventListener("click", downloadPoster);

    nameInput.addEventListener("input", (event) => {
      state.name = event.target.value;
      renderPosterIdentity();
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        removeImage(button.dataset.kind);
      });
    });

    bindUploader("avatar");
    bindUploader("qr");
    posterSource.src = state.template.image;
    poster.dataset.template = state.template.id;
    renderTemplates();
    renderUploader("avatar");
    renderUploader("qr");
    renderArticlePoster();
    renderPosterIdentity();
    postToHost({ type: "gaip-poster-share:ready" });
