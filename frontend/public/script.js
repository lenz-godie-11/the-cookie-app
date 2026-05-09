const API_URL = "http://localhost:5000/api";

async function loadKitchen() {
    const response = await fetch(`${API_URL}/stock`); 
    const data = await response.json();
    document.getElementById('stock').innerText = data.count;
}

async function giveSignAndEat() {
    const response = await fetch(`${API_URL}/eat`, { method: 'POST' });
    const result = await response.json();

    if (result.success) {
        alert(result.message);
        loadKitchen();
    }
    else {
        alert("no cookie found");
    }
}    

loadKitchen();
