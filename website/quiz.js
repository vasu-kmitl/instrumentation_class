/* =========================================================
   แบบฝึกหัดท้ายบท
   มาร์กอัปที่รองรับ (ภายใน <div class="quiz">):

   ปรนัย:
     <div class="q" data-answer="b">
       <p class="q-text">...</p>
       <label class="opt"><input type="radio" value="a"> ...</label>
       ...
       <div class="explain" hidden>คำอธิบาย</div>
     </div>

   เติมตัวเลข:
     <div class="q" data-type="num" data-answer="3.0" data-tol="0.02">
       <p class="q-text">...</p>
       <div class="num-input"><input type="number" step="any"> หน่วย</div>
       <div class="explain" hidden>...</div>
     </div>
     data-tol = ค่าคลาดเคลื่อนสัมพัทธ์ที่ยอมรับ (ค่าเริ่มต้น 2%)
   ========================================================= */
(function () {
  "use strict";

  function initQuiz(quiz, qi) {
    var items = Array.prototype.slice.call(quiz.querySelectorAll(".q"));

    items.forEach(function (q, i) {
      // ใส่ชื่อกลุ่มให้ radio และหมายเลขข้อ
      q.querySelectorAll('input[type="radio"]').forEach(function (r) {
        r.name = "quiz" + qi + "-q" + i;
      });
      var t = q.querySelector(".q-text");
      if (t && !t.querySelector(".qn")) {
        var n = document.createElement("span");
        n.className = "qn";
        n.textContent = (i + 1) + ".";
        t.insertBefore(n, t.firstChild);
      }
    });

    var actions = document.createElement("div");
    actions.className = "quiz-actions";
    var check = button("ตรวจคำตอบ", "btn");
    var reset = button("ล้างคำตอบ", "btn ghost");
    var score = document.createElement("span");
    score.className = "score";
    score.setAttribute("aria-live", "polite");
    actions.appendChild(check);
    actions.appendChild(reset);
    actions.appendChild(score);
    quiz.appendChild(actions);

    check.addEventListener("click", function () {
      var right = 0;
      items.forEach(function (q) { if (grade(q)) right++; });
      score.textContent = "ได้ " + right + " / " + items.length + " ข้อ";
    });

    reset.addEventListener("click", function () {
      items.forEach(function (q) { clear(q); clearInputs(q); });
      score.textContent = "";
    });
  }

  function button(label, cls) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = label;
    return b;
  }

  function grade(q) {
    clear(q);
    var ok = false;
    var answered = true;

    if (q.dataset.type === "num") {
      var input = q.querySelector("input");
      var v = parseFloat(String(input.value).replace(",", "."));
      var ans = parseFloat(q.dataset.answer);
      var tol = q.dataset.tol ? parseFloat(q.dataset.tol) : 0.02;
      if (isNaN(v)) {
        answered = false;
      } else {
        ok = ans === 0 ? Math.abs(v) <= tol : Math.abs(v - ans) <= Math.abs(ans) * tol;
        input.classList.add(ok ? "correct" : "wrong");
      }
    } else {
      var chosen = q.querySelector("input:checked");
      q.querySelectorAll("label.opt").forEach(function (lab) {
        var inp = lab.querySelector("input");
        if (inp.value === q.dataset.answer) lab.classList.add("correct");
        else if (inp.checked) lab.classList.add("wrong");
      });
      if (!chosen) answered = false;
      else ok = chosen.value === q.dataset.answer;
    }

    var ex = q.querySelector(".explain");
    if (ex) {
      var tag = document.createElement("span");
      tag.className = "verdict " + (ok ? "ok" : "no");
      tag.textContent = ok ? "ถูกต้อง" : (answered ? "ยังไม่ถูก" : "ยังไม่ได้ตอบ");
      ex.insertBefore(tag, ex.firstChild);
      ex.hidden = false;
    }
    return ok;
  }

  function clear(q) {
    q.querySelectorAll(".correct, .wrong").forEach(function (e) {
      e.classList.remove("correct", "wrong");
    });
    var ex = q.querySelector(".explain");
    if (ex) {
      var v = ex.querySelector(".verdict");
      if (v) v.remove();
      ex.hidden = true;
    }
  }

  function clearInputs(q) {
    q.querySelectorAll("input").forEach(function (i) {
      if (i.type === "radio") i.checked = false; else i.value = "";
    });
  }

  function init() {
    document.querySelectorAll(".quiz").forEach(initQuiz);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
