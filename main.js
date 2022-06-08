const hi = 'hello'


const cinemasList = [ ['LUMINOR+HOTEL+DE+VILLE' , 'C0013'] , ['CINEMA+DU+PANTHEON' , 'C0076'] , ['ECOLES+CINEMA+CLUB+(ECOLES+21)' , 'C0071'] , ['EPEE+DE+BOIS' , 'C0042'] , ['ESPACE+SAINT+MICHEL' , 'C0117'] , ['LA+FILMOTHEQUE+QUARTIER+LATIN' , 'C0020'] , ['LE+CHAMPO' , 'C0073'] , ['LE+GRAND+ACTION' , 'C0072'] , ['LE+REFLET+MEDICIS' , 'C0074'] , ['STUDIO+GALANDE' , 'C0016'] , ['CHRISTINE+CINEMA+CLUB+(CHRISTINE+21)' , 'C0015'] , ["L'ARLEQUIN" , 'C0054'] , ['LE+LUCERNAIRE' , 'C0093'] , ['LE+NOUVEL+ODEON' , 'C0041'] , ['LE+SAINT-ANDRE+DES+ARTS' , 'C0100'] , ['LES+3+LUXEMBOURG' , 'C0095'] , ["L'ESCURIAL PANORAMA" , 'C0147'] , ["L'ENTREPOT+CINEMA" , 'C0005'] , ['LES+7+PARNASSIENS' , 'C0025'] , ['CHAPLIN+DENFERT' , 'C0153']] //20 elements

//SAINT GERMAIN DES PRES (BILBOQUET) Place St Germain des Prés 75006 PARIS ne retourne pas de résultats => retiré de la liste


const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest='

const allocineURL = 'https://www.allocine.fr/_/showtimes/theater-'

const days = ['' , 'd-1/' , 'd-2/' , 'd-3/' , 'd-4/' , 'd-5/' , 'd-6/']

//const urlToFetch = proxyUrl+allocineURL+theater+days
// exemple : https://www.allocine.fr/_/showtimes/theater-C0153/d-6/


let globalAllFilms = []
let globalFilteredFilms = []

initializeFiltersValues()


document.querySelector('#fire').addEventListener('click', fire)
document.querySelector('#applyFilters').addEventListener('click', applyFilters)




function fire() {

    let day=getDay()
    //let day=1
	
	clearMovieList()
    displayHeader(day)

    fetchAll(getArrayOfUrl(cinemasList, day))
	
    //fetchAll( getArrayOfUrl(cinemasList, day) , [] ) 

}


function applyFilters() {
    //The apply filter button can be used without sending a new fetch request
    arrFilmObj = globalAllFilms.slice()

    console.log('All films :', globalAllFilms);

    let preference=getPreference()

    arrFilmObj = filterFilms(preference, arrFilmObj)
    globalFilteredFilms = arrFilmObj.slice()
    console.log('Filtered Films :', arrFilmObj)

    //console.log(globalAllFilms);
    clearMovieList()
    displayTable(arrFilmObj)
}




//DOM FUNCTIONS AT PAGE LOAD

function getDayFromInt(day){
    const weekday = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
    return weekday[day];	
}


function initializeFiltersValues() {
    //initialize what is shown in the filters ; i.e. time of now and day of today
    freeTimeSetToNow()
    displayDays()
}

function freeTimeSetToNow() {
    //input of time has now the default value of now

    const today = new Date()
    let time = today.getHours() + ":" + today.getMinutes()
    document.getElementById('time-input').value = time
}


function displayDays() {
    //select options are varying from which day we are

	const today = new Date();
	
	for (let i=0; i<7;i++) {
		let day = getDayFromInt(today.getDay()+i);
		const option = document.createElement('option') 
		option.value = i
		option.innerText = day
		document.querySelector('#day-select').appendChild(option)
	}	

}



//FETCH FUNCTIONS


function getArrayOfUrl (cinemasList, day) {
    //returns [ [Cinema_Name0 , urlDayCinema] ; [Cinema_Name1 , urlDayCinema] ; etc.]
    let result = []
    for (let i=0 ; i<cinemasList.length ; i++) {
        let url = proxyUrl+allocineURL+cinemasList[i][1]+'/'+days[day]
        result.push([ cinemasList[i][0] , url])
    }
    return result
}


