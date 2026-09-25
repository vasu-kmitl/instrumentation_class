/* =========================================================
   Sidebar navigation
   - รายชื่อบทกำหนดไว้ใน CHAPTERS (แก้ที่นี่ที่เดียว)
   - หัวข้อย่อยของหน้าปัจจุบันสร้างอัตโนมัติจาก <h2 id="..."> ใน <main>
   - ไฮไลต์หัวข้อที่กำลังอ่าน, ปุ่มเปิด/ปิดบนจอเล็ก, ลิงก์บทก่อนหน้า/ถัดไป
   ========================================================= */
(function () {
  "use strict";

  var CHAPTERS = [
    { href: "index.html",          num: "",   title: "หน้าแรก / ภาพรวมรายวิชา" },
    { href: "ch1-circuits.html",   num: "01", title: "เครื่องมือวัดและวงจรพื้นฐาน" },
    { href: "ch2-opamps.html",     num: "02", title: "การปรับสภาพสัญญาณและ Op-Amp" },
    { href: "ch3-digital.html",    num: "03", title: "สัญญาณดิจิทัล ADC และ Interface" }
  ];

  var COURSE = {
    code: "01386309",
    name: "Agricultural Instrumentation & IoT",
    sub: "สื่อการสอน Part 2 · KMITL"
  };

  function currentFile() {
    var path = decodeURIComponent(window.location.pathname);
    var file = path.substring(path.lastIndexOf("/") + 1);
    return file === "" ? "index.html" : file;
  }

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "className") e.className = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
    }
    if (text != null) e.textContent = text;
    return e;
  }

  function buildSidebar() {
    var nav = document.getElementById("sidebar");
    if (!nav) return;

    var here = currentFile();
    var headings = Array.prototype.slice.call(document.querySelectorAll("main h2[id]"));

    var brand = el("a", { className: "brand", href: "index.html" });
    brand.appendChild(el("span", { className: "code" }, COURSE.code));
    brand.appendChild(el("span", { className: "name" }, COURSE.name));
    brand.appendChild(el("span", { className: "sub" }, COURSE.sub));
    nav.appendChild(brand);

    var list = el("ul");
    CHAPTERS.forEach(function (ch) {
      var li = el("li", { className: "chapter" });
      var a = el("a", { href: ch.href });
      a.appendChild(el("span", { className: "num" }, ch.num || "⌂"));
      a.appendChild(el("span", null, ch.title));
      li.appendChild(a);

      if (ch.href === here) {
        li.classList.add("current");
        a.setAttribute("aria-current", "page");
        if (headings.length) {
          var sub = el("ul", { className: "sections" });
          headings.forEach(function (h) {
            var sli = el("li");
            var label = h.getAttribute("data-nav");
            if (!label) {
              var no = h.querySelector(".sec-no");
              var rest = h.textContent.replace(no ? no.textContent : "", "").trim();
              label = no ? no.textContent.trim() + "  " + rest : rest;
            }
            var sa = el("a", { href: "#" + h.id }, label);
            sa.dataset.target = h.id;
            sli.appendChild(sa);
            sub.appendChild(sli);
          });
          li.appendChild(sub);
        }
      }
      list.appendChild(li);
    });
    nav.appendChild(list);

    nav.appendChild(el("div", { className: "side-foot" },
      "© Vasu Udompetaikul, Dept. of Biosystems & Agricultural Engineering, KMITL"));

    // ปิดเมนูบนมือถือเมื่อคลิกลิงก์
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) document.body.classList.remove("nav-open");
    });

    setupScrollSpy(nav, headings);
  }

  function setupScrollSpy(nav, headings) {
    if (!headings.length) return;
    var links = {};
    nav.querySelectorAll(".sections a").forEach(function (a) { links[a.dataset.target] = a; });

    // หัวข้อที่ active = หัวข้อสุดท้ายที่เลื่อนผ่านขอบบนของจอแล้ว
    function update() {
      var active = headings[0].id;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top < 140) active = headings[i].id;
      }
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle("active", id === active);
      });
    }
    window.addEventListener("scroll", throttle(update, 100), { passive: true });
    update();
  }

  function throttle(fn, ms) {
    var t = 0;
    return function () {
      var now = Date.now();
      if (now - t > ms) { t = now; fn(); }
    };
  }

  function buildMobileToggle() {
    var btn = document.querySelector(".menu-btn");
    var backdrop = el("div", { className: "sidebar-backdrop" });
    document.body.appendChild(backdrop);
    if (btn) {
      btn.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
      });
    }
    backdrop.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") document.body.classList.remove("nav-open");
    });
  }

  function buildPager() {
    var holder = document.getElementById("pager");
    if (!holder) return;
    var here = currentFile();
    var idx = -1;
    CHAPTERS.forEach(function (c, i) { if (c.href === here) idx = i; });
    if (idx < 0) return;

    holder.className = "pager";
    var prev = CHAPTERS[idx - 1];
    var next = CHAPTERS[idx + 1];
    if (prev) {
      var a = el("a", { className: "prev", href: prev.href });
      a.appendChild(el("small", null, "← ก่อนหน้า"));
      a.appendChild(document.createTextNode(prev.title));
      holder.appendChild(a);
    } else {
      holder.appendChild(el("span"));
    }
    if (next) {
      var b = el("a", { className: "next", href: next.href });
      b.appendChild(el("small", null, "ถัดไป →"));
      b.appendChild(document.createTextNode(next.title));
      holder.appendChild(b);
    }
  }

  function init() {
    buildSidebar();
    buildMobileToggle();
    buildPager();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
