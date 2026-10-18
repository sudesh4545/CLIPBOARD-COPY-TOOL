(function () {
        "use strict";
        var KEY = "clipnest:v1",
          items = [],
          active = null,
          $ = function (x) {
            return document.getElementById(x);
          };
        try {
          items = JSON.parse(localStorage.getItem(KEY) || "[]");
        } catch (x) {}
        function persist() {
          localStorage.setItem(
            KEY,
            JSON.stringify(
              items.filter(function (x) {
                return !x.sensitive;
              }),
            ),
          );
        }
        function draw() {
          var q = $("search").value.toLowerCase();
          $("list").innerHTML = "";
          items
            .filter(function (x) {
              return (x.title + " " + x.content).toLowerCase().includes(q);
            })
            .forEach(function (x) {
              var b = document.createElement("button");
              b.className = "item" + (x.id === active ? " active" : "");
              b.innerHTML = "<b></b><small></small>";
              b.querySelector("b").textContent = x.title;
              b.querySelector("small").textContent = x.content.slice(0, 65);
              b.onclick = function () {
                load(x.id);
              };
              $("list").appendChild(b);
            });
          if (!$("list").children.length)
            $("list").innerHTML = '<p class="hint">No snippets found.</p>';
        }
        function load(id) {
          active = id;
          var x = items.find(function (a) {
            return a.id === id;
          });
          $("title").value = x.title;
          $("content").value = x.content;
          $("sensitive").checked = !!x.sensitive;
          $("heading").textContent = x.title;
          count();
          draw();
        }
        function count() {
          $("count").textContent =
            $("content").value.length +
            " characters · " +
            ($("content").value.trim()
              ? $("content").value.trim().split(/\s+/).length
              : 0) +
            " words";
        }
        function fresh() {
          active = null;
          $("title").value = "";
          $("content").value = "";
          $("sensitive").checked = false;
          $("heading").textContent = "New snippet";
          count();
          draw();
        }
        $("new").onclick = fresh;
        $("save").onclick = function () {
          var title = $("title").value.trim(),
            content = $("content").value;
          if (!title || !content)
            return ($("status").textContent = "Add a title and content.");
          var x = items.find(function (a) {
            return a.id === active;
          });
          if (x)
            Object.assign(x, {
              title: title,
              content: content,
              sensitive: $("sensitive").checked,
            });
          else {
            active = crypto.randomUUID();
            items.unshift({
              id: active,
              title: title,
              content: content,
              sensitive: $("sensitive").checked,
            });
          }
          persist();
          $("status").textContent = $("sensitive").checked
            ? "Saved for this session only."
            : "Saved locally.";
          draw();
        };
        $("copy").onclick = async function () {
          try {
            await navigator.clipboard.writeText($("content").value);
            $("status").textContent = "Copied ✓";
          } catch (x) {
            $("content").select();
            $("status").textContent =
              "Clipboard blocked — text selected for manual copy.";
          }
        };
        $("paste").onclick = async function () {
          try {
            $("content").value = await navigator.clipboard.readText();
            count();
          } catch (x) {
            $("status").textContent =
              "Clipboard read blocked — paste into the editor normally.";
          }
        };
        $("remove").onclick = function () {
          if (active && confirm("Delete this snippet?")) {
            items = items.filter(function (x) {
              return x.id !== active;
            });
            persist();
            fresh();
          }
        };
        $("search").oninput = draw;
        $("content").oninput = count;
        if (items.length) load(items[0].id);
        else fresh();
      })();
