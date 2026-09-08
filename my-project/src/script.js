const unitsDropdownBtn = document.getElementById("unitsDropdownBtn");
const unitsDropdown = document.getElementById("units-dropdown");


const tempOpt = document.querySelectorAll('[data-group="temp"]');
const windOpt = document.querySelectorAll('[data-group="wind"]');
const precipOpt = document.querySelectorAll('[data-group="precipitation"]');

const searchBar = document.getElementById("search-bar");
const searchDropdown = document.getElementById("search-dropdown")
let searchTimeout;

const prefTempUnit = localStorage.getItem('temp') || "celsius";
const prefWindUnit = localStorage.getItem('wind') || "km/h";
const prefPrecipUnit = localStorage.getItem('precipitation') || "millimeters";
const currentInfo = {};

//updated elements
const currLoc = document.getElementById("curr-loc");
const todaysDate = document.getElementById("todays-date");
const currTemp = document.getElementById("curr-temp");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const precipitation = document.getElementById("precipitation");

const unitAppend = {
    celcius: "",
    farenheit: "&temperature_unit=fahrenheit",
    "km/h": "",
    mph: "&wind_speed_unit=mph",
    millimeters: ["","mm"],
    inches: ["&precipitation_unit=inch","in"],
};


unitsDropdownBtn.addEventListener("click", ()=> {
    unitsDropdown.classList.toggle("opacity-0");
    unitsDropdown.classList.toggle("scale-95");
    unitsDropdown.classList.toggle("invisible");

    unitsDropdown.classList.toggle("opacity-100");
    unitsDropdown.classList.toggle("scale-100");
    unitsDropdown.classList.toggle("visible");
});

document.addEventListener("DOMContentLoaded", ()=>{
    selectPrefUnit(prefTempUnit);
    selectPrefUnit(prefWindUnit);
    selectPrefUnit(prefPrecipUnit);
});

const toggleUnit = (unitGroup) => {
    unitGroup.forEach((btn) => {
        btn.addEventListener("click", () => {
            const checkImg = btn.getElementsByTagName("img")[0];
            btn.classList.add("selected");
            checkImg.classList.remove("hidden");

            [...unitGroup]
                .filter(otherBtn => otherBtn !== btn)
                .forEach(otherBtn => {
                    otherBtn.classList.remove("selected");
                    otherBtn.getElementsByTagName("img")[0].classList.add("hidden");
                });

            //Save using the data-group name (e.g., 'temp') instead of the ID
            localStorage.setItem(btn.dataset.group, btn.value);
            updatePageContent(currentInfo);
        });
    });
};

const selectPrefUnit = (unitValue) => {
    const prefUnitBtn = document.querySelector(`[value="${unitValue}"]`);
    
    if (prefUnitBtn) {
        prefUnitBtn.classList.add("selected");
        prefUnitBtn.getElementsByTagName("img")[0]?.classList.remove("hidden");
    }
};

const clearDropdown = ()=>{
    searchDropdown.innerHTML = ""
    searchDropdown.classList.add("hidden");
}

const renderDropdownResult = (result) => {
    if (result && result.length > 0) {
        const htmlString = result.map((location) => {
            return `<li role="option" data-group="search-option" tabindex="-1" data-lat="${location.latitude}" data-lon="${location.longitude}" class="text-md text-neutral-200 font-normal w-full p-1.5 hover:bg-neutral-700 hover:rounded-lg hover:shadow-lg cursor-pointer transition-all ease-out duration-50">${location.name}, ${location.country}</li>`;
        }).join("");

        searchDropdown.innerHTML = htmlString;

        document.querySelectorAll('[data-group="search-option"]').forEach((option)=>{
            option.addEventListener("click", () => {
                currentInfo.lat = option.dataset.lat;
                currentInfo.lon = option.dataset.lon;
                currentInfo.place = option.innerText;
                updatePageContent(currentInfo);
                clearDropdown();
                searchBar.value = "";
            })
        })
        searchDropdown.classList.remove("hidden");
    } else {
        clearDropdown();
    }
}
const updatePageContent = async ({lat, lon, place}) => {
    try{
        const result = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,weather_code&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation,relative_humidity_2m,weather_code&timezone=auto${unitAppend[localStorage.getItem('temp') || "celsius"]}${unitAppend[localStorage.getItem('wind') || "km/h"]}${unitAppend[localStorage.getItem('precipitation') || "millimeters"][0]}`);
        const data = await result.json();

        //City card update
        currLoc.innerText = place;
        const date = new Date(data.current?.time);
        const option ={
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        todaysDate.innerText  = date.toLocaleDateString("en-GB", option);
        currTemp.innerText = `${Math.round(data.current?.temperature_2m)}°`;

        
        feelsLike.innerText = `${Math.round(data.current?.apparent_temperature)}°`;
        humidity.innerText = `${data.current?.relative_humidity_2m}%`;
        wind.innerText = `${Math.round(data.current?.wind_speed_10m)} ${localStorage.getItem('wind') || "km/h"}`;
        precipitation.innerText = `${Math.round(data.current?.precipitation)} ${unitAppend[localStorage.getItem('precipitation') || "millimeters"][1]}`;
    
        
        console.log(data);
    }
    catch(error){
        console.error(`Error: ${error}`)
    }
}

searchBar.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    
    const query = e.target.value.trim();

    if (!query) {
        clearDropdown();
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
            const data = await response.json();
            renderDropdownResult(data.results);
        } catch(error) {
            console.error(`Error: ${error}`);
        }
    }, 300);
});

toggleUnit(tempOpt);
toggleUnit(windOpt);
toggleUnit(precipOpt);