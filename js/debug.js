/**
 * debug.js
 * Press [Tab] to run a quick debug check and show results in an alert.
 * Checks: game iframe load state, CDN reachability (jsDelivr, githack, statically).
 *
 * Drop a <script defer src="js/debug.js"></script> in your page (after loader.js).
 */

(function () {
  // ─── CDN probe targets ───────────────────────────────────────────────────────
  // Each entry: { label, url }
  // Using tiny known-good files (or no-op endpoints) to test reachability.
  const CDN_PROBES = [
    {
      label: "jsdelivr",
      url: "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js",
    },
    {
      label: "githack",
      // rawgit/githack serve files from GitHub repos — ping their worker
      url: "https://rawcdn.githack.com/nicolo-ribaudo/tc39-proposal-async-explicit-resource-management/refs/heads/main/README.md",
    },
    {
      label: "statically",
      url: "https://cdn.statically.io/gh/nicolo-ribaudo/tc39-proposal-async-explicit-resource-management/main/README.md",
    },
  ];

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Probe a single URL with fetch (HEAD preferred, falls back to GET).
   * Resolves with { ok: true, status, ms } or { ok: false, status: null, error, ms }.
   */
  function probeCDN({ label, url }) {
    const t0 = performance.now();
    return fetch(url, { method: "HEAD", cache: "no-store", mode: "no-cors" })
      .then((res) => ({
        label,
        // mode: no-cors → opaque response, status is always 0 but no network error = reachable
        ok: true,
        status: res.status || "opaque/ok",
        ms: Math.round(performance.now() - t0),
      }))
      .catch((err) => ({
        label,
        ok: false,
        status: null,
        error: err.message,
        ms: Math.round(performance.now() - t0),
      }));
  }

  /**
   * Check the #gameframe iframe load state.
   * Returns an object describing what we know about its current state.
   */
  function checkGameFrame() {
    const frame = document.getElementById("gameframe");
    if (!frame) {
      return { found: false };
    }

    const src = frame.src || frame.getAttribute("src") || "";
    let contentAccessible = false;
    let contentError = null;

    try {
      // Cross-origin frames will throw; same-origin gives us the doc
      const doc = frame.contentDocument || frame.contentWindow?.document;
      contentAccessible = !!doc;
    } catch (e) {
      contentAccessible = false;
      contentError = e.message;
    }

    // readyState of the inner document (same-origin only)
    let innerReady = "n/a (cross-origin or inaccessible)";
    try {
      const doc = frame.contentDocument || frame.contentWindow?.document;
      if (doc) innerReady = doc.readyState;
    } catch (_) {}

    return {
      found: true,
      src: src || "(empty)",
      offsetWidth: frame.offsetWidth,
      offsetHeight: frame.offsetHeight,
      display: getComputedStyle(frame).display,
      visibility: getComputedStyle(frame).visibility,
      contentAccessible,
      contentError,
      innerReady,
    };
  }

  // ─── Report renderer ──────────────────────────────────────────────────────────

  function renderReport(frameInfo, cdnResults) {
    const lines = [];
    const tick = "✓";
    const cross = "✗";
    const warn = "⚠";

    // ── frame ──
    lines.push("── game frame (#gameframe) ──");

    if (!frameInfo.found) {
      lines.push(`  ${cross} not found — no element with id="gameframe"`);
    } else {
      const dimOk = frameInfo.offsetWidth > 0 && frameInfo.offsetHeight > 0;
      lines.push(`  found       : true`);
      lines.push(`  src         : ${frameInfo.src}`);
      lines.push(
        `  dimensions  : ${frameInfo.offsetWidth} × ${frameInfo.offsetHeight}px  ${
          dimOk ? tick : warn + " (zero size — may not be visible)"
        }`
      );
      lines.push(`  display     : ${frameInfo.display}`);
      lines.push(`  visibility  : ${frameInfo.visibility}`);
      lines.push(`  inner ready : ${frameInfo.innerReady}`);
      if (!frameInfo.contentAccessible && frameInfo.contentError) {
        lines.push(`  cross-origin: ${warn} ${frameInfo.contentError}`);
      } else if (frameInfo.contentAccessible) {
        lines.push(`  accessible  : ${tick} (same-origin)`);
      }

      // Summarize loaded state
      const srcLoaded = frameInfo.src && frameInfo.src !== "(empty)";
      if (!srcLoaded) {
        lines.push(`  ${warn}  src is empty — frame has not been given a URL yet`);
      } else if (frameInfo.innerReady === "complete") {
        lines.push(`  ${tick}  frame document loaded (readyState=complete)`);
      } else if (frameInfo.innerReady === "n/a (cross-origin or inaccessible)") {
        lines.push(`  ${tick}  frame src set; content is cross-origin (normal)`);
      } else {
        lines.push(`  ${warn}  frame loading... (readyState=${frameInfo.innerReady})`);
      }
    }

    // ── cdn ──
    lines.push("");
    lines.push("── cdn reachability ──");

    for (const r of cdnResults) {
      const icon = r.ok ? tick : cross;
      const status = r.ok
        ? `ok  [${r.ms}ms]`
        : `fail  [${r.ms}ms]  ${r.error || ""}`;
      const pad = " ".repeat(Math.max(0, 12 - r.label.length));
      lines.push(`  ${icon}  ${r.label}${pad}: ${status}`);
    }

    // ── summary ──
    lines.push("");
    lines.push("── summary ──");
    const allCdnOk = cdnResults.every((r) => r.ok);
    const frameOk =
      frameInfo.found &&
      frameInfo.src !== "(empty)" &&
      frameInfo.offsetWidth > 0;

    lines.push(`  game frame  : ${frameOk ? tick + " looks good" : cross + " needs attention"}`);
    lines.push(
      `  cdns        : ${
        allCdnOk
          ? tick + " all reachable"
          : cross +
            " failed: " +
            cdnResults
              .filter((r) => !r.ok)
              .map((r) => r.label)
              .join(", ")
      }`
    );
    lines.push("");
    lines.push("tab to re-run.");

    return lines.join("\n");
  }

  // ─── Main trigger ─────────────────────────────────────────────────────────────

  let running = false;

  document.addEventListener("keydown", async function (e) {
    if (e.key !== "Tab") return;

    // Don't block normal tab navigation when an input is focused
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    e.preventDefault();

    if (running) return; // debounce
    running = true;

    // Gather data
    const frameInfo = checkGameFrame();
    const cdnResults = await Promise.all(CDN_PROBES.map(probeCDN));

    running = false;

    const report = renderReport(frameInfo, cdnResults);
    alert(report);
  });

  console.log(
    "[debug.js] loaded — press tab to run debug check (skips when an input is focused)"
  );
})();
