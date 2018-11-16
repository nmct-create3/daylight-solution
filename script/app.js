// _ = helper functions
// Bereken hoeveel tijd er tussen deze twee periodes is.
// Deze functie moeten ze zelf doen, vertel mss wel dat ze als output minuten moeten returnen.
let _calculateTimeDistance = (startTime, endTime) => {
	// De twee tijden omzetten naar een JS date object (daar kan je veel meer mee doen.)
	let from = new Date("0001-01-01 " + startTime),
	to = new Date("0001-01-01 " + endTime);

	// Uit de beide tijden de uren halen en de minuten.
	let difference = {
		h: ( to.getHours() - from.getHours() ),
		m: ( to.getMinutes() - from.getMinutes() )
	}

	// Uit het verschil de uren omzetten naar minuten en de minuten er bij tellen
	return ( difference.h * 60 ) + difference.m;
}

// Deze functie kan een am/pm tijd omzetten naar een 24u tijdsnotatie, deze krijg je dus al. Alsjeblieft, veel plezier ermee.
let _convertTime = (t) => {
	/* CONVERT 12HR TO 24HR */
	// Get your time (using a hard-coded year for parsing purposes)
	let time = new Date("0001-01-01 " + t);
	// Output your formatted version (using your DateTime)
	let formatted = ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2);
	return formatted;
}

// 5 TODO: maak updateSun functie
// Geef het DOM element van de zon mee, de huidige tijd, een left waarden en een bottom waarde
let updateSun = ( sunElement, currentTime, leftValue, bottomValue = 0 ) => {
	// Zet de afstand tot links
	sunElement.style.left = `${ leftValue }%`;

	// Zet de afstand tot de onderkant
	sunElement.style.bottom = `${ bottomValue }%`;

	// Geef de zon de correcte huidige tijd mee als attribuut
	sunElement.setAttribute('data-time', currentTime);
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = ( totalMinutes, sunrise ) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en 
	let sun = document.querySelector( '.js-sun' ),
		// van onze aantal minuten resterend deze dag.
		minutesLeftHolder = document.querySelector( '.js-time-left' ),
		// START Bepaal het aantal minuten dat de zon al op is.
		sunriseDate = new Date("0001-01-01 " + sunrise),
		sunriseMinutes = ( sunriseDate.getHours() * 60 ) + sunriseDate.getMinutes(),
		today = new Date(),
		time = ( today.getHours() * 60 ) + today.getMinutes(),
		elapsedTime = time - sunriseMinutes;
		// END

	// Do this the first time.
	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	let leftPercentage = (100 / totalMinutes) * elapsedTime;
	let bottomPercentage = (leftPercentage < 50) ? leftPercentage * 2 : ( 100 - leftPercentage ) * 2;
	updateSun(sun, today.getHours() + ':' + ('0' + today.getMinutes()).slice(-2), leftPercentage, bottomPercentage);
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	document.querySelector( 'body' ).classList.add( 'is-loaded' );
	// Vergeet niet om het resterende aantal minuten in te vullen.
	minutesLeftHolder.innerHTML = totalMinutes - elapsedTime;

	// Bekijk of de zon niet nog onder of reeds onder is
	if (elapsedTime < 0 || elapsedTime > totalMinutes) {
		itBeNight(); // check
	}

	// Nu maken we een functie die de zon elke minuut zal updaten
	let t = setInterval(() => {
		today = new Date();
		// Bekijk of de zon niet nog onder of reeds onder is
		if (elapsedTime < 0 || elapsedTime > totalMinutes) {
			// Sun is down or set
			clearInterval( t );
			itBeNight();
		} else {
			// Anders kunnen we huidige waarden evalueren en ...
			let leftPercentage = (100 / totalMinutes) * elapsedTime;
			let bottomPercentage = (leftPercentage < 50) ? leftPercentage * 2 : (100 - leftPercentage) * 2;
			// de zon updaten via de updateSun functie.
			updateSun(sun, today.getHours() + ':' + ('0' + today.getMinutes()).slice(-2), leftPercentage, bottomPercentage);
			// PS.: vergeet weer niet om het resterend aantal minuten te updaten en ... 
			minutesLeftHolder.innerHTML = totalMinutes - elapsedTime;
		}
		// verhoog het aantal verstreken minuten.
		elapsedTime++;
	}, 60000 );
}

// 3 Met de data van de API kunnen we de app opvullen
let showResult = ( queryResponse ) => {
	// We gaan eerst een paar onderdelen opvullen
	let location = document.querySelector( '.js-location' ),
		sunrise = document.querySelector( '.js-sunrise' ),
		sunset = document.querySelector( '.js-sunset' );

	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	location.innerHTML = `${queryResponse.location.city}, ${queryResponse.location.country}`;
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	sunrise.innerHTML = _convertTime( queryResponse.astronomy.sunrise );
	sunset.innerHTML = _convertTime( queryResponse.astronomy.sunset );

	// Hier gaan we een functie oproepen die de zon een bepaalde postie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	placeSunAndStartMoving(_calculateTimeDistance(queryResponse.astronomy.sunrise, queryResponse.astronomy.sunset), queryResponse.astronomy.sunrise );
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = ( lat, lon ) => {
	// Eerst bouwen we onze url op
	const ENDPOINT = `https://query.yahooapis.com/v1/public/yql?q=`;
	// en doen we een query met de Yahoo query language
	let query = `SELECT astronomy, location FROM weather.forecast WHERE woeid in (SELECT woeid FROM geo.places WHERE text="(${ lat }, ${ lon })")`;

	// Met de fetch API proberen we de data op te halen.
	fetch( `${ ENDPOINT }${ query }&format=json` )
		.then(function (response) {
			return response.json();
		})
		.then(function( jsonResponse ) {
			// Als dat gelukt is, gaan we naar onze showResult functie.
			showResult(jsonResponse.query.results.channel );
		})
		.catch(function( err ) {
			console.error( 'An error occured: ', err );
		});
}

let itBeNight = () => {
	document.querySelector( 'html' ).classList.add( 'is-night' );
}

document.addEventListener( 'DOMContentLoaded', function () {
	// We will query the API with longitude and latitude.
	getAPI( 50.82806, 3.265 );
});
