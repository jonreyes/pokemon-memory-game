// External Confetti Library
// MIT License
// @author mathusummut

var confetti = {
	maxCount: 150,		//set max confetti count
	speed: 2,			//set the particle animation speed
	frameInterval: 15,	//the confetti animation frame interval in milliseconds
	alpha: 1.0,			//the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
	gradient: false,	//whether to use gradients for the confetti particles
	start: null,		//call to start confetti animation (with optional timeout in milliseconds, and optional min and max random confetti count)
	stop: null,			//call to stop adding confetti
	toggle: null,		//call to start or stop the confetti animation depending on whether it's already running
	pause: null,		//call to freeze confetti animation
	resume: null,		//call to unfreeze confetti animation
	togglePause: null,	//call to toggle whether the confetti animation is paused
	remove: null,		//call to stop the confetti animation and remove all confetti immediately
	isPaused: null,		//call and returns true or false depending on whether the confetti animation is paused
	isRunning: null		//call and returns true or false depending on whether the animation is running
};

(function() {
	confetti.start = startConfetti;
	confetti.stop = stopConfetti;
	confetti.toggle = toggleConfetti;
	confetti.pause = pauseConfetti;
	confetti.resume = resumeConfetti;
	confetti.togglePause = toggleConfettiPause;
	confetti.isPaused = isConfettiPaused;
	confetti.remove = removeConfetti;
	confetti.isRunning = isConfettiRunning;
	var supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
	var colors = ["rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,", "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,", "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"];
	var streamingConfetti = false;
	var animationTimer = null;
	var pause = false;
	var lastFrameTime = Date.now();
	var particles = [];
	var waveAngle = 0;
	var context = null;

	function resetParticle(particle, width, height) {
		particle.color = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.color2 = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.x = Math.random() * width;
		particle.y = Math.random() * height - height;
		particle.diameter = Math.random() * 10 + 5;
		particle.tilt = Math.random() * 10 - 10;
		particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
		particle.tiltAngle = Math.random() * Math.PI;
		return particle;
	}

	function toggleConfettiPause() {
		if (pause)
			resumeConfetti();
		else
			pauseConfetti();
	}

	function isConfettiPaused() {
		return pause;
	}

	function pauseConfetti() {
		pause = true;
	}

	function resumeConfetti() {
		pause = false;
		runAnimation();
	}

	function runAnimation() {
		if (pause)
			return;
		else if (particles.length === 0) {
			context.clearRect(0, 0, window.innerWidth, window.innerHeight);
			animationTimer = null;
		} else {
			var now = Date.now();
			var delta = now - lastFrameTime;
			if (!supportsAnimationFrame || delta > confetti.frameInterval) {
				context.clearRect(0, 0, window.innerWidth, window.innerHeight);
				updateParticles();
				drawParticles(context);
				lastFrameTime = now - (delta % confetti.frameInterval);
			}
			animationTimer = requestAnimationFrame(runAnimation);
		}
	}

	function startConfetti(timeout, min, max) {
		var width = window.innerWidth;
		var height = window.innerHeight;
		window.requestAnimationFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback) {
					return window.setTimeout(callback, confetti.frameInterval);
				};
		})();
		var canvas = document.getElementById("confetti-canvas");
		if (canvas === null) {
			canvas = document.createElement("canvas");
			canvas.setAttribute("id", "confetti-canvas");
			canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
			document.body.prepend(canvas);
			canvas.width = width;
			canvas.height = height;
			window.addEventListener("resize", function() {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}, true);
			context = canvas.getContext("2d");
		} else if (context === null)
			context = canvas.getContext("2d");
		var count = confetti.maxCount;
		if (min) {
			if (max) {
				if (min == max)
					count = particles.length + max;
				else {
					if (min > max) {
						var temp = min;
						min = max;
						max = temp;
					}
					count = particles.length + ((Math.random() * (max - min) + min) | 0);
				}
			} else
				count = particles.length + min;
		} else if (max)
			count = particles.length + max;
		while (particles.length < count)
			particles.push(resetParticle({}, width, height));
		streamingConfetti = true;
		pause = false;
		runAnimation();
		if (timeout) {
			window.setTimeout(stopConfetti, timeout);
		}
	}

	function stopConfetti() {
		streamingConfetti = false;
	}

	function removeConfetti() {
		stop();
		pause = false;
		particles = [];
	}

	function toggleConfetti() {
		if (streamingConfetti)
			stopConfetti();
		else
			startConfetti();
	}
	
	function isConfettiRunning() {
		return streamingConfetti;
	}

	function drawParticles(context) {
		var particle;
		var x, y, x2, y2;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			context.beginPath();
			context.lineWidth = particle.diameter;
			x2 = particle.x + particle.tilt;
			x = x2 + particle.diameter / 2;
			y2 = particle.y + particle.tilt + particle.diameter / 2;
			if (confetti.gradient) {
				var gradient = context.createLinearGradient(x, particle.y, x2, y2);
				gradient.addColorStop("0", particle.color);
				gradient.addColorStop("1.0", particle.color2);
				context.strokeStyle = gradient;
			} else
				context.strokeStyle = particle.color;
			context.moveTo(x, particle.y);
			context.lineTo(x2, y2);
			context.stroke();
		}
	}

	function updateParticles() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var particle;
		waveAngle += 0.01;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			if (!streamingConfetti && particle.y < -15)
				particle.y = height + 100;
			else {
				particle.tiltAngle += particle.tiltAngleIncrement;
				particle.x += Math.sin(waveAngle) - 0.5;
				particle.y += (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
				particle.tilt = Math.sin(particle.tiltAngle) * 15;
			}
			if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
				if (streamingConfetti && particles.length <= confetti.maxCount)
					resetParticle(particle, width, height);
				else {
					particles.splice(i, 1);
					i--;
				}
			}
		}
	}
})();
/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */
//Global Variables
var pattern = [];
var patternSize = 5;
var progress = 0; 
var musicPlaying = false;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;  //must be between 0.0 and 1.0
var guessCounter = 0;
var tryCounter = 3;
var timer = 3;
var maxTime = 3;
const clueHoldTime = 3000; //how long to hold each clue's light/sound
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence
const battleMusic = "https://www.youtube.com/embed/zqD2Zgyfh84";
const winFX = "https://www.youtube.com/embed/Ad204YupWhc";
const music = "https://cdn0.iconfinder.com/data/icons/audio-vol-1b/100/1-41-512.png";
const mute = "https://cdn3.iconfinder.com/data/icons/music-and-audio-1/26/music-audio-1022-512.png";
const bulbasaur = ['https://static.wikia.nocookie.net/pokemon/images/2/21/001Bulbasaur.png',"https://www.youtube.com/embed/cpW44V70NAE"];
const squirtle = ['https://static.wikia.nocookie.net/pokemon/images/3/39/007Squirtle.png',"https://www.youtube.com/embed/4CqM92OuQBo"];
const charmander = ['https://static.wikia.nocookie.net/pokemon/images/7/73/004Charmander.png',"https://www.youtube.com/embed/CxaNMS7JSvw"];
const pikachu = ['https://static.wikia.nocookie.net/pokemon/images/0/0d/025Pikachu.png',"https://www.youtube.com/embed/meNqshk8cRM"];
const eevee = ['https://static.wikia.nocookie.net/pokemon/images/e/e2/133Eevee.png',"https://www.youtube.com/embed/fzHr6ot9l4I"];
const pokeball = "https://lh3.googleusercontent.com/proxy/YXjwUngl2y8DoWGvLh_WwnFQTclqKcmVBhtBBYNcIEChKB_jOWgcqjAuouM3iohqgtPSIbbk9q3Jnu04Bb2viYdvMFPL9xP32DbQFkPjGVu4aVfSU3JN";
let pkmn = [bulbasaur,squirtle,charmander,pikachu,eevee];
let welcome = "Welcome to the game!";
let instruct = ["Repeat back the pattern.","Press the buttons."];
let start = document.getElementById("startBtn");
let stop = document.getElementById("stopBtn");
let a = document.getElementById("dx");
let b = document.getElementById("dy");
let c = document.getElementById("dz");
let fx = document.getElementById("music");
let gba = document.getElementById("gameButtonArea");

