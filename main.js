const hi = 'hello'

const cinemasList = [ ['LUMINOR+HOTEL+DE+VILLE' , 'C0013'] , ['CINEMA+DU+PANTHEON' , 'C0076'] , ['ECOLES+CINEMA+CLUB+(ECOLES+21)' , 'C0071'] , ['EPEE+DE+BOIS' , 'C0042'] , ['ESPACE+SAINT+MICHEL' , 'C0117'] , ['LA+FILMOTHEQUE+QUARTIER+LATIN' , 'C0020'] , ['LE+CHAMPO' , 'C0073'] , ['LE+GRAND+ACTION' , 'C0072'] , ['LE+REFLET+MEDICIS' , 'C0074'] , ['STUDIO+GALANDE' , 'C0016'] , ['CHRISTINE+CINEMA+CLUB+(CHRISTINE+21)' , 'C0015'] , ["L'ARLEQUIN" , 'C0054'] , ['LE+LUCERNAIRE' , 'C0093'] , ['LE+NOUVEL+ODEON' , 'C0041'] , ['LE+SAINT-ANDRE+DES+ARTS' , 'C0100'] , ['LES+3+LUXEMBOURG' , 'C0095'] , ["L'ESCURIAL PANORAMA" , 'C0147'] , ["L'ENTREPOT+CINEMA" , 'C0005'] , ['LES+7+PARNASSIENS' , 'C0025'] , ['CHAPLIN+DENFERT' , 'C0153']] //20 elements

//SAINT GERMAIN DES PRES (BILBOQUET) Place St Germain des Prés 75006 PARIS ne retourne pas de résultats => retiré de la liste

//C0117 pose problème??

const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest='

const allocineURL = 'https://www.allocine.fr/_/showtimes/theater-'

const days = ['' , 'd-1/' , 'd-2/' , 'd-3/' , 'd-4/' , 'd-5/' , 'd-6/']

//const urlToFetch = proxyUrl+allocineURL+theater+days
// exemple : https://www.allocine.fr/_/showtimes/theater-C0153/d-6/






























document.querySelector('#fire').addEventListener('click', fire)

function fire() {

    let day=getDay()
    //let day=1
    let listOfFilmsObjects=[]
    displayHeader(day)


    fetchAll( getArrayOfUrl(cinemasList, day) , [] )

}



//should work...
//fetchAll( getArrayOfUrl(cinemasList, 1) , [] )


function getArrayOfUrl (cinemasList, day) {
    //returns [ [Cinema_Name0 , urlDayCinema] ; [Cinema_Name1 , urlDayCinema] ; etc.]
    let result = []
    for (let i=0 ; i<cinemasList.length ; i++) {
        let url = proxyUrl+allocineURL+cinemasList[i][1]+'/'+days[day]
        result.push([ cinemasList[i][0] , url])
    }
    return result
}


function fetchAll(urlArr, list) {
    let result=list

    if(urlArr.length<=0) {
        console.log(result)

        //let preference=getPreference()

        displayTable(result)

        


    }else {
        fetch(urlArr[0][1])
        .then(res => res.json())
        .then(data => {

            //calls
            result.concat( getInfosOfACinema(data, urlArr[0][0], list) )
            urlArr.shift()
            fetchAll(urlArr, list)
            //calls



            console.log(list);


        })
        .catch(err=> console.log(err))
    }
}































//BUILDING FUNCTIONS
class FilmMaker {
    //create an object for each film containing multiple keys like : title, genre, director, etc
    constructor (title, rating, synopsis, showtime, poster='', genre, releaseDate, director, runtime, cinema) {
        this.title=title
        this.rating=rating
        this.synopsis=synopsis
        this.showtime=showtime
        //this.vovf=vovf
        this.poster=poster
        this.genre=genre
        this.releaseDate=releaseDate
        this.director=director
        this.runtime=runtime
        this.cinema=cinema
    }
}


