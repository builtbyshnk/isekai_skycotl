(function () {
  "use strict";

  var root = document.documentElement;

  /* ---- Theme toggle + persistence ---- */
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("isekai-theme", next);
      } catch (e) {}
    });
  }

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (navToggle && nav) {
    var setNav = function (open) {
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setNav(false);
    });
  }

  /* ---- Resolve the latest installer for the visitor's platform ---- */
  var downloadLinks = document.querySelectorAll(".js-download");
  var heroDownload = document.querySelector(".btn-download.js-download");
  var cachedAssetKey = "isekai-latest-release-assets";
  var releasesUrl = "https://github.com/builtbyshnk/isekai_skycotl/releases/latest";
  var baseAssets = {
    windows: "https://github.com/builtbyshnk/isekai_skycotl/releases/download/v0.2.2/Isekai_0.2.2_x64_en-US.msi",
    macos: "https://github.com/builtbyshnk/isekai_skycotl/releases/download/v0.2.2/Isekai_0.2.2_aarch64.dmg",
    linux: "https://github.com/builtbyshnk/isekai_skycotl/releases/download/v0.2.2/Isekai_0.2.2_amd64.AppImage"
  };

  var currentPlatform = function () {
    var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    var userAgent = navigator.userAgent || "";
    if (/mac/i.test(platform) || /Macintosh|Mac OS X/i.test(userAgent)) return "macos";
    if (/linux/i.test(platform) || /Linux|X11/i.test(userAgent)) return "linux";
    if (/win/i.test(platform) || /Windows/i.test(userAgent)) return "windows";
    return null;
  };

  var platformLabel = function (platform) {
    if (platform === "macos") return "macOS";
    if (platform === "linux") return "Linux";
    if (platform === "windows") return "Windows";
    return null;
  };

  var assetForPlatform = function (assets, platform) {
    var patterns = {
      windows: [/\.msi$/i, /\.exe$/i],
      macos: [/\.dmg$/i],
      linux: [/\.appimage$/i, /\.deb$/i, /\.rpm$/i]
    };
    var candidates = patterns[platform] || [];
    for (var i = 0; i < candidates.length; i += 1) {
      var asset = assets.find(function (item) {
        return candidates[i].test(item.name || "") && !/\.sig$/i.test(item.name || "");
      });
      if (asset && asset.browser_download_url) return asset.browser_download_url;
    }
    return null;
  };

  var setDownloadUrl = function (url, platform) {
    downloadLinks.forEach(function (link) {
      link.href = url;
      if (platform) link.setAttribute("download", "");
      else link.removeAttribute("download");
    });

    var label = platformLabel(platform);
    if (heroDownload && label) heroDownload.textContent = "Get Isekai for " + label + " 🚀";
  };

  if (downloadLinks.length) {
    var platform = currentPlatform();
    setDownloadUrl((platform && baseAssets[platform]) || releasesUrl, platform);

    fetch("https://api.github.com/repos/builtbyshnk/isekai_skycotl/releases/latest", {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        var rateLimited =
          res.status === 429 ||
          (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0");
        if (rateLimited) throw new Error("GitHub API rate limit exceeded");
        if (!res.ok) throw new Error("GitHub API " + res.status);
        return res.json();
      })
      .then(function (release) {
        var assets = release.assets || [];
        var urls = {
          windows: assetForPlatform(assets, "windows"),
          macos: assetForPlatform(assets, "macos"),
          linux: assetForPlatform(assets, "linux")
        };
        try {
          localStorage.setItem(cachedAssetKey, JSON.stringify(urls));
        } catch (e) {}
        setDownloadUrl((platform && urls[platform]) || release.html_url || releasesUrl, platform && urls[platform] ? platform : null);
      })
      .catch(function () {
        try {
          var cached = JSON.parse(localStorage.getItem(cachedAssetKey) || "{}");
          setDownloadUrl((platform && cached[platform]) || (platform && baseAssets[platform]) || releasesUrl, platform);
        } catch (e) {
          setDownloadUrl((platform && baseAssets[platform]) || releasesUrl, platform);
        }
      });
  }

  /* ---- Scroll reveal (progressive enhancement) ---- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealables.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealables.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
