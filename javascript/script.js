console.log("binded"); // Affiche "binded" dans la console pour indiquer qu'un événement a été attaché

// Initialiser la carte Leaflet avec une vue centrée sur la Nouvelle-Calédonie
var mymap = L.map('map').setView([-22.2758, 166.4572], 7);

// Ajouter une couche de fond OpenStreetMap avec un zoom maximal de 20
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(mymap);

/*
   URL API du dataset des bornes de recharge pour véhicules électriques :
   https://data.gouv.nc/api/explore/v2.1/catalog/datasets/bornes-de-recharge-pour-vehicules-electriques/records?limit=20
*/

const requestOptions = {
    method: "GET",
    redirect: "follow"
};

/**
 * Normalise une chaîne en minuscule et supprime les accents
 * @param {string} str - La chaîne à normaliser
 * @returns {string} - La chaîne normalisée
 */
function setCase(str) {
    str = str.toLowerCase();
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprime les accents
    return str;
}

/**
 * Affiche la barre latérale avec les informations de la station sélectionnée
 * @param {string} nom - Nom de la station
 * @param {string} adresse - Adresse de la station
 */
function showSidebar(nom, adresse) {
    let sidebar = document.getElementById('sideBar');
    sidebar.style.display = "block";
    let h3 = sidebar.getElementsByTagName('h3')[0];
    let p = sidebar.getElementsByTagName('p')[0];
    h3.innerHTML = nom;
    p.innerHTML = adresse;
}

let markersPoint = []; // Tableau stockant tous les marqueurs

/**
 * Filtre les marqueurs sur la carte en fonction de la recherche utilisateur
 */
function filterMarkers() {
    let query = setCase(document.getElementById("searchBar").value); // Normalisation de la recherche

    markersPoint.forEach(marker => {
        let searchData = marker.searchData || ""; // Vérifie que searchData est défini
        if (searchData.includes(query)) {
            marker.addTo(mymap); // Affiche le marqueur si la recherche correspond
        } else {
            mymap.removeLayer(marker); // Supprime le marqueur sinon
        }
    });
}

let markersLayer = L.layerGroup();
// Effectuer une requête pour récupérer les bornes de recharge
fetch("https://data.gouv.nc/api/explore/v2.1/catalog/datasets/bornes-de-recharge-pour-vehicules-electriques/records?limit=45")
    .then(response => response.json()) // Convertir la réponse en JSON
    .then(data => {
        console.log("Le retour de la requête :", data); // Affiche les données reçues

        if (data.results) {
            data.results.forEach(i => {
                if (i.geo_point_2d) {
                    let lat = i.geo_point_2d.lat;
                    let lon = i.geo_point_2d.lon;

                    // Concaténer toutes les informations utiles à la recherche
                    let searchData = [
                        i.nom_station,
                        i.nom_commercial,
                        i.nom_operateur,
                        i.adresse_station,
                        i.commune,
                        i.code_postal
                    ].filter(Boolean).map(setCase).join(" "); // Supprime les valeurs nulles et normalise le texte

                    // Ajouter le marqueur pour la borne de recharge sur la carte
                    let marker = L.marker([lat, lon]).addTo(mymap);
                    marker.searchData = searchData; // Stocke les données concaténées pour la recherche
                    markersPoint.push(marker); // Ajoute le marqueur à la liste

                    // Ajoute un événement de clic pour afficher les détails dans la barre latérale
                    marker.on('click', function() {
                        showSidebar(i.nom_station, i.adresse_station);
                    });
                }
            });
        } else {
            console.error("Aucun enregistrement trouvé."); // Gère le cas où il n'y a pas de données
        }
    })
    .catch(error => console.error("Erreur :", error)); // Gère les erreurs de requête



navigator.geolocation.getCurrentPosition(
    (position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        console.log("Votre position :", lat, lon);

        // Définir une icône personnalisée
        let userIcon = L.icon({
            iconUrl: './assets/img/location.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Ajouter un marqueur à la position actuelle avec l'icône personnalisée
        let userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(mymap)
            .bindPopup("Vous êtes ici")
            .openPopup();
    },
    (error) => {
        console.error("Erreur lors de la récupération de la position :", error);
    }
);

function clearSidebar() {
    const sideBar = document.getElementById("sideBar");

    // Vider les éléments h2 et p uniquement
    const h3 = sideBar.querySelector("h3");
    const p = sideBar.querySelector("p");

    if (h3) h3.textContent = "";
    if (p) p.textContent = "";
}
