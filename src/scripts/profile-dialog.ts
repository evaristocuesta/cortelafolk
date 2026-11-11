// One modal per section, filled from the selected card's data. Shared by the
// artists and the activities dialogs so both sections behave identically.
export function bindProfileDialog(dialogSelector: string, triggerSelector: string): void {
	const dialog = document.querySelector<HTMLDialogElement>(dialogSelector);
	if (!dialog || typeof dialog.showModal !== 'function') return;
	const image = dialog.querySelector<HTMLImageElement>('[data-dialog-image]');
	const day = dialog.querySelector<HTMLElement>('[data-dialog-day]');
	const name = dialog.querySelector<HTMLElement>('[data-dialog-name]');
	const genre = dialog.querySelector<HTMLElement>('[data-dialog-genre]');
	const text = dialog.querySelector<HTMLElement>('[data-dialog-text]');
	dialog.querySelector<HTMLButtonElement>('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
	dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
	document.querySelectorAll<HTMLButtonElement>(triggerSelector).forEach((trigger) => {
		trigger.addEventListener('click', () => {
			const { image: src, imageAlt, name: title, genre: category, description, day: label, tone } = trigger.dataset;
			if (image && src && imageAlt) { image.src = src; image.alt = imageAlt; }
			if (day && label) day.textContent = label;
			if (name && title) name.textContent = title;
			if (genre && category) genre.textContent = category;
			if (text && description) text.textContent = description;
			for (const value of ['orange', 'green', 'yellow']) dialog.classList.toggle(`tone-${value}`, value === tone);
			dialog.showModal();
		});
	});
}
