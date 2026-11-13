export const site = {
	name: 'Cortelafolk',
	edition: '4.ª edición',
	year: 2027,
	dateLabel: '23, 24 y 25 de abril de 2027',
	location: 'Cortelazor, Huelva',
	description: 'Cortelafolk 2027: tres días de música, cultura y naturaleza en Cortelazor, Huelva. 23, 24 y 25 de abril. Entrada libre para todo el mundo.',
	mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=Cortelazor%2C+Huelva%2C+Espa%C3%B1a',
};

export const navigationItems = [
	{ label: 'El festival', href: '#festival' },
	{ label: 'Artistas', href: '#artistas' },
	{ label: 'Actividades', href: '#actividades' },
	{ label: 'Programación', href: '#programacion' },
	{ label: 'Cómo llegar', href: '#como-llegar' },
];

export const socialLinks = [
	{ name: 'Instagram', href: 'https://www.instagram.com/cortelafolk', icon: 'instagram' },
	{ name: 'Facebook', href: 'https://www.facebook.com/cortelafolk', icon: 'facebook' },
] as const;

export const festivalDays = [
	{ id: 'friday', label: 'Viernes', date: '23', fullDate: '2027-04-23', subtitle: 'El primer encuentro' },
	{ id: 'saturday', label: 'Sábado', date: '24', fullDate: '2027-04-24', subtitle: 'Un día para vivirlo todo' },
	{ id: 'sunday', label: 'Domingo', date: '25', fullDate: '2027-04-25', subtitle: 'Nos despedimos bailando' },
] as const;

// The day union comes from the records above: it can never drift from them.
export type FestivalDay = (typeof festivalDays)[number]['id'];

// Placeholder entries until the real organisations are confirmed: replace the
// names, hrefs and logos together with the genuine ones. Every entry carries
// its own logo file under public/images/partners/.
export const organizers = [
	{ name: 'La mano verde', href: 'https://lamanoverde.info', logo: '/images/partners/la-mano-verde.svg' },
	{ name: 'Organizador 2', href: 'https://organizador2.com', logo: '/images/partners/organizador-2.svg' },
] as const;

export const collaborators = [
	{ name: 'Colaborador 1', href: 'https://colaborador1.com', logo: '/images/partners/colaborador-1.svg' },
	{ name: 'Colaborador 2', href: 'https://colaborador2.com', logo: '/images/partners/colaborador-2.svg' },
	{ name: 'Colaborador 3', href: 'https://colaborador3.com', logo: '/images/partners/colaborador-3.svg' },
	{ name: 'Colaborador 4', href: 'https://colaborador4.com', logo: '/images/partners/colaborador-4.svg' },
	{ name: 'Colaborador 5', href: 'https://colaborador5.com', logo: '/images/partners/colaborador-5.svg' },
	{ name: 'Colaborador 6', href: 'https://colaborador6.com', logo: '/images/partners/colaborador-6.svg' },
	{ name: 'Colaborador 7', href: 'https://colaborador7.com', logo: '/images/partners/colaborador-7.svg' },
	{ name: 'Colaborador 8', href: 'https://colaborador8.com', logo: '/images/partners/colaborador-8.svg' },
	{ name: 'Colaborador 9', href: 'https://colaborador9.com', logo: '/images/partners/colaborador-9.svg' },
	{ name: 'Colaborador 10', href: 'https://colaborador10.com', logo: '/images/partners/colaborador-10.svg' },
	{ name: 'Colaborador 11', href: 'https://colaborador11.com', logo: '/images/partners/colaborador-11.svg' },
	{ name: 'Colaborador 12', href: 'https://colaborador12.com', logo: '/images/partners/colaborador-12.svg' },
	{ name: 'Colaborador 13', href: 'https://colaborador13.com', logo: '/images/partners/colaborador-13.svg' },
	{ name: 'Colaborador 14', href: 'https://colaborador14.com', logo: '/images/partners/colaborador-14.svg' },
	{ name: 'Colaborador 15', href: 'https://colaborador15.com', logo: '/images/partners/colaborador-15.svg' },
	{ name: 'Colaborador 16', href: 'https://colaborador16.com', logo: '/images/partners/colaborador-16.svg' },
	{ name: 'Colaborador 17', href: 'https://colaborador17.com', logo: '/images/partners/colaborador-17.svg' },
	{ name: 'Colaborador 18', href: 'https://colaborador18.com', logo: '/images/partners/colaborador-18.svg' },
	{ name: 'Colaborador 19', href: 'https://colaborador19.com', logo: '/images/partners/colaborador-19.svg' },
	{ name: 'Colaborador 20', href: 'https://colaborador20.com', logo: '/images/partners/colaborador-20.svg' },
];

export const practicalQuestions = [
	{ question: '¿Necesito una entrada o reservar plaza?', answer: 'No. Cortelafolk es un festival de acceso libre y gratuito para todo el mundo. No tienes que comprar una entrada ni registrarte: solo venir a Cortelazor y disfrutar.' },
	{ question: '¿Puedo venir con niños?', answer: '¡Por supuesto! Cortelafolk es un encuentro para todas las edades. Ven en familia y comparte la música, actividades, gastronomía y el ambiente del pueblo.' },
	{ question: '¿Dónde puedo alojarme?', answer: 'Puedes consultar la oferta de <a href="https://www.vivecortelazor.es/es/donde-dormir" target="_blank" rel="noopener">alojamientos rurales de Cortelazor</a>. Organiza tu estancia con antelación; el festival no incluye alojamiento ni dispone de una zona de acampada anunciada.' },
	{ question: '¿Dónde puedo comer?', answer: 'Puedes consultar la habitual <a href="https://www.vivecortelazor.es/es/donde-comer" target="_blank" rel="noopener">oferta gastronómica de Cortelazor</a> y además también podrás comer en los puestos del festival.' },
	{ question: '¿Qué me recomiendas llevar?', answer: 'Calzado cómodo, ropa adecuada y una chaqueta para cuando caiga el sol. Estamos en la sierra: consulta la previsión del tiempo antes de venir y cuida el entorno durante tu visita.' },
	{ question: '¿Cómo puedo conocer Cortelazor?', answer: 'Puedes empezar por la <a href="https://www.vivecortelazor.es/es/historia" target="_blank" rel="noopener">historia de Cortelazor</a> y la guía de <a href="https://www.vivecortelazor.es/es/que-hacer" target="_blank" rel="noopener">qué hacer en Cortelazor</a>. Después, recorre sus calles con calma: el festival es una forma más de descubrir el pueblo.' },
];