function setup(){
  updateAllPokemon();  
  setTimeout(()=>{
    typeText(a,welcome)
    setTimeout(()=>{
      typeText(b,instruct[1]);
      setTimeout(()=>{
        typeText(c,instruct[0]);
        setTimeout(()=>{
          if(!gamePlaying){
            start.classList.remove("hidden");
            start.classList.add("fade-in");
          }
          setTimeout(()=>{
            gba.classList.remove("hidden");
            gba.classList.add("fade-in");
          },1000)
        },1500);
      },1200);
    },1200);
  },1200)
  
}

setup();

function bgFx(){
  if(!musicPlaying){
    fx.src = music;
    fx.style.width = "50px";
    musicPlaying = true;
    startBattleMusic();
  } else{
    fx.src = mute;
    fx.style.width = "35px";
    musicPlaying = false;
    stopBattleMusic();
  }
}

function updatePokemon(i,r){
  let btn = document.getElementById("button"+i);
  if(r==0){
    btn.style.backgroundImage = `url(${pokeball})`;
    btn.style.backgroundSize = '200px 200px';
  } 
  if (r==1){
    btn.style.backgroundImage = `url(${pkmn[i-1][0]})`;
  }
}

function updateAllPokemon(){
    for(let i = 1; i <= pkmn.length; i++){
      let btn = document.getElementById("button"+i);
      (!gamePlaying)?updatePokemon(i,0):updatePokemon(i,1);
    } 
}

function updateProgress(){
  document.getElementById("progress").innerText = `Level ${progress+1}`;
}

function generateNewPattern(){
  let newPattern = []
  for(let i = 0; i<patternSize; i++){
    let randomTone = Math.floor(Math.random()*5)+1;
    newPattern.push(randomTone);
  }
  return newPattern;
}