function fetchAll(urlArr) {
    let arrOfFetch = []
    for(let i=0 ; i<urlArr.length ; i++) {
        let fetchReq = fetch(urlArr[i][1]).then(res=>res.json())
        arrOfFetch.push(fetchReq)
    }

    let allData = Promise.all(arrOfFetch)
    allData.then(data => {
        console.log('HERE ARE THE PRECIOUS DATA :' , data)
        //data is an array of 20 cinemas' projections
        let arrFilmObj = []
        for (let i=0 ; i<cinemasList.length ; i++){
            arrFilmObj = arrFilmObj.concat( getInfosOfACinema(data[i] , cinemasList[i]) )
        }

        console.log('All films :', arrFilmObj);
        globalAllFilms = arrFilmObj.slice()

        let preference=getPreference()

        arrFilmObj = filterFilms(preference, arrFilmObj)
        console.log('Filtered Films :', arrFilmObj)

        globalFilteredFilms = arrFilmObj.slice()
        //console.log(globalAllFilms);
        displayTable(arrFilmObj)
    })
    
}


















//BUILDING FUNCTIONS
class FilmMaker {
    //create an object for each film containing multiple keys like : title, genre, director, etc
    constructor (title, rating, synopsis, showtime, poster='', genre, releaseDate, director, actors, runtime, cinema) {
        this.title=title
        this.rating=rating
        this.synopsis=synopsis
        this.showtime=showtime
        //this.vovf=vovf
        this.poster=poster
        this.genre=genre
        this.releaseDate=releaseDate
        this.director=director
        this.actors=actors
        this.runtime=runtime
        this.cinema=cinema
    }
}


function getInfosOfACinema(data, cinema) {
    //Takes data of 1 cinema, cinemaName, a list of films
    //pushes films to the total list
    //Returns the list of films of said cinema


    //bug à vérifier : je ne prends que les films de la catégorie multiple et original, il reste la catégorie dubbed et la catégorie local mais certaines se chevauchent.


    let result = data.results //this is what matter to us for each cinemas. It is an array of [ {{movie}, {showtimes}}, {{movie}, {showtimes}}, etc. ]


    let listToReturn=[]

    for (let j=0 ; j<result.length ; j++) {

        let title = result[j].movie.title ??  'titre inconnu'
        let rating = result[j].movie.stats.userRating?.score ?? -1
        let synopsis = result[j].movie.synopsisFull ?? 'synopsis inconnu'
        let showtimes = []
        for(let k=0 ; k<result[j].showtimes.multiple.length ; k++) {
            showtimes.push(['VF',result[j].showtimes.multiple[k].startsAt])
        }
        for(let k=0 ; k<result[j].showtimes.original.length ; k++) {
            showtimes.push(['VO',result[j].showtimes.original[k].startsAt])
        }
        let poster = result[j].movie.poster?.url ?? ''
        let genre = []
        for (let k = 0 ; k<result[j].movie.genres.length ; k++) {
            genre.push(result[j].movie.genres[k].translate)
        }
        let releaseDate = ''
        for (let k=0 ; k<result[j].movie.releases.length ; k++) {
            if(result[j].movie.releases[k]?.name==='Released') {
                releaseDate = result[j].movie.releases[k].releaseDate?.date ?? '0001-01-01'
            }
        }


        let director = result[j].movie.credits[0]?.person?.firstName+ ' '+result[j].movie.credits[0]?.person?.lastName ?? 'director inconnu'
        let runtime = result[j].movie.runtime ??'runtime inconnu'

        let actors = []
            for (let actor of result[j].movie.cast.nodes) {
                try{
                    actors.push(actor.actor['firstName'] + ' ' + actor.actor['lastName'])
                }catch(error){}
            }


        //totalList.push(new FilmMaker(title, rating,  synopsis, showtimes, poster, genre, releaseDate, director, runtime, cinema))

        listToReturn.push(new FilmMaker(title, rating,  synopsis, showtimes, poster, genre, releaseDate, director, actors, runtime, cinema))

    }

    return listToReturn
}




//==========================================================================
//SORTING FUNCTIONS

function filterFilms(preference, arrOfFilmObject) {
    //takes an arrOfFilmObject and a preference list ; returns a filtered arrOfFilmObject
    //preference [era, earliestFilmTime, rating]
    let result = arrOfFilmObject

    let era=preference[0]
    let earliestFilmTime=preference[1]

    //console.log(preference);

    result = filterEra(result, era)
    result = filterFilmsAfterAGivenTime(result , earliestFilmTime)

    return result
}