function getInfosOfACinema(data, cinema, totalList) {
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


        totalList.push(new FilmMaker(title, rating,  synopsis, showtimes, poster, genre, releaseDate, director, runtime, cinema))

        listToReturn.push(new FilmMaker(title, rating,  synopsis, showtimes, poster, genre, releaseDate, director, runtime, cinema))

    }

    return listToReturn
    
}
























//==========================================================================
//SORTING FUNCTIONS
function getFilmsAfter2020(arrOfFilmObject) {
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

// console.log(workingArr);
// console.log(getFilmsAfter2020(workingArr));

function getFilmsBefore2020(arrOfFilmObject) {
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

//console.log(getFilmsBefore2020(workingArr))

function getFilmsWithARatingGreaterThan(arrOfFilmObject, rating) {
    if(rating>=0 && rating<=5) {
        return arrOfFilmObject.filter( elem => elem.rating>rating)
    }
}

// console.log(workingArr);
// console.log(getFilmsWithARatingGreaterThan(workingArr, 3));

function getFilmsAfterAGivenTime(arrOfFilmObject, time) {
    let result=[]

    for(let i=0 ; i<arrOfFilmObject.length ; i++) {

    }

    let limit = new Date(result[j].showtimes.original[k].startsAt || result[j].showtimes.multiple[k].startsAt)
}



























//DISPLAY FUNCTION

function displayHeader(day) {
    let header
    day = Number(day)
    switch (day) {
        case 0:
            header="Today's Films"
            break;
    
        case 1:
            header="Tomorrow's Films"
            break;

        default:
            header="J+"+day+"s' Films"
            break;
    }

    //Which day Cell / Title
    let headerRow=document.createElement('tr')
    let th=document.createElement('th')
    th.colSpan='2'
    th.innerText=header
    headerRow.appendChild(th)
    document.querySelector('thead').appendChild(headerRow)
}

function displayTable(arrOfFilmObject) {

    //Films Cell
    for(let i=0 ; i<arrOfFilmObject.length ; i++) {

        let filmUrl=arrOfFilmObject[i].title.split(' ').join('%20')
        filmUrl='https://google.com/search?q='+filmUrl+' horaires'

        createARow(arrOfFilmObject[i].poster , arrOfFilmObject[i].title, filmUrl)
    }



    function createARow(posterURL, title, filmUrl) {
        //create a row with given infos
        let row = document.createElement('tr')

        //Poster cell
        let posterCell= document.createElement('td')
        let linkPosterCell = document.createElement('a')
        posterCell.classList.add('poster')
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
        let linkTitleCell = document.createElement('a')
        linkTitleCell.href = filmUrl
        linkTitleCell.target = '_blank'
        linkTitleCell.innerText = title
        let titleText = document.createElement('h2')
        titleText.appendChild(linkTitleCell) // <h2> <a href=filmurl> title </a> </h2>
        titleCell.appendChild(titleText) //td h2 a /h2 /td

        row.appendChild(titleCell) //tr td tr

        document.querySelector('tbody').appendChild(row)
    }
}






























//GET INFOS FROM THE DOM
function getDay() {
    let day = document.querySelector('#day-select').value
    return day
}

function getPreference() {
    //return an array of preference [era, earliestFilmTime]
    //where era=both, after2020 or before2020
    //where earliestFilmTime = all, 18:00, 22:00 etc
    //where rating = number between [0,5]

    let era=getEra()
    let earliestFilmTime=getEarliestFilm()

    return [era, earliestFilmTime, rating]

}

function getEra() {
    let era = document.querySelector('#era-select').value
    return era
}

function getEarliestFilm() {
    let time = document.querySelector('#time-input').value
    if(time==='all') {
        return 'all'
    }else {
        time=time.split(':')

        if( Number(time[0])<=24 && Number(time[0])>=0 && Number(time[1])<=60 && Number(time[1])>=0) {
            return time.join(':')
        }
        else {
            return 'all'
        }
    }
}

function getRating() {
    let rating=Number(document.querySelector('#rating-input').value)
    if(rating<=0) {
        rating=0
    }else if(rating>=5){
        rating=5
    }
    return rating
}