const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const sections = document.querySelectorAll<HTMLElement>('main > section, body > footer');

// Hide content only after enhancement is available. Never use hidden,
// display:none or aria-hidden: readers and keyboard navigation keep access.
if (!motionPreference.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
	let animationsEnabled = true;
	const activeAnimations = new Map<HTMLElement, Animation>();
	const bypassedSections = new Set<HTMLElement>();
	const revealedSections = new Set<HTMLElement>();
	const setContentState = (section: HTMLElement, state: 'pending' | 'visible') => {
		const content = section.firstElementChild;
		if (content instanceof HTMLElement) content.dataset.scrollReveal = state;
	};
	const cancelAnimation = (section: HTMLElement) => {
		activeAnimations.get(section)?.cancel();
		activeAnimations.delete(section);
	};
	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			const section = entry.target as HTMLElement;
			if (!entry.isIntersecting) {
				cancelAnimation(section);
				bypassedSections.delete(section);
				revealedSections.delete(section);
				setContentState(section, section.contains(document.activeElement) ? 'visible' : 'pending');
				continue;
			}
			if (revealedSections.has(section)) continue;

			// Very tall sections cannot fit halfway into a viewport. Cap the
			// required visible height at half the viewport so mobile still animates.
			const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
			const requiredVisibleHeight = Math.min(entry.boundingClientRect.height, viewportHeight) * 0.5;
			if (entry.intersectionRect.height < requiredVisibleHeight) continue;
			revealedSections.add(section);

			// Keep full-width backgrounds stationary and reveal their content.
			const content = section.firstElementChild;
			if (!(content instanceof HTMLElement) || bypassedSections.has(section) || section.contains(document.activeElement)) continue;
			cancelAnimation(section);
			setContentState(section, 'visible');

			const animation = content.animate(
				[
					{ opacity: 0, translate: '0 60px' },
					{ opacity: 1, translate: '0 0' },
				],
				{ duration: 1100, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
			);
			activeAnimations.set(section, animation);
			animation.addEventListener('finish', () => activeAnimations.delete(section), { once: true });
		}
	}, { threshold: Array.from({ length: 101 }, (_, index) => index / 100) });

	const revealImmediately = (section: HTMLElement) => {
		bypassedSections.add(section);
		cancelAnimation(section);
		setContentState(section, 'visible');
	};

	const revealHashTarget = () => {
		if (!animationsEnabled) return;
		const target = document.getElementById(window.location.hash.slice(1));
		const section = target?.closest<HTMLElement>('main > section, body > footer');
		if (!section) return;
		cancelAnimation(section);
		bypassedSections.delete(section);
		revealedSections.delete(section);
		setContentState(section, 'pending');
		// Re-observing also restarts a section that is already on screen.
		// The observer still waits for enough visibility during smooth scrolling.
		observer.unobserve(section);
		observer.observe(section);
	};

	sections.forEach((section) => {
		setContentState(section, section.contains(document.activeElement) ? 'visible' : 'pending');
		observer.observe(section);
	});
	revealHashTarget();
	window.addEventListener('hashchange', revealHashTarget);
	document.addEventListener('click', (event) => {
		if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
		if (!(event.target instanceof Element)) return;
		const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
		if (link && link.hash && link.hash === window.location.hash) revealHashTarget();
	});
	document.addEventListener('focusin', (event) => {
		if (!(event.target instanceof Element)) return;
		const section = event.target.closest<HTMLElement>('main > section, body > footer');
		if (section) revealImmediately(section);
	});

	const disableAnimations = () => {
		animationsEnabled = false;
		observer.disconnect();
		for (const section of sections) {
			cancelAnimation(section);
			const content = section.firstElementChild;
			if (content instanceof HTMLElement) delete content.dataset.scrollReveal;
		}
	};
	motionPreference.addEventListener('change', (event) => {
		if (event.matches) disableAnimations();
	});
	window.addEventListener('beforeprint', disableAnimations);
}
