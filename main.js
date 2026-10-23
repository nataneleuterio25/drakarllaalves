/* ==== CONFIGURAÇÃO — preencher quando a Dra. Karlla confirmar o número ====
   whatsapp: somente dígitos com DDI+DDD, ex.: "5562999999999". Vazio = contato via Instagram. */
const CONFIG = {
  whatsapp: "5562981451973",
  instagram: "https://www.instagram.com/advogadakarlla/",
};

(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  if (lowEnd) root.classList.add("lite");

  /* Contato: WhatsApp (se configurado) com mensagem pré-preenchida; senão, Instagram */
  const wa = (CONFIG.whatsapp || "").replace(/\D/g, "");
  $$("[data-contact]").forEach((a) => {
    if (wa) {
      const msg = a.dataset.msg || "Olá, Dra. Karlla. Gostaria de apresentar uma dúvida.";
      a.href = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
    } else a.href = CONFIG.instagram;
    a.target = "_blank"; a.rel = "noopener noreferrer";
  });
  const fab = $(".fab");
  if (wa && fab) {
    fab.hidden = false; fab.href = `https://wa.me/${wa}`;
    $$("[data-wa-only]").forEach((e) => (e.hidden = false));
    const off = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? off.add(e.target) : off.delete(e.target)));
      fab.classList.toggle("is-off", off.size > 0);
    });
    ["#faq", "#contato", ".ft"].forEach((s) => $(s) && io.observe($(s)));
  }

  /* Header: fundo após sair do topo */
  const hd = $(".hd"), sentinel = $("#topo-sentinel");
  if ("IntersectionObserver" in window && sentinel)
    new IntersectionObserver(([e]) => hd.classList.toggle("is-scrolled", !e.isIntersecting)).observe(sentinel);
  else addEventListener("scroll", () => hd.classList.toggle("is-scrolled", scrollY > 60), { passive: true });

  /* Menu mobile */
  const burger = $(".burger"), nav = $("#menu"), page = $$("main,footer");
  const mq = matchMedia("(min-width:1100px)");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    page.forEach((el) => (el.inert = open));
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); }
  });
  mq.addEventListener("change", () => setMenu(false));

  /* Link ativo na navegação */
  if ("IntersectionObserver" in window) {
    const links = $$('.nav a[href^="#"]');
    const so = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) => l.getAttribute("href") === "#" + e.target.id ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current"));
    }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((l) => { const s = $(l.getAttribute("href")); s && so.observe(s); });
  }

  /* Accordion */
  $$(".acc button").forEach((b) => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") === "true";
    $$(".acc button").forEach((o) => { o.setAttribute("aria-expanded", "false"); $("#" + o.getAttribute("aria-controls")).classList.remove("is-open"); });
    if (!open) { b.setAttribute("aria-expanded", "true"); $("#" + b.getAttribute("aria-controls")).classList.add("is-open"); }
  }));

  /* Scroll-linked: o progresso (--p, 0→1) de cada elemento acompanha a rolagem e é reversível.
     Leituras de layout agrupadas antes das escritas; um único rAF por frame. */
  const items = [...$$("[data-r]"), ...$$("[data-rg]>*")];
  $$("[data-rg]").forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--d", Math.min(i, 5))));
  const ease = (t) => t * t * (3 - 2 * t), clamp = (v) => Math.max(0, Math.min(1, v));
  let queued = false;
  const frame = () => {
    queued = false;
    const H = innerHeight, y = scrollY, atEnd = root.scrollHeight - y - H < 8;
    const ps = items.map((el) => {
      const t = el.getBoundingClientRect().top, d = +el.style.getPropertyValue("--d") || 0;
      const p = ease(clamp((H * 0.98 - t) / (H * 0.5) - d * 0.1));
      return atEnd && t < H ? 1 : p; // no fim da página, garante que tudo visível esteja revelado
    });
    items.forEach((el, i) => { if (Math.abs((el._p ?? -1) - ps[i]) > 0.004) { el._p = ps[i]; el.style.setProperty("--p", ps[i].toFixed(3)); } });
    root.style.setProperty("--sp", (y / Math.max(1, root.scrollHeight - H)).toFixed(4));
    root.style.setProperty("--hs", clamp(y / H).toFixed(3));
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  if (!reduced) {
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    frame();
  }
  window.__revealReady = true;
})();
