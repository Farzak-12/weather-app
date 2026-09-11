const unitsDropdownBtn = document.getElementById("unitsDropdownBtn");
const unitsDropdown = document.getElementById("units-dropdown");

const daysDropdownBtn = document.getElementById("daysDropdownBtn");
const daysDropdown = document.getElementById("days-dropdown");
const daysDropdownBtns = document.querySelectorAll('[data-group="days"]')

const tempOpt = document.querySelectorAll('[data-group="temp"]');
const windOpt = document.querySelectorAll('[data-group="wind"]');
const precipOpt = document.querySelectorAll('[data-group="precipitation"]');

const searchBar = document.getElementById("search-bar");
const searchDropdown = document.getElementById("search-dropdown");
const searchBtn = document.getElementById("search-btn");
let searchTimeout;

const prefTempUnit = localStorage.getItem('temp') || "celcius";
const prefWindUnit = localStorage.getItem('wind') || "km/h";
const prefPrecipUnit = localStorage.getItem('precipitation') || "millimeters";
const currentInfo = {};
let currentWeather = null;


//updated elements
const currLoc = document.getElementById("curr-loc");
const todaysDate = document.getElementById("todays-date");
const currTemp = document.getElementById("curr-temp");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const precipitation = document.getElementById("precipitation");
const dailyCards = document.querySelectorAll('[data-group="daily-cards"]');
const dailyDates = [];
const dailyMinTemp = [];
const dailyMaxTemp = [];
dailyCards.forEach((card) => {
    dailyDates.push(card.getElementsByTagName("span")[0]);
    dailyMaxTemp.push(card.getElementsByTagName("span")[2]);
    dailyMinTemp.push(card.getElementsByTagName("span")[3]);
})
const hourlySection = document.getElementById("hourly-section");
const hourlyDetails = document.querySelectorAll('[data-group="hourly-details"]');

const unitAppend = {
    celcius: "",
    farenheit: "&temperature_unit=fahrenheit",
    "km/h": "",
    mph: "&wind_speed_unit=mph",
    millimeters: ["","mm"],
    inches: ["&precipitation_unit=inch","in"],
};


document.addEventListener("DOMContentLoaded", async () => {
    selectPrefUnit(prefTempUnit);
    selectPrefUnit(prefWindUnit);
    selectPrefUnit(prefPrecipUnit);

    const loadDefaultLocation = () => {
        currentInfo.lat = "38.7322";
        currentInfo.lon = "35.4853";
        currentInfo.place = "Kayseri, Türkiye";
        updatePageContent(currentInfo);
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentInfo.lat = position.coords.latitude;
                currentInfo.lon = position.coords.longitude;
                currentInfo.place = "Current Location";
                updatePageContent(currentInfo);
            },
            (error) => {
                console.warn("Location denied. Loading default.", error.message);
                loadDefaultLocation(); 
            }
        );
    } else {
        console.warn("Geolocation unsupported. Loading default.");
        loadDefaultLocation(); 
    }
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


const renderDropdownResult = (result) => {
    if (result && result.length > 0) {
        const htmlString = result.map((location) => {
            return `<li role="option" data-group="search-option" tabindex="-1" data-lat="${location.latitude}" data-lon="${location.longitude}" class="text-md text-neutral-200 font-normal w-full p-1.5 hover:bg-neutral-700 hover:rounded-lg hover:shadow-lg cursor-pointer transition-all ease-out duration-50">${location.name}, ${location.country}</li>`;
        }).join("");

        searchDropdown.innerHTML = htmlString;

        document.querySelectorAll('[data-group="search-option"]').forEach((option)=>{
            option.addEventListener("mousedown", () => {
                currentInfo.lat = option.dataset.lat;
                currentInfo.lon = option.dataset.lon;
                currentInfo.place = option.innerText;
                updatePageContent(currentInfo);
                clearSearchDropdown();
                searchBar.value = "";
            })
        })
        searchDropdown.classList.remove("hidden");
    } else {
        clearSearchDropdown();
    }
}

