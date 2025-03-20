console.log("binded");
// Initialiser la carte
var mymap = L.map('map').setView([-22.2758, 166.4572], 7);
// Ajouter un fond de carte OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(mymap);


/* URL API DU DATASET :
/api/explore/v2.1/catalog/datasets/bornes-de-recharge-pour-vehicules-electriques/records?limit=20
*/

const requestOptions = {
    method: "GET",
    redirect: "follow"
};

fetch("https://data.gouv.nc/api/explore/v2.1/catalog/datasets/bornes-de-recharge-pour-vehicules-electriques/records?limit=45")
    .then(response => response.json()) // Convertir en JSON
    .then(data => {
        console.log("Le retour de la requête :", data);

        // check si results existe dans l'objet
        if (data.results) {
            for (let i of data.results) {
                if (i.geo_point_2d) {
                    let lat = i.geo_point_2d.lat;
                    let lon = i.geo_point_2d.lon;

                    console.log("Coordonnées :", lat, lon);

                    // Ajouter le marqueur pour le point
                    let marker = L.marker([lat, lon]).addTo(mymap);
                    // Ajouter une popup au marqueur
                    marker.bindPopup("<b>" + i.nom_station + "</b><br>" + i.adresse_station);
                }
            }
        } else {
            console.error("Aucun enregistrement trouvé.");
        }
    })
    .catch(error => console.error("Erreur :", error));


