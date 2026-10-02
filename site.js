(function () {
	"use strict";
	var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// header becomes solid after scrolling
	var top = document.querySelector(".top");
	function onScroll() {
		if (top) top.classList.toggle("solid", window.scrollY > 40 || !document.body.classList.contains("home"));
	}
	window.addEventListener("scroll", onScroll, {passive: true});
	onScroll();

	// mobile menu
	var burger = document.querySelector(".burger");
	var menu = document.querySelector(".menu");
	if (burger && menu) {
		burger.addEventListener("click", function () {
			var open = burger.getAttribute("aria-expanded") !== "true";
			burger.setAttribute("aria-expanded", String(open));
			menu.classList.toggle("open", open);
		});
		menu.querySelectorAll("a").forEach(function (a) {
			a.addEventListener("click", function () {
				burger.setAttribute("aria-expanded", "false");
				menu.classList.remove("open");
			});
		});
	}

	// reveal on scroll
	var items = document.querySelectorAll(".reveal");
	if ("IntersectionObserver" in window && !reduce) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (e.isIntersecting) {
					var siblings = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
					e.target.style.transitionDelay = Math.min(siblings, 6) * 70 + "ms";
					e.target.classList.add("in");
					io.unobserve(e.target);
				}
			});
		}, {threshold: 0.12, rootMargin: "0px 0px -40px 0px"});
		items.forEach(function (el) { io.observe(el); });
	} else {
		items.forEach(function (el) { el.classList.add("in"); });
	}

	// hero slideshow (slow crossfade with zoom)
	var slides = document.querySelectorAll(".slide");
	var dots = document.querySelector(".dots");
	if (slides.length && dots) {
		var current = 0, timer;
		slides.forEach(function (s, i) {
			var b = document.createElement("button");
			b.setAttribute("aria-label", "Scene " + (i + 1));
			if (i === 0) b.className = "on";
			b.addEventListener("click", function () { show(i); restart(); });
			dots.appendChild(b);
		});
		function show(i) {
			slides[current].classList.remove("on");
			dots.children[current].classList.remove("on");
			current = i;
			slides[current].classList.add("on");
			dots.children[current].classList.add("on");
		}
		function restart() {
			clearInterval(timer);
			if (!reduce) timer = setInterval(function () { show((current + 1) % slides.length); }, 6500);
		}
		restart();
	}

	// golden threads drifting across the hero (the "carpet" weave)
	var canvas = document.querySelector(".threads");
	if (canvas && !reduce) {
		var ctx = canvas.getContext("2d"), w, h, dpr, t = 0;
		function size() {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth; h = canvas.clientHeight;
			canvas.width = w * dpr; canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		size();
		window.addEventListener("resize", size);
		var lines = [];
		for (var k = 0; k < 7; k++) lines.push({y: 0.55 + k * 0.035, a: 18 + k * 6, f: 0.0016 + k * 0.00018, p: k * 0.9, o: 0.10 + (k % 3) * 0.05});
		function draw() {
			ctx.clearRect(0, 0, w, h);
			lines.forEach(function (l) {
				var g = ctx.createLinearGradient(0, 0, w, 0);
				g.addColorStop(0, "rgba(201,164,92,0)");
				g.addColorStop(0.5, "rgba(227,197,138," + l.o + ")");
				g.addColorStop(1, "rgba(201,164,92,0)");
				ctx.strokeStyle = g;
				ctx.lineWidth = 1;
				ctx.beginPath();
				for (var x = 0; x <= w; x += 8) {
					var y = h * l.y + Math.sin(x * l.f + t + l.p) * l.a + Math.sin(x * l.f * 2.3 - t * 0.7) * l.a * 0.35;
					if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
				}
				ctx.stroke();
			});
			t += 0.006;
			requestAnimationFrame(draw);
		}
		draw();
	}

	// count-up numbers
	document.querySelectorAll("[data-count]").forEach(function (el) {
		if (reduce) return;
		var end = +el.dataset.count, start = null;
		el.textContent = "0";
		function step(ts) {
			if (!start) start = ts;
			var p = Math.min((ts - start) / 1600, 1);
			el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
			if (p < 1) requestAnimationFrame(step);
		}
		setTimeout(function () { requestAnimationFrame(step); }, 600);
	});

	// channel filters
	var filters = document.querySelectorAll(".filters button");
	var cards = document.querySelectorAll(".card");
	filters.forEach(function (b) {
		b.addEventListener("click", function () {
			filters.forEach(function (x) { x.classList.toggle("on", x === b); });
			cards.forEach(function (c) { c.classList.toggle("hide", b.dataset.f !== "all" && c.dataset.cat !== b.dataset.f); });
		});
	});

	// card spotlight + gentle tilt
	if (!reduce && window.matchMedia("(hover: hover)").matches) {
		cards.forEach(function (c) {
			c.addEventListener("mousemove", function (e) {
				var r = c.getBoundingClientRect();
				var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
				c.style.setProperty("--mx", x * 100 + "%");
				c.style.setProperty("--my", y * 100 + "%");
				c.style.transform = "perspective(900px) rotateY(" + (x - 0.5) * 6 + "deg) rotateX(" + (0.5 - y) * 6 + "deg) translateY(-4px)";
			});
			c.addEventListener("mouseleave", function () { c.style.transform = ""; });
		});
	}
})();