function filterEra(arrOfFilmObject, era) {
    //takes an array of film objects and an era from preference
    let result = arrOfFilmObject

    if(era==='all'){   }
    else if(era==='after-2020') {
        result = keepFilmsAfter2020(result)
    }
    else if(era==='before-2020') {
        result = keepFilmsBefore2020(result)
    }

    return result



    function keepFilmsAfter2020(arrOfFilmObject) {
        //Takes an array of film object
        //returns an array of films objects all older than 2020 i.e. release date > 2020
        //date should be 'YYYY-MM-DD'
        let limit = new Date('2020-01-01')
        let result=[]
        for (let i=0 ; i<arrOfFilmObject.length ; i++) {
            let date= new Date(arrOfFilmObject[i].releaseDate)
            if(date>=limit) {
                result.push(arrOfFilmObject[i])
            }
        }
    
        return result
    }
    
    
    function keepFilmsBefore2020(arrOfFilmObject) {
        //Takes an array of film object
        //returns an array of films objects all older than 2020 i.e. release date > 2020
        //date should be 'YYYY-MM-DD'
        let limit = new Date('2020-01-01')
        let result=[]
        for (let i=0 ; i<arrOfFilmObject.length ; i++) {
            let date= new Date(arrOfFilmObject[i].releaseDate)
            if(date<=limit) {
                result.push(arrOfFilmObject[i])
            }
        }
    
        return result
    }
    
}

function keepFilmsWithARatingGreaterThan(arrOfFilmObject, rating) {
    if(rating>=0 && rating<=5) {
        return arrOfFilmObject.filter( elem => elem.rating>rating)
    }
}


function filterFilmsAfterAGivenTime(arrOfFilmObject, time) {
    //Takes an array of film object and a time all or 18:00
    //returns an array of films objects having at least a showtime > than time
    let result=arrOfFilmObject

    if(time==='all') {
        return result
    }
    else{
        let jPlus = Number(getDay()) //0 to 6
        let today = new Date()
        let limit = new Date(today)
        limit.setDate(limit.getDate() + jPlus) //if the today is 31 it will change month (or year is it is 31 december) // so all good
        let hour = Number(time.split(':')[0])
        let minute = Number(time.split(':')[1])
        limit.setHours(hour,minute,0,0) //change hours and minutes to what we need
    
        //console.log(limit);

        result = result.filter(film => { //result is an array of film object
            let res=false

            for(let showtime of film.showtime) { //film.showtime is an array of shotimes like [ ["VF", 2022-05-14T14:00:00] , ["VO", 2022-05-14T18:00:00] ]
                let date = new Date(showtime[1]) //create the date of the showtime
                if(date>=limit){ //if it is later than limit
                    res = true
                }
            }
            return res
        })
    
        return result
    }

}





//DISPLAY FUNCTION

function clearMovieList()
{
	//Clear list movie
	if (document.querySelector('tbody'))
	{
		
		document.querySelector('table').removeChild(document.querySelector('tbody'))
		
		const listMovies_l = document.createElement('tbody') 
		const movie_l = document.createElement('tr') 
		listMovies_l.id = "list-movies"//
		listMovies_l.appendChild(movie_l)
		
		document.querySelector('table').appendChild(listMovies_l)
	}	
}

function displayHeader(day) {
    let header
    day = Number(day)

    const today = new Date();

    switch (day) {
        case 0:
            header="Films du jour"
            break;

        default:
            header= "Films de "+getDayFromInt(day + today.getDay())
            break;
    }

    //Which day Cell / Title
	
	let th
	if (document.querySelector('#headerdate'))
	{
		th = document.querySelector('#headerdate')
		th.innerText=header
	}
	else
	{
		let headerRow=document.createElement('tr')
		let th=document.createElement('th')
		th.colSpan='2'
		th.innerText=header
		th.id ='headerdate'
		headerRow.appendChild(th)
		document.querySelector('thead').appendChild(headerRow)
	}
	

}

function displayTable(arrOfFilmObject) {

    //Films Cell
    for(let i=0 ; i<arrOfFilmObject.length ; i++) {

        let filmUrl=arrOfFilmObject[i].title.split(' ').join('%20')
        filmUrl='https://google.com/search?q='+filmUrl+' horaires'

        createARow(arrOfFilmObject[i].poster , arrOfFilmObject[i].title, filmUrl, i)
    }



    function createARow(posterURL, title, filmUrl, idx) {
        //create a row with given infos
        let row = document.createElement('tr')
        row.classList.add('film'+idx)

        //Poster cell
        let posterCell= document.createElement('td')
        let linkPosterCell = document.createElement('a')
        posterCell.classList.add('poster-cell')
        linkPosterCell.title=title
        linkPosterCell.href= filmUrl
        linkPosterCell.target = '_blank'
        let imgPoster = document.createElement('img')
        imgPoster.src=posterURL
        linkPosterCell.appendChild(imgPoster) //<a> <img> </a>
        posterCell.appendChild(linkPosterCell) //<td> a<img>a </td>
        row.appendChild(posterCell) //tr td tr
    
    
        //Title cell
        let titleCell=document.createElement('td')
        titleCell.classList.add('title-cell')
        let linkTitleCell = document.createElement('a')
        let span = document.createElement('span')
        span.innerText = 'More'
        span.classList.add('film'+idx)
        span.classList.add('more')
        span.onclick = retrieveFilmObjectWhenClickMore

        linkTitleCell.href = filmUrl
        linkTitleCell.target = '_blank'
        linkTitleCell.innerText = title
        let titleText = document.createElement('h2')
        titleText.appendChild(linkTitleCell) // <h2> <a href=filmurl> title </a> </h2>
        titleCell.appendChild(titleText) //td h2 a /h2 /td
        titleCell.appendChild(span)

        row.appendChild(titleCell) //tr td tr

        document.querySelector('tbody').appendChild(row)
    }
}






