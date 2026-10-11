export const site = {
	name: 'Cortelafolk',
	edition: '4.ª edición',
	year: 2027,
	dateLabel: '23, 24 y 25 de abril de 2027',
	location: 'Cortelazor, Huelva',
	description: 'Cortelafolk 2027: tres días de música, cultura y naturaleza en Cortelazor, Huelva. 23, 24 y 25 de abril. Entrada gratuita para todo el mundo.',
	mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=Cortelazor%2C+Huelva%2C+Espa%C3%B1a',
};

export const navigationItems = [
	{ label: 'El festival', href: '#festival' },
	{ label: 'Artistas', href: '#artists' },
	{ label: 'Programación', href: '#schedule' },
	{ label: 'Cómo llegar', href: '#location' },
];

export const festivalDays = [
	{ id: 'friday', label: 'Viernes', date: '23', fullDate: '2027-04-23', subtitle: 'El primer encuentro' },
	{ id: 'saturday', label: 'Sábado', date: '24', fullDate: '2027-04-24', subtitle: 'Un día para vivirlo todo' },
	{ id: 'sunday', label: 'Domingo', date: '25', fullDate: '2027-04-25', subtitle: 'Nos despedimos bailando' },
] as const;

export const practicalQuestions = [
	{ question: '¿Necesito una entrada o reservar plaza?', answer: 'No. Cortelafolk es un festival de acceso libre y gratuito para todo el mundo. No tienes que comprar una entrada ni registrarte: solo venir a Cortelazor y disfrutar.' },
	{ question: '¿Puedo venir con niños?', answer: '¡Por supuesto! Cortelafolk es un encuentro para todas las edades. Ven en familia y comparte la música y el ambiente del pueblo. Los menores deben estar acompañados por una persona adulta.' },
	{ question: '¿Dónde puedo alojarme?', answer: 'Puedes consultar la oferta de alojamientos rurales de Cortelazor y de los pueblos de la Sierra de Aracena. Organiza tu estancia con antelación; el festival no incluye alojamiento ni dispone de una zona de acampada anunciada.' },
	{ question: '¿Qué me recomiendas llevar?', answer: 'Calzado cómodo, una botella de agua reutilizable y una chaqueta para cuando caiga el sol. Estamos en la sierra: consulta la previsión del tiempo antes de venir y cuida el entorno durante tu visita.' },
	{ question: '¿Dónde consultaré la accesibilidad y los servicios?', answer: 'Publicaremos aquí los detalles de accesibilidad, los puntos de información y los servicios disponibles cuando se confirme la distribución del festival. Ten en cuenta que las calles del pueblo pueden tener pendientes y pavimento irregular.' },
];
