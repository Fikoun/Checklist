(function () {
  "use strict";

  var DATA_URL = "checklist.json";
  var listId = null;
  var state = {}; // { checkboxId: true }
  var data = null;

  var els = {
    title: document.getElementById("list-title"),
    subtitle: document.getElementById("list-subtitle"),
    main: document.getElementById("checklist"),
    fill: document.getElementById("progress-fill"),
    label: document.getElementById("progress-label"),
    reset: document.getElementById("reset-btn"),
  };

  // ---------- Persistence ----------
  function storageKey() {
    return "checklist:" + listId;
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(storageKey());
      state = raw ? JSON.parse(raw) : {};
    } catch (e) {
      state = {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state));
    } catch (e) {
      /* storage may be unavailable (private mode) — progress just won't persist */
    }
  }

  function isChecked(id) {
    return state[id] === true;
  }

  function setChecked(id, value) {
    if (value) {
      state[id] = true;
    } else {
      delete state[id];
    }
    saveState();
  }

  // ---------- Rendering ----------
  function buildPlainItem(item) {
    var row = document.createElement("label");
    row.className = "item-row";

    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = isChecked(item.id);
    input.addEventListener("change", function () {
      setChecked(item.id, input.checked);
      updateProgress();
    });

    var body = document.createElement("span");
    body.className = "item-body";

    var label = document.createElement("span");
    label.className = "item-label";
    label.textContent = item.label;
    if (item.badge) {
      label.appendChild(makeBadge(item.badge));
    }
    body.appendChild(label);

    if (item.note) {
      var note = document.createElement("span");
      note.className = "item-note";
      note.textContent = item.note;
      body.appendChild(note);
    }

    row.appendChild(input);
    row.appendChild(body);
    return row;
  }

  function buildChoiceGroup(item) {
    var group = document.createElement("div");
    group.className = "choice-group";
    group.dataset.groupId = item.id;

    var head = document.createElement("div");
    head.className = "choice-head";

    var title = document.createElement("span");
    title.className = "choice-title";
    title.textContent = item.label;
    head.appendChild(title);
    if (item.badge) {
      head.appendChild(makeBadge(item.badge));
    }

    var doneTag = document.createElement("span");
    doneTag.className = "choice-done-tag";
    doneTag.textContent = "sbaleno";
    head.appendChild(doneTag);

    if (item.note) {
      var note = document.createElement("span");
      note.className = "choice-note";
      note.textContent = item.note;
      head.appendChild(note);
    }
    group.appendChild(head);

    var list = document.createElement("ul");
    list.className = "choice-options";

    item.options.forEach(function (opt) {
      var li = document.createElement("li");

      var optLabel = document.createElement("label");
      optLabel.className = "choice-option" + (opt.badge === "recommended" ? " is-recommended" : "");

      var input = document.createElement("input");
      input.type = "checkbox";
      input.checked = isChecked(opt.id);
      input.addEventListener("change", function () {
        setChecked(opt.id, input.checked);
        refreshGroupDone(group, item);
        updateProgress();
      });

      var span = document.createElement("span");
      span.className = "opt-label";
      span.textContent = opt.label;
      if (opt.badge) {
        span.appendChild(makeBadge(opt.badge));
      }

      optLabel.appendChild(input);
      optLabel.appendChild(span);
      li.appendChild(optLabel);
      list.appendChild(li);
    });

    group.appendChild(list);
    refreshGroupDone(group, item);
    return group;
  }

  function makeBadge(type) {
    var badge = document.createElement("span");
    if (type === "essential") {
      badge.className = "badge badge-ess";
      badge.textContent = "Nezbytné";
    } else {
      badge.className = "badge badge-rec";
      badge.textContent = "doporučeno";
    }
    return badge;
  }

  function isGroupDone(item) {
    return item.options.some(function (opt) {
      return isChecked(opt.id);
    });
  }

  function refreshGroupDone(groupEl, item) {
    groupEl.classList.toggle("is-done", isGroupDone(item));
  }

  function render() {
    els.main.innerHTML = "";
    data.sections.forEach(function (section) {
      var sec = document.createElement("section");
      sec.className = "section";

      var h2 = document.createElement("h2");
      h2.className = "section-title";
      h2.textContent = section.name;
      sec.appendChild(h2);

      section.items.forEach(function (item) {
        if (Array.isArray(item.options)) {
          sec.appendChild(buildChoiceGroup(item));
        } else {
          sec.appendChild(buildPlainItem(item));
        }
      });

      els.main.appendChild(sec);
    });
  }

  // ---------- Progress ----------
  function computeProgress() {
    var total = 0;
    var done = 0;
    data.sections.forEach(function (section) {
      section.items.forEach(function (item) {
        total += 1;
        if (Array.isArray(item.options)) {
          if (isGroupDone(item)) done += 1;
        } else if (isChecked(item.id)) {
          done += 1;
        }
      });
    });
    return { total: total, done: done };
  }

  function updateProgress() {
    var p = computeProgress();
    var pct = p.total === 0 ? 0 : Math.round((p.done / p.total) * 100);
    els.fill.style.width = pct + "%";
    var allDone = p.total > 0 && p.done === p.total;
    els.label.textContent = allDone
      ? "Všechno sbaleno! 🎒 (" + p.done + "/" + p.total + ")"
      : p.done + " z " + p.total + " sbaleno";
  }

  // ---------- Reset ----------
  function resetAll() {
    if (!window.confirm("Opravdu vymazat všechna zaškrtnutí? Nelze vrátit zpět.")) return;
    state = {};
    saveState();
    render();
    updateProgress();
  }

  // ---------- Init ----------
  function showError(msg) {
    els.main.innerHTML = "";
    var p = document.createElement("p");
    p.className = "error";
    p.textContent = msg;
    els.main.appendChild(p);
  }

  function init(loaded) {
    data = loaded;
    listId = data.id || "default";
    document.title = data.title || "Seznam na sbalení";
    els.title.textContent = data.title || "Seznam na sbalení";
    els.subtitle.textContent = data.subtitle || "";
    loadState();
    render();
    updateProgress();
  }

  els.reset.addEventListener("click", resetAll);

  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(init)
    .catch(function (err) {
      showError(
        "Seznam se nepodařilo načíst (" +
          err.message +
          "). Pokud jsi soubor otevřel přímo, spusť místo toho lokální server — viz README."
      );
    });
})();
