const API_KEY = "6a387c5620d8533bd4cf6d8c";

// Elements
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amount = document.getElementById("amount");
const resultBox = document.getElementById("resultBox");
const errorBox = document.getElementById("errorBox");

const fromSearch = document.getElementById("fromSearch");
const toSearch = document.getElementById("toSearch");

const themeToggle = document.getElementById("themeToggle");
const swapBtn = document.getElementById("swapBtn");

const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");

let currencies = [];
let ratesCache = {}; 

//  Currency → Country map (for flags)
const currencyToCountryMap = {
  USD: "US", EUR: "EU", GBP: "GB", KES: "KE", JPY: "JP",
  INR: "IN", CNY: "CN", AUD: "AU", CAD: "CA", ZAR: "ZA",
  NGN: "NG", EGP: "EG", CHF: "CH", SEK: "SE", NOK: "NO",
  DKK: "DK", PLN: "PL", TRY: "TR", RUB: "RU", BRL: "BR",
  MXN: "MX", SGD: "SG", HKD: "HK", KRW: "KR", THB: "TH",
  MYR: "MY", IDR: "ID", PHP: "PH", AED: "AE", SAR: "SA"
};

//  Flag URL
function getFlagURL(code) {
  const country = currencyToCountryMap[code] || code.slice(0, 2);
  return `https://flagcdn.com/w40/${country.toLowerCase()}.png`;
}

//  Debounce (prevents too many API calls)
function debounce(func, delay = 400) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

//  Load currencies
async function loadCurrencies() {
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`
    );
    const data = await res.json();

    if (data.result !== "success") throw new Error();

    currencies = data.supported_codes;

    populateDropdown(fromCurrency, currencies);
    populateDropdown(toCurrency, currencies);

    fromCurrency.value = "USD";
    toCurrency.value = "KES";

    updateFlags();
    convertCurrency();

  } catch (err) {
    errorBox.textContent = "Failed to load currencies.";
    console.error(err);
  }
}

//  Populate dropdown
function populateDropdown(select, list) {
  select.innerHTML = "";

  list.forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${name}`;
    select.appendChild(option);
  });
}

// Search filter
function filterCurrency(input, select) {
  const value = input.value.toLowerCase();

  const filtered = currencies.filter(([code, name]) =>
    code.toLowerCase().includes(value) ||
    name.toLowerCase().includes(value)
  );

  populateDropdown(select, filtered.length ? filtered : [["", "No match"]]);
}

//  Update flags
function updateFlags() {
  if (fromFlag) fromFlag.src = getFlagURL(fromCurrency.value);
  if (toFlag) toFlag.src = getFlagURL(toCurrency.value);
}

//  Convert instantly (cached)
async function convertCurrency() {
  errorBox.textContent = "";

  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amt = parseFloat(amount.value);

  if (!amt || amt <= 0) {
    resultBox.textContent = "";
    return;
  }

  try {
    // Use cached rates
    if (!ratesCache[from]) {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`
      );
      const data = await res.json();

      if (data.result !== "success") throw new Error();

      ratesCache[from] = data.conversion_rates;
    }

    const rate = ratesCache[from][to];
    const result = (amt * rate).toFixed(2);

    resultBox.textContent = `${amt} ${from} = ${result} ${to}`;

  } catch (err) {
    errorBox.textContent = "Conversion failed.";
    console.error(err);
  }
}

//  Swap
swapBtn.addEventListener("click", () => {
  [fromCurrency.value, toCurrency.value] =
  [toCurrency.value, fromCurrency.value];

  fromSearch.value = "";
  toSearch.value = "";

  updateFlags();
  convertCurrency();
});

//  Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent =
    document.body.classList.contains("light") ? "☀️" : "🌙";
});

//  Debounced conversion
const debouncedConvert = debounce(convertCurrency, 400);

//  Events
amount.addEventListener("input", debouncedConvert);
fromCurrency.addEventListener("change", () => {
  updateFlags();
  convertCurrency();
});
toCurrency.addEventListener("change", () => {
  updateFlags();
  convertCurrency();
});

fromSearch.addEventListener("input", () =>
  filterCurrency(fromSearch, fromCurrency)
);

toSearch.addEventListener("input", () =>
  filterCurrency(toSearch, toCurrency)
);

//  Init
loadCurrencies();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(reg => {
        console.log("Service Worker registered!", reg);
      })
      .catch(err => {
        console.log("Service Worker failed:", err);
      });
  });
}