const unitsDropdownBtn = document.getElementById("unitsDropdownBtn");
const unitsDropdown = document.getElementById("units-dropdown");


const tempOpt = document.querySelectorAll('[data-group="temp"]');
const windOpt = document.querySelectorAll('[data-group="wind"]');
const precipOpt = document.querySelectorAll('[data-group="precipitation"]');

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

toggleUnit(tempOpt);
toggleUnit(windOpt);
toggleUnit(precipOpt);