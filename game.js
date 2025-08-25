const mreza = document.getElementById('mreza');
let pokretanjeInterval = null; // interval za pojavljivanje
let bodoviInterval = null;
const HS_KEY = "highscore";

const dobarZvuk = document.getElementById("dobarZvuk");
const losZvuk = document.getElementById("losZvuk");
const klikZvuk = document.getElementById("klikZvuk");
const bonusZvuk = document.getElementById("bonusZvuk")
const gameOverZvuk = document.getElementById("game-over-zvuk");

function playGood() {
  dobarZvuk.currentTime = 0;
  dobarZvuk.play();
}

function playBad() {
  losZvuk.currentTime = 0.6;
  losZvuk.play();
}

function playBonus(){
  bonusZvuk.currentTime=0;
  bonusZvuk.play();
}

function playKlik(){
  klikZvuk.currentTime = 0;
  klikZvuk.play();
}

const pozadinaMuzika = document.getElementById('igra-muzika');
if (pozadinaMuzika) pozadinaMuzika.volume = 0.15;

function startMuzika(){
  if (!pozadinaMuzika) return; 
  setTimeout(()=>{
      pozadinaMuzika.currentTime = 0; 
      pozadinaMuzika.play(); 
  }, 500)
}
function zaustaviMuziku(){
  if (!pozadinaMuzika) return;
  pozadinaMuzika.pause();
}


function napraviGrid(velicina) {
  mreza.innerHTML = "";
  mreza.style.gridTemplateColumns = `repeat(${velicina}, 1fr)`;

  for (let i = 0; i < velicina * velicina; i++) {
    const polje = document.createElement("div");
    // polje.textContent = i + 1;
    mreza.appendChild(polje);
  }
}

// odmah napravimo 4x4 grid pri ucitavanju stranice
document.addEventListener("DOMContentLoaded", function () {
  napraviGrid(4);
});



let score = 0;
let preostaloVrijeme = 30;
const tajmer = document.getElementById('timer');
const bodovi = document.getElementById('bodovi');
const startDugme = document.getElementById('startDugme');
let timerId = null;
let igraUToku = false;

const slike = [
  {src: "img/zavrsni.png", score: 20, tip: "zavrsni"},
  {src: "img/projekat.png", score: 10, tip: "projekat"}, 
  {src: "img/test.png", score: 5, tip: "test"},
  {src: "img/bonus1.png", score: 50, tip: "bonus50"},
  {src: "img/pad1.png", score: -30, tip: "pad30"},
  {src: "img/pad2.png", tip: "pad0"},
  {src: "img/bonus2.png", sekunde: 5, tip: "bonusv"}
]

let bonusBrojac = { "bonus50": 0, "bonusv": 0};

function azurirajPrikaz() {
  tajmer.textContent = `Timer: ${preostaloVrijeme}s`;
  bodovi.textContent = `Score: ${score}`;
}

startDugme.addEventListener("click", ()=>{
  playKlik();
})


const bodoviAnimacija = document.getElementById('bodovi-animacija');
function prikaziBodove(tekst){
  if(bodoviInterval){
    clearTimeout(bodoviInterval)
    bodoviInterval=null;
  }

  bodoviAnimacija.textContent= tekst;
  bodoviAnimacija.style.fontSize="4rem";
  bodoviAnimacija.style.opacity = "1";
  bodoviAnimacija.style.transform = "translateY(0)";

  bodoviInterval = setTimeout(()=>{
    bodoviAnimacija.style.opacity = '0';
    bodoviAnimacija.style.fontSize="2rem";
    bodoviAnimacija.style.animation="neonBlue 1s infinite alternate ease-in";
    bodoviAnimacija.style.transform = 'translateY(-12px)';
    bodoviInterval=null;
  }, 450);
}


function zapocniIgru() {
  if (igraUToku) return;
  pozadinaMuzika.volume=0.15;

  if(muzikaUkljucena)
    startMuzika();

  if (pokretanjeInterval) {
    clearInterval(pokretanjeInterval);
    pokretanjeInterval = null;
  }

  setTimeout(()=>{
    bodoviAnimacija.style.opacity = '0';
    bodoviAnimacija.style.transform = 'translateY(-12px)';
  }, 450);

  score = 0;
  preostaloVrijeme = 30;
  azurirajPrikaz();
  bonusBrojac={ "bonus50": 0, "bonusv": 0};

  igraUToku = true;
  startDugme.disabled = true;
  startDugme.style.backgroundColor = "#9d4e75f1";
  startDugme.style.border = "4px solid rgba(100, 69, 85, 0.7)"

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  timerId = setInterval(() => {
    preostaloVrijeme--;
    azurirajPrikaz();

    if (preostaloVrijeme <= 0) {
      clearInterval(timerId);
      timerId = null;

      if (pokretanjeInterval) {
        clearInterval(pokretanjeInterval);
        pokretanjeInterval = null;
      }
      mreza.querySelectorAll('div').forEach(p => {
        p.innerHTML = "";
        p.onclick = null;
      });

      igraUToku = false;
      startDugme.disabled = false;

      if (bodoviInterval) {    
        clearTimeout(bodoviInterval); 
        bodoviInterval = null; 
      }
      startDugme.style.backgroundColor="#dc3086f1";
      startDugme.style.border="4px solid rgba(141, 41, 91, 0.7)"
      bodoviAnimacija.style.opacity="1";
      bodoviAnimacija.style.fontSize="2rem";
      bodoviAnimacija.textContent = `Game over! Score: ${score}`;
      
      if(muzikaUkljucena){
        zaustaviMuziku();
        gameOverZvuk.play();
      }


      let stariHS = localStorage.getItem(HS_KEY);
      stariHS=parseInt(stariHS);

      if(isNaN(stariHS)){
        stariHS=0;
       }

      if(score>stariHS){
        localStorage.setItem(HS_KEY, score.toString())
        bodoviAnimacija.innerHTML+=`<br>New high score!`
      }

      score=0;
      preostaloVrijeme=30;
      azurirajPrikaz();
          
    }
    
  }, 1000);

  // pokretanje slika
  pokretanjeInterval = setInterval(pojavljivanjeSlike, 800);

}





