
// CONFIG

const API_KEY = "6a387c5620d8533bd4cf6d8c";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;


// SELECTORS

const fromCurrency = document.querySelector("#selectSourceCurrency");
const toCurrency = document.querySelector("#selectTargetCurrency");
const amountInput = document.querySelector("#inputSourceCurrency");
const resultText = document.querySelector("#exchangeRateText");
const convertBtn = document.querySelector("#buttonConvert");
const swapBtn = document.querySelector("#buttonSwap");
const fromFlag = document.querySelector("#imageSourceCurrency");
const toFlag = document.querySelector("#imageTargetCurrency");

// BASIC FLAG MAP (fallback)

const countryMap = {
  USD: "US",
  KES: "KE",
  EUR: "EU",
  GBP: "GB",
  JPY: "JP",
  INR: "IN",
  AUD: "AU",
  CAD: "CA",
  CNY: "CN",
  ZAR: "ZA"
};


// LOAD ALL CURRENCIES FROM API 🌍

async function loadCurrencies() {
  try {
    const res = await fetch(`${BASE_URL}/latest/USD`);
    const data = await res.json();

    const currencies = Object.keys(data.conversion_rates);

    fromCurrency.innerHTML = "";
    toCurrency.innerHTML = "";

    currencies.forEach(currency => {
      fromCurrency.add(new Option(currency, currency));
      toCurrency.add(new Option(currency, currency));

    });

    // Defaults
    fromCurrency.value = localStorage.getItem("from") || "USD";
    toCurrency.value = localStorage.getItem("to") || "KES";

    updateFlag(fromCurrency, fromFlag);
    updateFlag(toCurrency, toFlag);

  } catch (err) {
    console.error(err);
    resultText.innerText = "❌ Failed to load currencies";
  }
}



// FLAG HANDLING (SMART)

function updateFlag(selectEl, imgEl) {
  const currency = selectEl.value;

  // Try map first
  let countryCode = countryMap[currency];

  // If not found → guess first 2 letters
  if (!countryCode) {
    countryCode = currency.slice(0, 2);
  }

  imgEl.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
}


// VALIDATION

function validateAmount(value) {
  if (isNaN(value) || value <= 0) {
    resultText.innerText = "❌ Enter a valid amount";
    return false;
  }
  return true;
}


// CONVERSION

async function getExchangeRate() {
  let amount = parseFloat(amountInput.value);

  if (!validateAmount(amount)) return;

  const from = fromCurrency.value;
  const to = toCurrency.value;

  convertBtn.disabled = true;
  resultText.innerText = "⏳ Converting...";

  try {
    const res = await fetch(`${BASE_URL}/latest/${from}`);
    const data = await res.json();

    if (data.result !== "success") {
      throw new Error("API failed");
    }

    const rate = data.conversion_rates[to];
    const converted = (amount * rate).toFixed(2);

    resultText.innerText = `${amount} ${from} = ${converted} ${to}`;

    // Save preferences
    localStorage.setItem("from", from);
    localStorage.setItem("to", to);

  } catch (err) {
    console.error(err);
    resultText.innerText = "❌ Error fetching exchange rate";
  } finally {
    convertBtn.disabled = false;
  }
}


// SWAP

function swapCurrencies() {
  let temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;

  updateFlag(fromCurrency, fromFlag);
  updateFlag(toCurrency, toFlag);

  getExchangeRate();
}


// EVENTS

convertBtn.addEventListener("click", (e) => {
  e.preventDefault();
  getExchangeRate();
});

swapBtn.addEventListener("click", swapCurrencies);

fromCurrency.addEventListener("change", () => {
  updateFlag(fromCurrency, fromFlag);
  getExchangeRate();
});

toCurrency.addEventListener("change", () => {
  updateFlag(toCurrency, toFlag);
  getExchangeRate();
});

amountInput.addEventListener("input", () => {
  if (amountInput.value !== "") {
    getExchangeRate();
  }
});


// INIT

window.addEventListener("load", async () => {
  await loadCurrencies();
  getExchangeRate();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}