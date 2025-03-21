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
function setCase(str){
    str = str.toLowerCase();
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return str;
}
function showSidebar(nom, adresse) {
    sidebar = document.getElementById('sideBar');
    sidebar.style.display = "block";
    h2 = document.getElementById('sideBar').getElementsByTagName('h2')[0];
    p = document.getElementById('sideBar').getElementsByTagName('p')[0];
    h2.innerHTML = nom;
    p.innerHTML = adresse;
}
function hideSidebar() {
    document.getElementById("sideBar").style.display = "none";
}
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

                    //console.log("Coordonnées :", lat, lon);

                    // Ajouter le marqueur pour le point
                    let marker = L.marker([lat, lon]).addTo(mymap);

                    // Ajouter une popup au marqueur
                    marker.onclick = function () {
                        window.alert(i.nom_station)
                    }

                    function showData(a) {
                        alert("You clicked the map at " + a);
                    }

                    marker.on('click', function() {
                        showSidebar(i.nom_station,i.adresse_station);
                    });


                    //marker.bindPopup("<b>" + i.nom_station + "</b><br>" + i.adresse_station);
                }
            }
        } else {
            console.error("Aucun enregistrement trouvé.");
        }
    })
    .catch(error => console.error("Erreur :", error));