function updateTimer(){
  setTimeout(function(){
    if(timer>0) document.getElementById("timer").innerText = "Timer: "+timer;
    else if (timer==0){
      document.getElementById("timer").innerText = "Timer: "+timer;
      var tryMessage = "Tries Left: "+tryCounter;
      alert("Time's Up! "+tryMessage);
    }
    timer--;
  },1000)
}

function playWinSound(){
  let win = document.getElementById("win");
  win.src = winFX+"?autoplay=1";
}

function startBattleMusic(){
  let battle = document.getElementById("battle");
  battle.src = battleMusic+"?autoplay=1";
}

function stopBattleMusic(){
  let battle = document.getElementById("battle");
  battle.src = "";
}

function typeText(element, text){
  let i = 0;
  setTimeout(function type(){
    if(i<text.length){
      element.innerHTML += (text[i]==" ")?"&nbsp;":text[i];
      setTimeout(type,50);
      i++;
    }
  },50);
}

function startGame(){
    confetti.stop();
    bgFx();
    fx.classList.remove("hidden");
    clearAllButtons();  
    //initialize game variables
    progress = 0;
    gamePlaying = true;
    tryCounter = 3;
    timer = maxTime;
    // new pattern
    pattern = generateNewPattern();
    // swap the Start and Stop buttons
    a.classList.add("hidden");
    b.classList.add("hidden");
    c.classList.add("hidden");
    start.classList.remove("fade-in");
    start.classList.add("hidden");
    stop.classList.remove("fade-in");
    stop.classList.remove("hidden");
    gba.classList.remove("fade-in");
    document.getElementById("progress").classList.remove("hidden");
    document.getElementById("timer").classList.remove("hidden");
    playClueSequence();
}

function stopGame(){
    gamePlaying = false;
    bgFx();
    fx.classList.add("hidden");
    updateAllPokemon();
    // swap the Start and Stop buttons
    start.classList.remove("fade-in");
    start.classList.remove("hidden");
    stop.classList.add("hidden");
    document.getElementById("timer").classList.add("hidden");
    clearAllButtons();   
    document.getElementById("progress").classList.add("hidden");
}

document.body.onkeyup = function(e){
  let i = e.keyCode-96;
  if(e.keyCode==32) (gamePlaying)?stopGame():startGame();
}

document.body.onkeydown = function(e){
  let i = e.keyCode-96;
  let btn = document.getElementById("button"+i);
  if(e.keyCode>=97){
    guess(i);
  }
}

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
  updatePokemon(btn,1);
}

function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
  updatePokemon(btn,0);
}

function clearAllButtons(){
  for(let i = 0; i < pkmn.length; i++){
      clearButton(i+1);
  }
}

function playSingleClue(btn){
  lightButton(btn);
  playTone(btn,clueHoldTime);
  setTimeout(clearButton,clueHoldTime,btn);
}
     
function playClueSequence(){
  updateProgress();
  guessCounter = 0;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime; 
    delay += cluePauseTime;
    delay -= i*100;
  }
}

function guess(btn){
  console.log("user guessed: " + btn);
  playSingleClue(btn);
  if(!gamePlaying){
    return;
  }
  // add game logic from docs
   if(pattern[guessCounter] == btn){
    //Guess was correct!
    if(guessCounter == progress){
      if(progress == pattern.length - 1){
        //GAME OVER: WIN!
        stopTone(btn);
        confetti.start();
        winGame();
        playWinSound();
      }else{
        //Pattern correct. Add next segment
        progress++;
        updateProgress();
        playClueSequence();
      }
    }else{
      //so far so good... check the next guess
      guessCounter++;
    }
  }else{
    //Guess was incorrect
    //GAME OVER: LOSE!
    if(tryCounter>0){
      tryCounter--;
      var tryMessage = "Tries Left: "+tryCounter;
      if(timer>0) alert("Wrong Button! "+tryMessage);
    }
    playClueSequence();
    if(tryCounter==0) loseGame();
    guessCounter++;
  }
  stopTone(btn);
}

function loseGame(){
  stopGame();
  alert("Game Over. You lost.");
}

function winGame(){
  stopGame();
  alert("Game Over. You won.");
}

// Sound Synthesis Functions
const freqMap = {
  1: 300,
  2: 350,
  3: 400,
  4: 450,
  5: 500
}

function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  // g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  document.getElementById("video"+btn).src = pkmn[btn-1][1]+"?autoplay=1";
  tonePlaying = true
  setTimeout(function(){
    stopTone(btn)
  },len)
}

function startTone(btn){
  if(!tonePlaying){
    o.frequency.value = freqMap[btn]
    //g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    document.getElementById("video"+btn).src = pkmn[btn-1][1]+"?autoplay=1";
    tonePlaying = true
  }
}

function stopTone(btn){
    document.getElementById("video"+btn).src = "";
    // g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
    clearButton(btn);
    tonePlaying = false
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)