//GET INFOS FROM THE DOM
function getDay() {
    let day = document.querySelector('#day-select').value // 0 to 6
    return day
}

function getPreference() {
    //return an array of preference [era, earliestFilmTime, rating]
    //where era=both, after2020 or before2020
    //where earliestFilmTime = all, 18:00, 22:00 etc
    //where rating = number between [0,5]

    let era=getEra()
    let earliestFilmTime=getEarliestFilm()
    let rating = getRating()

    return [era, earliestFilmTime, rating]

}

function getEra() {
    let era = document.querySelector('#era-select').value // all OR after-2020 OR before-2020
    return era
}

function getEarliestFilm() {
    let time = document.querySelector('#time-input').value // all OR 18:00
    if(time==='all') {
        return 'all'
    }else { //check validity of input, returns all if unvalid
        time=time.split(':')

        if( Number(time[0])<=24 && Number(time[0])>=0 && Number(time[1])<=60 && Number(time[1])>=0) {
            return time.join(':')
        }
        else {
            return 'all'
        }
    }
    //return all OR 18:00
}

function getRating() {
    let rating=Number(document.querySelector('#rating-input').value)
    if(rating<=0) { //check validity of input
        rating=0
    }else if(rating>=5){
        rating=5
    }
    return rating // 0 to 5
}



//=================================================================================================================================================================================

//INTERACTION FUNCTIONS

//        totalList.push(new FilmMaker(title, rating,  synopsis, showtimes, poster, genre, releaseDate, director, actors, runtime, cinema))

function retrieveFilmObjectWhenClickMore() {
    //this function will display the information in the more box
    try{document.querySelector('.film-full-info.hidden').classList.remove('hidden')}catch(error){}

    let idx = event.target.classList[0].slice(4) //get the index of the more i.e which more was clicked on
    console.log(idx);
    //let film =  globalAllFilms[idx]
    let film = globalFilteredFilms[idx]
    console.log(film);

    let container = document.querySelector('.film-full-info')

    let poster = document.querySelector('.film-full-info img.poster')
    poster.src = film['poster']

    let title = document.querySelector('.film-full-info .title')
    title.innerText = film['title']

    let releaseNRuntime = document.querySelector('span.release-runtime')
    releaseNRuntime.innerText = film['releaseDate'].slice(0,4) + ' - ' + film['runtime']

    let director = document.querySelector('.film-full-info .director')
    director.innerText = 'Par : ' + film['director']

    let actors = document.querySelector('.film-full-info .actors')
    let actorsStr = 'Avec : '
    actors.innerText = actorsStr
    for(let actor of film['actors']) {
        actorsStr += actor+', '
    }
    actorsStr = actorsStr.slice(0,-2)
    actorsStr.length > 7 ? actors.innerText = actorsStr : actors.innerText += ' No information'

    let genres = document.querySelector('.film-full-info .genres')
    genres.innerText=''
    for (let i of film['genre']) {
        genres.innerText += ' '+ i + ' '
    }

    let synopsis = document.querySelector('.film-full-info .synopsis')
    synopsis.innerText=film['synopsis']


    let cinemaName = document.querySelector('h2.cinema-name')
    cinemaName.innerText = film.cinema[0].replaceAll('+' , ' ')

    let showtimesContainer = document.querySelector('div.showtimes-and-language-container')

    let showtimeChild = showtimesContainer.lastElementChild //clear section
    while(showtimeChild) {
        showtimesContainer.removeChild(showtimeChild)
        showtimeChild = showtimesContainer.lastElementChild
    }

    for(let seance of film.showtime) {
        let cell = document.createElement('div')
        cell.classList.add("showtimes-and-language")
        cell.innerText = seance[0]+ '\n' + seance[1].slice(-8,-3) //removes year and second
        showtimesContainer.appendChild(cell)
    }
}

//CLOSE BUTTON IN THE DETAILS BOX
let closeButton = document.querySelector('.close-button').addEventListener('click' , function() {
    document.querySelector('.film-full-info').classList.add('hidden')
})


//Get the button:
let mybutton = document.getElementById("to-top-button");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    let rootElement = document.documentElement
//   document.body.scrollTop = 0; // For Safari
//   document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    rootElement.scrollTo({
        top: 0,
        behavior: "smooth"
    })
}