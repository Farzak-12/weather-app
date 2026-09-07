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

            // 2. Save using the data-group name (e.g., 'temp') instead of the ID
            localStorage.setItem(btn.dataset.group, btn.value);
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
            return `<li role="option" tabindex="-1" data-lat="${location.latitude}" data-lon="${location.longitude}" class="text-md text-neutral-200 font-normal w-full p-1.5 hover:bg-neutral-700 hover:rounded-lg hover:shadow-lg cursor-pointer transition-all ease-out duration-50">${location.name}, ${location.country}</li>`;
        }).join("");

        searchDropdown.innerHTML = htmlString;
        searchDropdown.classList.remove("hidden");
    } else {
        clearDropdown();
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