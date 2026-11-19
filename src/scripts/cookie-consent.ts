type ConsentChoice = {
	statistics: boolean;
	externalContent: boolean;
};

type ConsentStatus = 'granted' | 'denied';

export {};

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (command: string, action: string, values: Record<string, ConsentStatus>) => void;
	}
}

const consentCookieName = 'cookieConsent';
const consentCookieLifetime = 60 * 60 * 24 * 365;
const analyticsCookies = ['_ga', '_ga_LR1Y2XBDS6'];

function readConsentCookie(): ConsentChoice | null {
	const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${consentCookieName}=`));
	if (!cookie) return null;
	const value = decodeURIComponent(cookie.slice(consentCookieName.length + 1));
	const categories = value.split(',');
	return {
		statistics: categories.includes('Statistical'),
		externalContent: categories.includes('ExternalContent'),
	};
}

function saveConsentCookie(choice: ConsentChoice): void {
	const categories = ['Necessary', ...(choice.statistics ? ['Statistical'] : []), ...(choice.externalContent ? ['ExternalContent'] : [])].join(',');
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${consentCookieName}=${encodeURIComponent(categories)}; Max-Age=${consentCookieLifetime}; Path=/; SameSite=Lax${secure}`;
}

function removeAnalyticsCookies(): void {
	for (const name of analyticsCookies) {
		const secure = window.location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
		document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.cortelafolk.es; SameSite=Lax${secure}`;
	}
}

function setMapVisibility(container: HTMLElement, allowed: boolean): void {
	const placeholder = container.querySelector<HTMLElement>('[data-map-placeholder]');
	const currentMap = container.querySelector<HTMLIFrameElement>('.location-map-frame');
	if (allowed && !currentMap && placeholder) {
		const mapUrl = container.dataset.mapSrc;
		if (!mapUrl) return;
		const iframe = document.createElement('iframe');
		iframe.className = 'location-map-frame';
		iframe.src = mapUrl;
		iframe.title = 'Mapa interactivo de Cortelazor, Huelva';
		iframe.width = '720';
		iframe.height = '740';
		iframe.loading = 'lazy';
		iframe.referrerPolicy = 'no-referrer-when-downgrade';
		iframe.allowFullscreen = true;
		container.insertBefore(iframe, placeholder);
		placeholder.hidden = true;
	} else if (!allowed && currentMap && placeholder) {
		currentMap.remove();
		placeholder.hidden = false;
	}
}

function setExternalContent(choice: ConsentChoice): void {
	document.querySelectorAll<HTMLElement>('[data-map-container]').forEach((container) => {
		setMapVisibility(container, choice.externalContent);
	});
}

function applyConsent(choice: ConsentChoice, announceToGtm = true): void {
	const status: ConsentStatus = choice.statistics ? 'granted' : 'denied';
	window.gtag('consent', 'update', {
		analytics_storage: status,
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		functionality_storage: 'denied',
		personalization_storage: 'denied',
		security_storage: 'granted',
	});

	const cookieConsent = ['Necessary', ...(choice.statistics ? ['Statistical'] : []), ...(choice.externalContent ? ['ExternalContent'] : [])].join(',');
	if (announceToGtm) {
		window.dataLayer.push({ event: 'cookie_consent_update', cookieConsent });
	}
	if (!choice.statistics) removeAnalyticsCookies();
	setExternalContent(choice);
}

function setBannerVisibility(banner: HTMLElement, reopenButton: HTMLButtonElement, open: boolean): void {
	banner.hidden = !open;
	reopenButton.hidden = open;
}

function startCookieConsent(): void {
	const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
	const reopenButton = document.querySelector<HTMLButtonElement>('[data-consent-reopen]');
	const statisticsCheckbox = document.querySelector<HTMLInputElement>('[data-statistics-consent]');
	const externalContentCheckbox = document.querySelector<HTMLInputElement>('[data-external-content-consent]');
	if (!banner || !reopenButton || !statisticsCheckbox || !externalContentCheckbox) return;

	const savedChoice = readConsentCookie();
	statisticsCheckbox.checked = savedChoice?.statistics ?? false;
	externalContentCheckbox.checked = savedChoice?.externalContent ?? false;
	if (savedChoice) {
		applyConsent(savedChoice);
		setBannerVisibility(banner, reopenButton, false);
	} else {
		setBannerVisibility(banner, reopenButton, true);
	}

	reopenButton.addEventListener('click', () => {
		const currentChoice = readConsentCookie();
		statisticsCheckbox.checked = currentChoice?.statistics ?? false;
		externalContentCheckbox.checked = currentChoice?.externalContent ?? false;
		setBannerVisibility(banner, reopenButton, true);
		statisticsCheckbox.focus();
	});

	banner.querySelectorAll<HTMLButtonElement>('[data-consent-action]').forEach((button) => {
		button.addEventListener('click', () => {
			const action = button.dataset.consentAction;
			const choice: ConsentChoice = {
				statistics: action === 'accept' || (action === 'save' && statisticsCheckbox.checked),
				externalContent: action === 'accept' || (action === 'save' && externalContentCheckbox.checked),
			};
			const previousChoice = readConsentCookie();
			saveConsentCookie(choice);
			const statisticsChanged = !previousChoice || previousChoice.statistics !== choice.statistics;
			const externalContentChanged = !previousChoice || previousChoice.externalContent !== choice.externalContent;
			if (statisticsChanged || externalContentChanged) applyConsent(choice, statisticsChanged);
			else setExternalContent(choice);
			setBannerVisibility(banner, reopenButton, false);
			reopenButton.focus();
		});
	});

	document.addEventListener('click', (event) => {
		if (!(event.target instanceof Element)) return;
		const button = event.target.closest<HTMLButtonElement>('[data-load-map]');
		const container = button?.closest<HTMLElement>('[data-map-container]');
		if (container) setMapVisibility(container, true);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', startCookieConsent, { once: true });
} else {
	startCookieConsent();
}
