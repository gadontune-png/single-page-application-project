const country_list = {
    "AED" : "AE", "AFN" : "AF", "ALL" : "AL", "AMD" : "AM", "ANG" : "AN", "AOA" : "AO", "ARS" : "AR", "AUD" : "AU", "AZN" : "AZ", "BAM" : "BA", "BBD" : "BB", "BDT" : "BD", "BGN" : "BG", "BHD" : "BH", "BIF" : "BI", "BND" : "BN", "BOB" : "BO", "BRL" : "BR", "BSD" : "BS", "BTC" : "BT", "BTN" : "BT", "BWP" : "BW", "BYR" : "BY", "BZD" : "BZ", "CAD" : "CA", "CDF" : "CD", "CHF" : "CH", "CLP" : "CL", "CNY" : "CN", "COP" : "CO", "CRC" : "CR", "CUP" : "CU", "CVE" : "CV", "CZK" : "CZ", "DJF" : "DJ", "DKK" : "DK", "DOP" : "DO", "DZD" : "DZ", "EGP" : "EG", "ETB" : "ET", "EUR" : "FR", "FJD" : "FJ", "FKP" : "FK", "GBP" : "GB", "GEL" : "GE", "GGP" : "GG", "GHS" : "GH", "GIP" : "GI", "GMD" : "GM", "GNF" : "GN", "GTQ" : "GT", "GYD" : "GY", "HKD" : "HK", "HNL" : "HN", "HRK" : "HR", "HTG" : "HT", "HUF" : "HU", "IDR" : "ID", "ILS" : "IL", "INR" : "IN", "IQD" : "IQ", "IRR" : "IR", "ISK" : "IS", "JMD" : "JM", "JOD" : "JO", "JPY" : "JP", "KES" : "KE", "KGS" : "KG", "KHR" : "KH", "KMF" : "KM", "KPW" : "KP", "KRW" : "KR", "KWD" : "KW", "KYD" : "KY", "KZT" : "KZ", "LAK" : "LA", "LBP" : "LB", "LKR" : "LK", "LRD" : "LR", "LSL" : "LS", "LTL" : "LT", "LVL" : "LV", "LYD" : "LY", "MAD" : "MA", "MDL" : "MD", "MGA" : "MG", "MKD" : "MK", "MMK" : "MM", "MNT" : "MN", "MOP" : "MO", "MRO" : "MR", "MUR" : "MU", "MVR" : "MV", "MWK" : "MW", "MXN" : "MX", "MYR" : "MY", "MZN" : "MZ", "NAD" : "NA", "NGN" : "NG", "NIO" : "NI", "NOK" : "NO", "NPR" : "NP", "NZD" : "NZ", "OMR" : "OM", "PAB" : "PA", "PEN" : "PE", "PGK" : "PG", "PHP" : "PH", "PKR" : "PK", "PLN" : "PL", "PYG" : "PY", "QAR" : "QA", "RON" : "RO", "RSD" : "RS", "RUB" : "RU", "RWF" : "RW", "SAR" : "SA", "SBD" : "SB", "SCR" : "SC", "SDG" : "SD", "SEK" : "SE", "SGD" : "SG", "SHP" : "SH", "SLL" : "SL", "SOS" : "SO", "SRD" : "SR", "STD" : "ST", "SVC" : "SV", "SYP" : "SY", "SZL" : "SZ", "THB" : "TH", "TJS" : "TJ", "TMT" : "TM", "TND" : "TN", "TOP" : "TO", "TRY" : "TR", "TTD" : "TT", "TWD" : "TW", "TZS" : "TZ", "UAH" : "UA", "UGX" : "UG", "USD" : "US", "UYU" : "UY", "UZS" : "UZ", "VEF" : "VE", "VND" : "VN", "VUV" : "VU", "WST" : "WS", "XAF" : "CF", "XCD" : "AG", "XDR" : "XDR", "XOF" : "BE", "XPF" : "PF", "YER" : "YE", "ZAR" : "ZA", "ZMK" : "ZM", "ZWD" : "ZW"
};

const fromCurrency = document.querySelector("#selectSourceCurrency");
const toCurrency = document.querySelector("#selectTargetCurrency");
const amountInput = document.querySelector("#inputSourceCurrency");
const resultText = document.querySelector("#exchangeRateText");
const convertBtn = document.querySelector("#buttonConvert");
const swapBtn = document.querySelector("#buttonSwap");

const API_KEY = "6a387c5620d8533bd4cf6d8c"; // replace with your key
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

// Load exchange rate
async function getExchangeRate() {
    let amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        amount = 1;
        amountInput.value = "1";
    }

    const from = fromCurrency.value;
    const to = toCurrency.value;

    resultText.innerText = "Fetching exchange rate...";

    try {
        const response = await fetch(`${BASE_URL}${from}`);
        const data = await response.json();

        if (data.result !== "success") {
            throw new Error("API error");
        }

        const rate = data.conversion_rates[to];
        const converted = (amount * rate).toFixed(2);

        resultText.innerText = `${amount} ${from} = ${converted} ${to}`;
    } catch (error) {
        console.error(error);
        resultText.innerText = "Error fetching exchange rate.";
    }
}

// Swap currencies
function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    getExchangeRate();
}

// Event listeners
convertBtn.addEventListener("click", (e) => {
    e.preventDefault();
    getExchangeRate();
});

swapBtn.addEventListener("click", swapCurrencies);

// Auto update when currency changes
fromCurrency.addEventListener("change", getExchangeRate);
toCurrency.addEventListener("change", getExchangeRate);

// Load default rate on page load
window.addEventListener("load", getExchangeRate);