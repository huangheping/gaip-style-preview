(function () {
  if (window.__GAIP_PRODUCT_CARD_LOGO__) {
    window.__GAIP_PRODUCT_CARD_LOGO__.refresh();
    return;
  }

  var logoMap = {
    "AXA安盛": "./shared/assets/icons/business/product/axa.svg",
    "FWD富卫": "./shared/assets/icons/business/product/fwd.svg",
    "Allianz": "./shared/assets/icons/business/product/allianz.svg",
    "MSH（大地财险）": "./shared/assets/icons/business/product/msh.svg",
    "Prudential": "./shared/assets/icons/brand/product/prudential.png",
    "中国太平": "./shared/assets/icons/brand/product/taiping90.png",
    "中国人寿": "./shared/assets/icons/brand/product/chinalife.png",
    "北京人寿": "./shared/assets/icons/brand/product/beijinglife.png",
    "保诚": "./shared/assets/icons/brand/product/prudential.png",
    "友邦": "./shared/assets/icons/business/product/aia.svg",
    "友邦人寿": "./shared/assets/icons/business/product/aia.svg",
    "友邦保险": "./shared/assets/icons/business/product/aia.svg",
    "安盛": "./shared/assets/icons/business/product/axa.svg",
    "安联人寿": "./shared/assets/icons/business/product/allianz.svg",
    "富卫": "./shared/assets/icons/business/product/fwd.svg",
    "永明": "./shared/assets/icons/business/product/sunlife.svg",
    "中英人寿": "./shared/assets/icons/brand/product/citicprudential.png",
    "复星保德信": "./shared/assets/icons/brand/product/prudential.png",
    "陆家嘴国泰": "./shared/assets/icons/brand/product/taiping.png",
    "安记": "./shared/assets/icons/business/product/axa.svg",
    "永记": "./shared/assets/icons/business/product/sunlife.svg",
    "Glory": "./shared/assets/icons/brand/product/glory-gaip-logo.png",
    "中国香港": "./shared/assets/icons/brand/product/glory-gaip-logo.png",
    "圣基茨和尼维斯": "./shared/assets/icons/brand/product/glory-gaip-logo.png",
    "新加坡": "./shared/assets/icons/brand/product/glory-gaip-logo.png",
    "阿联酋(迪拜)": "./shared/assets/icons/brand/product/glory-gaip-logo.png"
  };

  var fallbackLogo = "./shared/assets/icons/brand/product/glory-gaip-logo.png";
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
