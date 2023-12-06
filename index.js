document.addEventListener("DOMContentLoaded", function(){
    let filmList = document.getElementById("filmList");
    fetch("https://ghibliapi.vercel.app/films").then(response => response.json()).then((data) => {
        let btns = [];

        function affichageFilms (filmL, n){
            filmL.forEach((film) => {
                const filmCard = document.createElement("div");
                filmCard.classList.add("film-card");
                const filmImage = document.createElement("img");
                filmImage.src = film.image;
                filmImage.alt = film.title;
                const filmInfos1 = document.createElement("div");
                filmInfos1.classList.add("film-Infos1");
                filmInfos1.innerHTML = `
                    <span>${film.title}</span><br>
                    <span id="S-infos">${film.director}</span>
                `
                const filmInfos2 =  document.createElement("div");
                filmInfos2.classList.add("film-Infos2");
                filmInfos2.innerHTML = `
                <button class = "film-card-button" parentID=${film.id}>View</button>
                <span id="S-infos">${film.original_title}</span>
                `
                
                filmInfos1.appendChild(filmInfos2);
                if (n != 0){
                    const newData = document.createElement("span");
                    newData.classList.add("new-Data");
                    if (n === 1){
                        newData.innerText = `${film.rt_score/10}/10`;
                    }else if (n === 2){
                        newData.innerText =`${film.running_time} min` ;
                    }else{
                        newData.innerText = `${film.release_date}`;
                    }
                    filmCard.appendChild(newData);
                }
                filmCard.appendChild(filmImage);
                filmCard.appendChild(filmInfos1);
                filmList.appendChild(filmCard);
            });
            btns = document.querySelectorAll("button");
            SetPopup(btns);
        };
        
        affichageFilms(data,0);
        
        const searchBar = document.getElementById("searchBar");
        searchBar.addEventListener("input", function(event){  
            const valRechercher = searchBar.value.toLowerCase();
            const filmsFiltrer = data.filter((film) => film.title.substring(0,valRechercher.length).toLowerCase() === valRechercher);
            filmList.innerHTML = "";
            if (filmsFiltrer.length === 0){
                const message = document.createElement("h1");
                message.innerText = "Pas de films avec ce titre !!!";
                filmList.appendChild(message);
            }else{
                affichageFilms(filmsFiltrer,0);
            }
        });

        const searchDropdown = document.getElementById("searchDropdown");
        searchDropdown.addEventListener("change", function (){
            filmList.innerHTML = "";
            if (searchDropdown.value === "rt_score"){
                const filmsTrie = data.sort((filmA, filmB) => filmB.rt_score - filmA.rt_score);
                affichageFilms(filmsTrie,1);
            }else if (searchDropdown.value === "running_time"){
                const filmsTrie = data.sort((filmA, filmB) => filmB.running_time - filmA.running_time);
                affichageFilms(filmsTrie,2);
            }else {
                const filmsTrie = data.sort((filmA, filmB) => filmB.release_date - filmA.release_date);
                affichageFilms(filmsTrie,3);
            }
        });

        let filmsDirector = {} ;
        data.reduce((acc, curr) => {
            if (!filmsDirector[acc.director]){
                filmsDirector[acc.director] = [acc.title];
            }else{
                filmsDirector[acc.director].push(acc.title) ;
            };
            return curr;
        });

        function SetPopup (buttons){
            buttons.forEach((button) => {
                button.addEventListener("click",function(event){
                    const filmConserner = data.filter((film) => film.id === event.target.attributes[1].textContent)[0] ;
                    const Popup = document.getElementById("popup");
                    Popup.classList.add("active");
                    Popup.innerHTML = `
                    <div class = "Pop-up-upper-container">
                        <button class = "close-button">Close</button>
                        <img class="movie_banner" src=${filmConserner.movie_banner} alt=${filmConserner.title} />
                    </div>    
                    <div class = "Pop-up-lower-container">
                        <div class = "Pop-up-lower-container1">
                            <span><strong><u>Titre :</u></strong> ${filmConserner.title}</span>
                            <span><strong><u>Titre original :</u></strong> ${filmConserner.original_title}</span>
                            <span><strong><u>Titre original romanisé :</u></strong> ${filmConserner.original_title_romanised}</span>
                            
                        </div>
                        <div class = "Pop-up-lower-container1">
                            <span><strong><u>RT Score :</u></strong> ${filmConserner.rt_score/10}/10</span>
                            <span><strong><u>Directeur/Directrice :</u></strong> ${filmConserner.director}</span>
                            <span><strong><u>Producteur/Productrice :</u></strong> ${filmConserner.producer}</span>
                            
                        </div>
                        <div class = "Pop-up-lower-container2">
                            <span><strong><u>Date de sortie :</u></strong> ${filmConserner.release_date}\t</span>
                            <span><strong><u>Durée :</u></strong> ${filmConserner.running_time} minutes</span>
                        </div>
                        <p><strong><u>Description :</u></strong><br>${filmConserner.description}</p>
                        <div>
                            <span><strong><u>Equipe de production :</u></strong></span>
                            <ul id = "people"></ul>
                        </div>
                        <div>
                            <span><strong><u>Autres films par ${filmConserner.director} :</u></strong></span>
                            <ul id = "films-same-director"></ul>
                        </div> 
                    </div>`;
                    
                    const people = document.getElementById("people");
                    filmConserner.people.forEach((person) => {
                        fetch(person).then(response => response.json()).then((personInfos) => {                      
                            if (personInfos.name === undefined){
                                people.textContent = "Désoler, mais ces informations ne sont pas accessibles !!!";
                            }else{ 
                                const newPerson = document.createElement("li");
                                newPerson.textContent = personInfos.name;
                                people.appendChild(newPerson); 
                            }   
                        }).catch( (error) => console.error("API inaccessible", error));  
                    });
                    
                    const Fd = document.getElementById("films-same-director");
                    const directorConserner = filmConserner.director;
                    if (filmsDirector[directorConserner].length === 1){
                        Fd.textContent = `Désoler, mais ${directorConserner} n'a pas d'autres films listés pour le moment !!!`;
                    }else{ 
                        filmsDirector[directorConserner].reduce((acc, curr) => {
                            const newfilm = document.createElement("li");
                            newfilm.textContent = acc;
                            Fd.appendChild(newfilm);
                            return curr;
                        }) 
                    };  
    
                    const blur = document.getElementById("blur");
                    blur.classList.add("active");
                    const body = document.querySelector("body");
                    body.classList.add("no-scroll");
    
                    const closeButton = document.querySelector(".close-button");
                    closeButton.addEventListener("click", function(){
                        popup.classList.remove("active");
                        blur.classList.remove("active");
                        body.classList.remove("no-scroll");
                    });
                });
            });
        }
       
    }).catch( (error) => console.error("API inaccessible", error));
});

const headerAction = document.getElementById("header-action");
const searchDropdown = document.getElementById("searchDropdowner");
const options = [
    { value: "score", label: "Score (décroissant)" },
    { value: "runningTime", label: "Durée  (décroissante)" },
    { value: "releaseDate", label: "Plus récents" }
];
options.forEach(option => {
    const newOP = document.createElement("option");
    newOP.value = option.value;
    newOP.textContent = option.label;
    searchDropdown.appendChild(optionElement);
});
headerAction.appendChild(searchDropdown);