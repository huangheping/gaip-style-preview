(function () {
  if (window.__GAIP_PRODUCT_CARD_LOGO__) {
    window.__GAIP_PRODUCT_CARD_LOGO__.refresh();
    return;
  }

  var logoMap = {
    "AXA安盛": "./web/logos/axa.svg",
    "FWD富卫": "./web/logos/fwd.svg",
    "Allianz": "./web/logos/allianz.svg",
    "MSH（大地财险）": "./web/logos/msh.svg",
    "Prudential": "./web/logos/prudential.png",
    "中国太平": "./web/logos/taiping90.png",
    "中国人寿": "./web/logos/chinalife.png",
    "北京人寿": "./web/logos/beijinglife.png",
    "保诚": "./web/logos/prudential.png",
    "友邦": "./web/logos/aia.svg",
    "友邦人寿": "./web/logos/aia.svg",
    "友邦保险": "./web/logos/aia.svg",
    "安盛": "./web/logos/axa.svg",
    "安联人寿": "./web/logos/allianz.svg",
    "富卫": "./web/logos/fwd.svg",
    "永明": "./web/logos/sunlife.svg",
    "中英人寿": "./web/logos/citicprudential.png",
    "复星保德信": "./web/logos/prudential.png",
    "陆家嘴国泰": "./web/logos/taiping.png",
    "安记": "./web/logos/axa.svg",
    "永记": "./web/logos/sunlife.svg",
    "Glory": "./web/static/glory-gaip-logo.png",
    "中国香港": "./web/static/glory-gaip-logo.png",
    "圣基茨和尼维斯": "./web/static/glory-gaip-logo.png",
    "新加坡": "./web/static/glory-gaip-logo.png",
    "阿联酋(迪拜)": "./web/static/glory-gaip-logo.png"
  };

  var fallbackLogo = "./web/static/glory-gaip-logo.png";
  var scheduleId = 0;

  function readProvider(card) {
    var tags = card.querySelectorAll(".tag___kCxbL");
    if (!tags.length) return "";
    return tags[tags.length - 1].textContent.trim();
  }

  function addLogo(card, src, provider) {
    if (card.querySelector(".logoSlotLocal")) return;

    var slot = document.createElement("div");
    slot.className = "logoSlotLocal";

    var img = document.createElement("img");
    img.src = src;
    img.alt = (provider || "GAIP") + " logo";
    img.loading = "lazy";

    slot.appendChild(img);
    card.appendChild(slot);
    card.classList.add("hasLocalLogo");
  }

  function init() {
    var cards = document.querySelectorAll(".productCard___AMkTa");
    cards.forEach(function (card) {
      var provider = readProvider(card);
      var src = logoMap[provider] || fallbackLogo;
      addLogo(card, src, provider);
    });
  }

  function scheduleInit() {
    window.clearTimeout(scheduleId);
    scheduleId = window.setTimeout(init, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  var observer = new MutationObserver(scheduleInit);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.__GAIP_PRODUCT_CARD_LOGO__ = {
    refresh: init
  };
})();
