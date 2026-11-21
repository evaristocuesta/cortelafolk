// One dialog for both collections: the three posters and each year's gallery.
// Triggers are real links, so without JavaScript the image simply opens on its
// own; with JavaScript they open this dialog instead and can be navigated with
// the on-screen arrows, the keyboard, or a horizontal swipe on touch screens.
//
// The media cell holds a strip of three photographs — previous, current, next —
// so dragging reveals the neighbour in real time, like a native carousel. The
// whole strip translates with the finger; committing a swipe slides it one cell
// and re-centres it on the photograph that was already on screen.
//
// Re-centring rotates the roles of the three <img> elements instead of rewriting
// their sources: the element that already shows the incoming photograph becomes
// the centre and keeps its decoded bitmap, so no frame can flash the previous
// photograph (or an empty cell) while the new source settles. Only the cell that
// ends up off-screen is given a new photograph to load.
interface Group {
	items: HTMLAnchorElement[];
	index: number;
}

export function bindLightbox(dialogSelector = '[data-lightbox]'): void {
	const dialog = document.querySelector<HTMLDialogElement>(dialogSelector);
	if (!dialog || typeof dialog.showModal !== 'function') return;
	const track = dialog.querySelector<HTMLElement>('[data-lightbox-track]');
	const centreCell = dialog.querySelector<HTMLImageElement>('[data-lightbox-image]');
	const prevCell = dialog.querySelector<HTMLImageElement>('[data-lightbox-neighbor="prev"]');
	const nextCell = dialog.querySelector<HTMLImageElement>('[data-lightbox-neighbor="next"]');
	const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
	const counter = dialog.querySelector<HTMLElement>('[data-lightbox-counter]');
	const media = dialog.querySelector<HTMLElement>('.editions-lightbox-media');
	const triggers = [...document.querySelectorAll<HTMLAnchorElement>('a[data-lightbox-open]')];
	if (!track || !centreCell || !prevCell || !nextCell || !media || triggers.length === 0) return;

	const group: Group = { items: [], index: 0 };
	const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
	const canAnimate = typeof track.animate === 'function';
	let image = centreCell;
	let previous = prevCell;
	let next = nextCell;
	let sliding = false;

	// Every cell of the strip is painted from its trigger, so the neighbours
	// carry the same alternative text and reserved proportions as the centre.
	const paint = (target: HTMLImageElement, trigger: HTMLAnchorElement | undefined) => {
		if (!trigger) return;
		const thumb = trigger.querySelector('img');
		target.src = trigger.href;
		target.alt = thumb?.alt ?? '';
		const width = thumb?.getAttribute('width');
		const height = thumb?.getAttribute('height');
		if (width && height) {
			target.setAttribute('width', width);
			target.setAttribute('height', height);
		}
	};

	const setRole = (target: HTMLImageElement, role: 'prev' | 'next' | 'centre') => {
		if (role === 'centre') {
			target.removeAttribute('data-lightbox-neighbor');
			target.setAttribute('data-lightbox-image', '');
			return;
		}
		target.removeAttribute('data-lightbox-image');
		target.setAttribute('data-lightbox-neighbor', role);
	};

	const describe = () => {
		if (caption) caption.textContent = image.alt;
		if (counter) counter.textContent = `${group.index + 1} de ${group.items.length}`;
	};

	const render = () => {
		const total = group.items.length;
		if (total === 0) return;
		// Opening always starts from the markup's own three cells.
		image = centreCell;
		previous = prevCell;
		next = nextCell;
		setRole(image, 'centre');
		setRole(previous, 'prev');
		setRole(next, 'next');
		paint(image, group.items[group.index]);
		// The neighbours are visible while dragging, so they are loaded before
		// the visitor commits to them; the strip wraps at both ends.
		paint(previous, group.items[(group.index - 1 + total) % total]);
		paint(next, group.items[(group.index + 1) % total]);
		describe();
	};

	// Hand the centre role to the cell that is already showing the incoming
	// photograph. Its source is untouched, so its bitmap cannot flash.
	const rotate = (offset: number) => {
		const wasImage = image;
		const wasPrevious = previous;
		const wasNext = next;
		if (offset > 0) {
			image = wasNext;
			previous = wasImage;
			next = wasPrevious;
		} else {
			image = wasPrevious;
			previous = wasNext;
			next = wasImage;
		}
		setRole(image, 'centre');
		setRole(previous, 'prev');
		setRole(next, 'next');
	};

	const step = (offset: number) => {
		const total = group.items.length;
		if (total === 0) return;
		group.index = (group.index + offset + total) % total;
		rotate(offset);
		// Only the cell that moved into the far slot needs a new photograph;
		// it sits outside the window, so it loads out of sight.
		if (offset > 0) paint(next, group.items[(group.index + 1) % total]);
		else paint(previous, group.items[(group.index - 1 + total) % total]);
		describe();
	};

	const move = (x: number) => { track.style.transform = x ? `translateX(${x}px)` : ''; };

	// Slide the strip one cell, then re-centre it on the new photograph. The
	// swap happens in the same task as the cancel, so the visitor never sees
	// the strip jump: the incoming cell already shows the photograph that
	// ends up in the centre.
	const slide = (offset: number, from = 0) => {
		sliding = true;
		if (!canAnimate || calm.matches) {
			move(0);
			step(offset);
			sliding = false;
			return;
		}
		// The stride is measured from the strip itself (one cell plus the CSS
		// gap between prints), so the incoming photograph lands exactly
		// centred without duplicating the gap value here.
		const here = image.getBoundingClientRect();
		const there = (offset > 0 ? next : previous).getBoundingClientRect();
		const width = Math.abs(there.left - here.left);
		const exit = track.animate(
			[{ transform: `translateX(${from}px)` }, { transform: `translateX(${-offset * width}px)` }],
			{ duration: 180, easing: 'ease-out', fill: 'forwards' },
		);
		exit.onfinish = () => {
			exit.cancel();
			move(0);
			step(offset);
			sliding = false;
		};
	};

	// One transition at a time: a second press while the strip is moving would
	// stack animations and jump the strip.
	const go = (offset: number) => { if (!sliding) slide(offset); };

	dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]')?.addEventListener('click', () => go(-1));
	dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]')?.addEventListener('click', () => go(1));
	dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
	// Escape closes natively through the dialog's own cancel behaviour.
	dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
	dialog.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
		if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
	});

	// Swipe on touch screens: the strip follows the finger, revealing the
	// neighbouring photograph, then settles onto it (left = next, right =
	// previous, like the arrow keys). Vertical drags stay scrolls and a tap
	// never changes the image. Pointer capture keeps the gesture alive even
	// if the finger leaves the media cell before it is lifted.
	let startX = 0;
	let startY = 0;
	let dragX = 0;
	let tracking = false;
	media.addEventListener('pointerdown', (event) => {
		if (sliding || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) return;
		tracking = true;
		startX = event.clientX;
		startY = event.clientY;
		dragX = 0;
		// Synthetic or already-released pointers cannot be captured; the
		// gesture still works, it just ends wherever the finger is lifted.
		try { media.setPointerCapture(event.pointerId); } catch { /* no active pointer */ }
	});
	media.addEventListener('pointermove', (event) => {
		if (!tracking || calm.matches) return;
		dragX = event.clientX - startX;
		// Only once the gesture reads as horizontal, so a scroll does not
		// nudge the strip sideways on its way past.
		if (Math.abs(dragX) > Math.abs(event.clientY - startY)) move(dragX);
	});
	media.addEventListener('pointerup', (event) => {
		if (!tracking) return;
		tracking = false;
		const dx = event.clientX - startX;
		const dy = event.clientY - startY;
		const committed = Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5;
		if (!committed) {
			// Not a swipe: let the strip settle back where it was.
			if (dragX && canAnimate && !calm.matches) track.animate([{ transform: `translateX(${dragX}px)` }, { transform: 'translateX(0)' }], { duration: 160, easing: 'ease-out' });
			move(0);
			return;
		}
		slide(dx < 0 ? 1 : -1, dragX);
	});
	media.addEventListener('pointercancel', () => { tracking = false; move(0); });

	// Release the decoded photographs as soon as they are out of view.
	dialog.addEventListener('close', () => {
		move(0);
		for (const target of [image, previous, next]) target.removeAttribute('src');
	});

	triggers.forEach((trigger) => {
		trigger.addEventListener('click', (event) => {
			event.preventDefault();
			group.items = triggers.filter((item) => item.dataset.group === trigger.dataset.group);
			group.index = Math.max(0, group.items.indexOf(trigger));
			render();
			dialog.showModal();
		});
	});
}
