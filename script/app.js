let sunrise
let sunset

let sunElement
let sunriseElement
let sunsetElement
let timeLeftElement
let locationElement

let intervalId
let timeZone

const showLocation = (city, country) => {
  locationElement.innerHTML = `${city}, ${country}`
}

const showSunRiseAndSunSet = () => {
  sunriseElement.innerHTML = sunrise.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  sunsetElement.innerHTML = sunset.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const showTimeLeft = () => {
  const now = new Date(new Date().setHours(new Date().getHours() - timeZone))
  const timeLeft = new Date(sunset.getTime() - now.getTime())

  timeLeftElement.innerHTML = `${timeLeft.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

const placeSun = () => {
  const percentage = calculatePercentage()
  sunElement.style.left = `${percentage}%`
  sunElement.style.bottom = `${
    percentage < 50 ? percentage * 2 : (100 - percentage) * 2
  }%`
  sunElement.dataset.time = `${new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

const calculatePercentage = () => {
  const now = new Date().setTime(new Date().getTime())
  const timeInDay = new Date(sunset - sunrise)
  const timePassed = new Date(now - sunrise)

  const percentage = (timePassed.getTime() / timeInDay.getTime()) * 100
  return percentage
}

const placeSunAndStartMoving = () => {
  placeSun()

  intervalId = setInterval(() => {
    placeSun()
    showTimeLeft()

    if (calculatePercentage() > 100) {
      document.querySelector('html').classList.add('is-night')
      clearInterval(intervalId)
    }
  }, 60 * 1000)
}

const showResult = (apiData) => {
  document.querySelector('html').classList.add('is-loaded')

  showSunRiseAndSunSet()
  showLocation(apiData.city.name, apiData.city.country)
  showTimeLeft()

  placeSunAndStartMoving()
}

const getAPI = async (lat, lon) => {
  /** API-key staat in een file: api.js met als value: const API_KEY = 'de_key_zelf_dus' **/
  const ENDPOINT = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=nl&cnt=1`

  const data = await fetch(`${ENDPOINT}`).then((response) => response.json())

  timeZone = data.city.timezone
  sunrise = new Date(data.city.sunrise * 1000 - timeZone)
  sunset = new Date(data.city.sunset * 1000 - timeZone)

  showResult(data)
}

document.addEventListener('DOMContentLoaded', function () {
  sunElement = document.querySelector('.js-sun')
  sunriseElement = document.querySelector('.js-sunrise')
  sunsetElement = document.querySelector('.js-sunset')
  timeLeftElement = document.querySelector('.js-time-left')
  locationElement = document.querySelector('.js-location')

  getAPI(50.82806, 3.265)
})
