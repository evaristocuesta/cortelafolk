type ConsentChoice = {
	statistics: boolean;
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
	return { statistics: value.split(',').includes('Statistical') };
}

function saveConsentCookie(choice: ConsentChoice): void {
	const categories = choice.statistics ? 'Necessary,Statistical' : 'Necessary';
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

	const cookieConsent = choice.statistics ? 'Necessary,Statistical' : 'Necessary';
	if (announceToGtm) {
		window.dataLayer.push({ event: 'cookie_consent_update', cookieConsent });
	}
	if (!choice.statistics) removeAnalyticsCookies();
}

function setBannerVisibility(banner: HTMLElement, reopenButton: HTMLButtonElement, open: boolean): void {
	banner.hidden = !open;
	reopenButton.hidden = open;
}

function startCookieConsent(): void {
	const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
	const reopenButton = document.querySelector<HTMLButtonElement>('[data-consent-reopen]');
	const statisticsCheckbox = document.querySelector<HTMLInputElement>('[data-statistics-consent]');
	if (!banner || !reopenButton || !statisticsCheckbox) return;

	const savedChoice = readConsentCookie();
	statisticsCheckbox.checked = savedChoice?.statistics ?? false;
	if (savedChoice) {
		applyConsent(savedChoice);
		setBannerVisibility(banner, reopenButton, false);
	} else {
		setBannerVisibility(banner, reopenButton, true);
	}

	reopenButton.addEventListener('click', () => {
		const currentChoice = readConsentCookie();
		statisticsCheckbox.checked = currentChoice?.statistics ?? false;
		setBannerVisibility(banner, reopenButton, true);
		statisticsCheckbox.focus();
	});

	banner.querySelectorAll<HTMLButtonElement>('[data-consent-action]').forEach((button) => {
		button.addEventListener('click', () => {
			const action = button.dataset.consentAction;
			const choice: ConsentChoice = {
				statistics: action === 'accept' || (action === 'save' && statisticsCheckbox.checked),
			};
			const previousChoice = readConsentCookie();
			saveConsentCookie(choice);
			if (!previousChoice || previousChoice.statistics !== choice.statistics) applyConsent(choice);
			setBannerVisibility(banner, reopenButton, false);
			reopenButton.focus();
		});
	});

	document.querySelectorAll<HTMLButtonElement>('[data-load-map]').forEach((button) => {
		button.addEventListener('click', () => {
			const container = button.closest<HTMLElement>('[data-map-container]');
			const mapUrl = container?.dataset.mapSrc;
			if (!container || !mapUrl) return;
			const iframe = document.createElement('iframe');
			iframe.className = 'location-map-frame';
			iframe.src = mapUrl;
			iframe.title = 'Mapa interactivo de Cortelazor, Huelva';
			iframe.width = '720';
			iframe.height = '740';
			iframe.loading = 'lazy';
			iframe.referrerPolicy = 'no-referrer-when-downgrade';
			iframe.allowFullscreen = true;
			container.querySelector('[data-map-placeholder]')?.replaceWith(iframe);
		});
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', startCookieConsent, { once: true });
} else {
	startCookieConsent();
}
