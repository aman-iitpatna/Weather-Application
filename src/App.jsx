import {  useEffect, useState } from "react";

import './App.css'

function App() {
  const apikey = import.meta.env.VITE_API_KEY;

  const [cityName, setcityname] = useState("Delhi");
  const [code, setcode] = useState("800005");
  const [weather, setWeather] = useState({
    temp: 0,
    wspeed: 0,
    humidity: 0,
    pressure: 0,
    visibility: 0,
  });
  const [logo, setlogo] = useState();

  const updatelogo = (data) => {
    setlogo(data.weather[0].icon);
  }

  function getLocation() {
    const location = navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const zip = await getZipCode(lat, lon);
      console.log(zip);
      
    } , () => {})
  }

  async function fetchWeatherData(code) {
    try {
      const data = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${code},IN&appid=${apikey}&units=metric`,
      );
      const jsondata = await data.json();
      setcityname(jsondata.name);
      updatelogo(jsondata);

      let count = 0;
      const step = 6;

      let tempinitial = weather.temp;
      let windinitial = weather.wspeed;
      let humidinitial = weather.humidity;
      let pressinitial = weather.pressure;
      let visiinitial = weather.visibility;
      const tempdiff = (jsondata.main.temp - tempinitial) / step;
      const winddiff = (jsondata.wind.speed - windinitial) / step;
      const humidiff = (jsondata.main.humidity - humidinitial) / step;
      const pressdiff = (jsondata.main.pressure - pressinitial) / step;
      const visidiff = (jsondata.visibility - visiinitial) / step;

      const interval = setInterval(() => {
        count = count + 1;
        if (count >= step) {
          setWeather({
            temp: jsondata.main.temp,
            wspeed: jsondata.wind.speed,
            humidity: jsondata.main.humidity,
            pressure: jsondata.main.pressure,
            visibility: jsondata.visibility,
          });
          clearInterval(interval);
        } else {
          tempinitial = Number((tempinitial + tempdiff).toFixed(2));
          windinitial = Number((windinitial + winddiff).toFixed(2));
          humidinitial = Number((humidinitial + humidiff).toFixed(2));
          pressinitial = Number((pressinitial + pressdiff).toFixed(2));
          visiinitial = Number((visiinitial + visidiff).toFixed(2));
          setWeather({
            temp: tempinitial,
            wspeed: windinitial,
            humidity: humidinitial,
            pressure: pressinitial,
            visibility: visiinitial,
          });
        }
      }, 100);
    } catch (error) {
      console.log(error);
    }
  }

  async function hourlyForecast(code) {
    try {
      const hourlydata = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?zip=${code},IN&appid=${apikey}&units=metric`,
      );

      const jsondataHourly = await hourlydata.json();

      document.getElementById("box5").innerHTML = "";
      for (let i = 0; i < 18; i++) {
        const card = document.createElement("div");
        card.id = "hourly-forecast";
        card.innerHTML = `
        <div id ="box51">
          <h1 id ="h-f-temp">
              ${Math.round(jsondataHourly.list[i].main.temp)}
          </h1>
          <span id="forcast-degree">0</span>
          <span id="forcast-celcious">C</span>
        </div>
        <img
            src="http://openweathermap.org/img/wn/${jsondataHourly.list[i].weather[0].icon}@2x.png"
            alt="logo"
            id="h-f-logo"
        >
        <h1 id="h-f-time">
            ${new Date(jsondataHourly.list[i].dt_txt).toLocaleTimeString("en-US", { hour: "numeric", hour12: true })}
        </h1>
        <h1 id="forcast-day">
            ${new Date(jsondataHourly.list[i].dt_txt).toLocaleDateString("en-US",{weekday: "short"})}
        </h1>
    `;
        document.getElementById("box5").appendChild(card);
      }
    } catch (error) {
      console.log("Hourly Forecast Data Failed to fetch", error);
    }
  }

  useEffect(() => {
    let codelength = code.toString().length;
    if (codelength == 6) {
      fetchWeatherData(code);
      hourlyForecast(code);
    }
  }, [code]);

  // Run geolocation once on mount (don't call during render)
  useEffect(() => {
    if (navigator && navigator.geolocation) {
      getLocation();
    }
  }, []);

  return (
    <>
      <div id="main">
        <div id="main2">
          <div id="box1">
            <h1 id="appName">Current Weather</h1>
          </div>

          <div id="box2">
            <div className="box2left">
              <input
                id="zipcode"
                type="text"
                placeholder="Zipcode"
                number="true"
                value={code}
                onChange={(e) => {
                  setcode(e.target.value);
                }}
              />
            </div>
            <div className="box2right">
              <h1 id="city">City: {cityName}</h1>
            </div>
          </div>

          <div className="container">
            <div id="box3">
              <div className="box3right">
                <img
                  id="weathericon"
                  src={`http://openweathermap.org/img/wn/${logo}@2x.png`}
                  alt=""
                />
              </div>
              <div className="box3left">
                <h1 id="temp">{weather.temp}</h1>
                <span className="degree">o</span>
                <span className="celcious">C</span>
              </div>
            </div>

            <div id="box4">
              <div className="box41">
                <h1 className="wind">WIND</h1>
                <h1 className="windspeed">{weather.wspeed} km/h</h1>
              </div>

              <div className="box41">
                <h1 className="wind">HUMIDITY</h1>
                <h1 className="windspeed">{weather.humidity} %</h1>
              </div>

              <div className="box41">
                <h1 className="wind">PRESSURE</h1>
                <h1 className="windspeed">{weather.pressure} hPa</h1>
              </div>

              <div className="box41">
                <h1 className="wind">VISIBILITY</h1>
                <h1 className="windspeed">{weather.visibility} m</h1>
              </div>
            </div>
          </div>
          <div id="box5">
            
          </div>
        </div>
      </div>
    </>
  )
}

export default App
