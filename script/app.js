// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	//Get hours from milliseconds
	const date = new Date(timestamp * 1000);
	// Hours part from the timestamp
	const hours = '0' + date.getHours();
	// Minutes part from the timestamp
	const minutes = '0' + date.getMinutes();
	// Seconds part from the timestamp (gebruiken we nu niet)
	// const seconds = '0' + date.getSeconds();

	// Will display time in 10:30(:23) format
	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie
const updateSun = (sun, left, bottom, today) => {
	// Do your thing 💪🏼
	sun.style.left = `${left}%`;
	sun.style.bottom = `${bottom}%`;
	sun.setAttribute(
		'data-time',
		('0' + today.getHours()).slice(-2) +
			':' +
			('0' + today.getMinutes()).slice(-2)
	);
};

let itBeNight = () => {
	document.querySelector('html').classList.add('is-night');
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	const sun = document.querySelector('.js-sun'),
		minutesLeft = document.querySelector('.js-time-left');

	let today = new Date();
	const sunriseDate = new Date(sunrise * 1000);

	// Bepaal het aantal minuten dat de zon al op is.
	let minutesSunUp =
		today.getHours() * 60 +
		today.getMinutes() -
		(sunriseDate.getHours() * 60 + sunriseDate.getMinutes());

	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	let percentage = (100 / totalMinutes) * minutesSunUp,
		sunLeft = percentage,
		sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;

	updateSun(sun, sunLeft, sunBottom, today);

	// Vergeet niet om het resterende aantal minuten in te vullen.
	minutesLeft.innerHTML = totalMinutes - minutesSunUp;

	// We voegen ook de 'is-loaded' class toe aan de HTML-tag.
	document.querySelector('html').classList.add('is-loaded');

	// Nu maken we een functie die de zon elke minuut zal updaten
	let t = setInterval(() => {
		today = new Date();

		// Bekijk of de zon niet nog onder of reeds onder is
		if (minutesSunUp < 0 || minutesSunUp > totalMinutes) {
			// Sun is down or set
			clearInterval(t);
			itBeNight();
		} else {
			// Anders kunnen we huidige waarden evalueren en ...
			let leftPercentage = (100 / totalMinutes) * minutesSunUp;
			let bottomPercentage =
				leftPercentage < 50
					? leftPercentage * 2
					: (100 - leftPercentage) * 2;
			// de zon updaten via de updateSun functie.
			updateSun(sun, leftPercentage, bottomPercentage, today);
			// PS.: vergeet weer niet om het resterend aantal minuten te updaten en ...
			minutesLeft.innerHTML = totalMinutes - minutesSunUp;
		}
		// verhoog het aantal verstreken minuten.
		minutesSunUp++;
	}, 60000); // 60000
	// 1s = 1000ms

	// Bekijk of de zon niet nog onder of reeds onder is

	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
	const sunRise = document.querySelector('.js-sunrise'),
		sunSet = document.querySelector('.js-sunset'),
		location = document.querySelector('.js-location');

	// We gaan eerst een paar onderdelen opvullen
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	sunRise.innerHTML = _parseMillisecondsIntoReadableTime(
		queryResponse.city.sunrise
	);
	sunSet.innerHTML = _parseMillisecondsIntoReadableTime(
		queryResponse.city.sunset
	);
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	location.innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;

	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	const timeDifference = new Date(
		queryResponse.city.sunset * 1000 - queryResponse.city.sunrise * 1000
	);

	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	placeSunAndStartMoving(
		timeDifference.getHours() * 60 + timeDifference.getMinutes(),
		queryResponse.city.sunrise
	);
};

// 2 Aan de hand van een longitude en latitude gaan we de openwheater map API ophalen.
let getAPI = async (lat, lon) => {
	// Eerst bouwen we onze url op

	/*** ⚠️☠️ API-key van Martijn Loth, misbruik zal bestraft worden ☠️️️️️⚠️ ***/
	const ENDPOINT = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=3404f248377631cb3de583c805fe5efe&units=metric&lang=nl&cnt=1`;

	// Met de fetch API proberen we de data op te halen.
	const request = await fetch(`${ENDPOINT}`);
	const data = await request.json();
	console.log(data);

	showResult(data);
};

document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	getAPI(50.82806, 3.265);
});