const updatePageContent = async ({lat, lon, place}) => {
    try{
        const result = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,weather_code&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation,relative_humidity_2m,weather_code&timezone=auto${unitAppend[localStorage.getItem('temp') || "celcius"]}${unitAppend[localStorage.getItem('wind') || "km/h"]}${unitAppend[localStorage.getItem('precipitation') || "millimeters"][0]}`);
        const data = await result.json();
        currentWeather = data;

        //City card update
        updateCurrentWeather(place, data);
        loadDate(data.daily)
        updateHourlyWeather(data.hourly);
        
        console.log(data);
    }
    catch(error){
        console.error(`Error: ${error}`)
    }
}

function selectPrefUnit(unitValue) {
    const prefUnitBtn = document.querySelector(`[value="${unitValue}"]`);

    if (prefUnitBtn) {
        prefUnitBtn.classList.add("selected");
        prefUnitBtn.getElementsByTagName("img")[0]?.classList.remove("hidden");
    }
}

function clearSearchDropdown() {
    searchDropdown.innerHTML = "";
    searchDropdown.classList.add("hidden");
}

function loadDate(dailyData) {
    dailyDates.forEach((card, index) => {
        const date = new Date(dailyData?.time[index]);
        card.innerText = date.toLocaleDateString("en-GB", {weekday: "short"});
    });

    dailyMinTemp.forEach((card, index) => {
        card.innerText = `${Math.round(dailyData.temperature_2m_min[index])}°`;
    });

    dailyMaxTemp.forEach((card, index) => {
        card.innerText = `${Math.round(dailyData.temperature_2m_max[index])}°`;
    });
}

function updateCurrentWeather(place, data) {
    currLoc.innerText = place;
    const date = new Date(data.current?.time);
    const option = {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
    };
    todaysDate.innerText = date.toLocaleDateString("en-GB", option);
    currTemp.innerText = `${Math.round(data.current?.temperature_2m)}°`;


    feelsLike.innerText = `${Math.round(data.current?.apparent_temperature)}°`;
    humidity.innerText = `${data.current?.relative_humidity_2m}%`;
    wind.innerText = `${Math.round(data.current?.wind_speed_10m)} ${localStorage.getItem('wind') || "km/h"}`;
    precipitation.innerText = `${Math.round(data.current?.precipitation)} ${unitAppend[localStorage.getItem('precipitation') || "millimeters"][1]}`;
}

function updateHourlyWeather(hourlyData) {
    
    const currentDate = new Date(hourlyData?.time[0]).toLocaleDateString("en-GB",{weekday:"long"});
    daysDropdownBtn.getElementsByTagName("p")[0].innerText = currentDate;

    daysDropdownBtns.forEach((btn,index)=>{
        btn.innerText = new Date(hourlyData?.time[index*24]).toLocaleDateString("en-GB",{weekday:"long"})
    })

    loadHourly(currentDate);
}

function loadHourly(localeDate) {
    const startIndex = currentWeather.hourly?.time.map(time => new Date(time).toLocaleDateString("en-GB",{weekday:"long"})).indexOf(localeDate);
    
    hourlyDetails.forEach((hourCard,index)=>{
        hourCard.getElementsByTagName("span")[1].innerText = new Date(currentWeather.hourly?.time[index+startIndex]).toLocaleTimeString("en-US",{hour:'numeric',hour12:true});
        hourCard.getElementsByTagName("span")[2].innerText =  `${Math.round(currentWeather.hourly?.temperature_2m[index+startIndex])}°`;
    })
}
function toggleUnitsDropdown() {
    unitsDropdown.classList.toggle("opacity-0");
    unitsDropdown.classList.toggle("scale-95");
    unitsDropdown.classList.toggle("invisible");

    unitsDropdown.classList.toggle("opacity-100");
    unitsDropdown.classList.toggle("scale-100");
    unitsDropdown.classList.toggle("visible");
    if(unitsDropdown.classList.contains("visible")) unitsDropdown.setAttribute("aria-expanded", "true");
    else unitsDropdown.setAttribute("aria-expanded", "false");
}

function toggleDaysDropdown() {
    daysDropdown.classList.toggle("opacity-0");
    daysDropdown.classList.toggle("scale-95");
    daysDropdown.classList.toggle("invisible");

    daysDropdown.classList.toggle("opacity-100");
    daysDropdown.classList.toggle("scale-100");
    daysDropdown.classList.toggle("visible");
    if(daysDropdown.classList.contains("visible")) daysDropdown.setAttribute("aria-expanded", "true");
    else daysDropdown.setAttribute("aria-expanded", "false");
}

searchBar.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    
    const query = e.target.value.trim();

    if (!query) {
        clearSearchDropdown();
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

searchBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    const firstOption = document.querySelector('[data-group="search-option"]');
    
    
    if (!firstOption); 

    currentInfo.lat = firstOption.dataset.lat;
    currentInfo.lon = firstOption.dataset.lon;
    currentInfo.place = firstOption.innerText;
    console.log(currentInfo);
    updatePageContent(currentInfo);
    searchBar.value = "";
    clearSearchDropdown();
});

searchBar.addEventListener("focusout", (e)=>{
    const isClickingInDropdown = searchDropdown.contains(e.relatedTarget);
    const isClickingInSearchBtn = searchBtn.contains(e.relatedTarget);

    if(!isClickingInDropdown && !isClickingInSearchBtn){
        clearSearchDropdown();
    }
});

unitsDropdownBtn.addEventListener("mousedown", ()=> {
    toggleUnitsDropdown();
});

daysDropdownBtn.addEventListener("mousedown", ()=> {
    toggleDaysDropdown();
});

daysDropdownBtns.forEach((btn => {(
    btn.addEventListener("click", ()=>{
        loadHourly(btn.innerText);
        toggleDaysDropdown();

        [...daysDropdownBtns]
        .filter(day => day !== btn)
        .forEach(otherBtn => otherBtn.classList.remove("day-selected"));
        btn.classList.add("day-selected");

        daysDropdownBtn.getElementsByTagName("p")[0].innerText = btn.innerText;
    }))
}))
document.addEventListener("click",(e)=>{
    if(unitsDropdown.getAttribute("aria-expanded") === "true"){
        const isClickingInDropdown = unitsDropdown.contains(e.target) || unitsDropdownBtn.contains(e.target);
        if(!isClickingInDropdown){
            toggleUnitsDropdown();
        } 
    }
    if(daysDropdown.getAttribute("aria-expanded") === "true"){
        const isClickingInDropdown = daysDropdown.contains(e.target) || daysDropdownBtn.contains(e.target);
        if(!isClickingInDropdown){
            toggleDaysDropdown();
        } 
    }
})



toggleUnit(tempOpt);
toggleUnit(windOpt);
toggleUnit(precipOpt);