function pojavljivanjeSlike() {
  const polja = mreza.querySelectorAll("div");

  let randomPolje = null;
  while(true){
    randomPolje = polja[Math.floor(Math.random() * polja.length)];
    if(randomPolje.innerHTML!="")
      continue;
    break;
  }

  //ovdje moramo ograniciti. moramo brojati pojavljivanja bonusa, slike tipa bonus50 i bonusv na 2 puta
  let randomSlika = null;

  while(true) {
    randomSlika = slike[Math.floor(Math.random() * slike.length)];
    if(randomSlika.tip === "bonus50"){
      bonusBrojac.bonus50++;
      if(bonusBrojac.bonus50>2)
        continue;
    }
    if(randomSlika.tip === "bonusv"){
      bonusBrojac.bonusv++;
      if(bonusBrojac.bonusv>2)
        continue
    }
    break;
  }

  const slika = document.createElement("img");
  slika.src = randomSlika.src;
  slika.style.width = "100%";
  slika.style.height = "100%";
  slika.style.objectFit = "contain";
  randomPolje.appendChild(slika);

  //koristimo onclick da mozemo krostiti this
  randomPolje.onclick = function () {
    if (!igraUToku) return;
    if (!this.querySelector('img')) return;   //ako je istekla slika

    if(randomSlika.tip === "zavrsni" || randomSlika.tip==="projekat" 
      || randomSlika.tip === "test"){
        score+=randomSlika.score;
        prikaziBodove(`+${randomSlika.score}`);
        bodoviAnimacija.style.animation="neonBlue 1s infinite alternate ease-in";
        if(zvukUkljucen)
          playGood();
    }
    else if(randomSlika.tip === "pad0"){
      score=0;
      prikaziBodove("RESET");
      bodoviAnimacija.style.animation="neonRed 1s infinite alternate ease-in";
      if(zvukUkljucen)
        playBad();
    }
    else if(randomSlika.tip==="pad30"){
      score+=randomSlika.score;
      prikaziBodove(`${randomSlika.score}`);
      bodoviAnimacija.style.animation="neonRed 1s infinite alternate ease-in";
      if(zvukUkljucen)
        playBad();
    }
    else if(randomSlika.tip === "bonus50"){
      score+=randomSlika.score;
      prikaziBodove(`+${randomSlika.score}`);
      bodoviAnimacija.style.animation="neonBlue 1s infinite alternate ease-in";
      if(zvukUkljucen)
        playBonus();
    }
    else if(randomSlika.tip === "bonusv"){
      preostaloVrijeme+=randomSlika.sekunde;
      prikaziBodove(`+${randomSlika.sekunde}s`);
      bodoviAnimacija.style.animation="neonBlue 1s infinite alternate ease-in";
      if(zvukUkljucen)
        playBonus();
    }

    azurirajPrikaz();
    this.innerHTML = "";
    this.onclick = null;

  };

  setTimeout(() => {
    randomPolje.innerHTML = "";
    randomPolje.onclick = null;
  }, 500 + Math.random() * 1000);
}





/**/
const menuIkona = document.getElementById("menuIkona");
const overlay = document.getElementById("overlay")
menuIkona.addEventListener("click", ()=>{
  overlay.style.display="flex";
})

function popupZatvori() {
  overlay.style.display="none";
}

let muzikaUkljucena = true;
let zvukUkljucen = true;
const soundToggle = document.getElementById("soundToggle");
const musicToggle = document.getElementById("musicToggle");

soundToggle.addEventListener("click", function () {
  zvukUkljucen=!zvukUkljucen;
  if(zvukUkljucen){
    this.textContent="Sound: ON"
  }
  else{
    this.textContent="Sound: OFF"
  }
})

musicToggle.addEventListener("click", function () {
  muzikaUkljucena=!muzikaUkljucena;
  
  if (muzikaUkljucena) {
    if (igraUToku) startMuzika();
    this.textContent="Music: ON"
  } else {
    zaustaviMuziku();
    this.textContent="Music: OFF"
  }
})