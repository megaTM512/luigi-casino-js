var symbols = ["Cloud", "Shroom", "FireFlower", "Luigi", "Mario", "Star"];
var coinCount = 10;
var bettedCoins = 1;
var timesWon = 0;
var mute = true;

var playerHand = [];
var cardsToTrade = [false, false, false, false, false];
var swapCards = false;
var enemyHand = [];

var gamestate = "playerPhase";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
startNewRound();

function startNewRound(){
  playerHand = [];
  enemyHand = [];
  cardsToTrade = [false, false, false, false, false];
  $("#winText").css("opacity", "0%")
  $("#coinGainText").css("opacity", "0%")
  $(".coinInput").attr("max",""+clamp(coinCount,0,5));
  updateCenterButton();
  var enemyCards = $(".enemyBoard .card .cardImg");
  enemyCards.fadeOut(200);

  setTimeout(function() {
    for (var i = 0; i < 5; i++) {
      enemyCards.eq(i).attr("src", "img/cards/CardBack.png");
    }
  }, 200);
  enemyCards.fadeIn(100);

  gamestate = "playerPhase";
  $(".coinInput").prop('disabled', false);
  $(".centerButton").css("opacity", "100%");

  getNewCards();
}


function randomCard() {
  return symbols[Math.floor(Math.random() * 6)];
}

function getNewCards() {
  for (var i = 0; i < 5; i++) {
    playerHand.push(randomCard());
    enemyHand.push(randomCard());
  }
  revealOwnCards();
}

function revealOwnCards() {
  var ownCards = $(".ownedBoard .card .cardImg");
  ownCards.fadeOut(200);
  if(!mute){  //Sound
    var cardShuffle = new Audio("sfx/cardShuffle.mp3");
    cardShuffle.play();
  }
  setTimeout(function() {
    for (var i = 0; i < 5; i++) {
      ownCards.eq(i).attr("src", "img/cards/" + playerHand[i] + "Card.png");
    }
  }, 200);
  ownCards.fadeIn(100);
}

function revealEnemyCards() {
  var enemyCards = $(".enemyBoard .card .cardImg");
  enemyCards.fadeOut(200);
  setTimeout(function() {
    for (var i = 0; i < 5; i++) {
      enemyCards.eq(i).attr("src", "img/cards/" + enemyHand[i] + "Card.png");
    }
  }, 200);
  enemyCards.fadeIn(100);
}

function swapDiscardedCards() {
  var ownCards = $(".ownedBoard .card .cardImg");
  for (var i = 0; i < 5; i++) {
    if (cardsToTrade[i]) {
      playerHand[i] = randomCard();
      ownCards.eq(i).fadeOut(200);
        ownCards.eq(i).animate({
          top: "0px"
        }, 100)}
  }

  setTimeout(function() {
    for (var i = 0; i < 5; i++) {
      if (cardsToTrade[i]) {
        ownCards.eq(i).attr("src", "img/cards/" + playerHand[i] + "Card.png");
      }
    }
  }, 200);

  for (var i = 0; i < 5; i++) {
    if (cardsToTrade[i]) {
      ownCards.eq(i).fadeIn(100);
    }
  }
}

$(".ownedBoard .card .cardImg").click(function(e) { //BEI KLICK AUF DER KARTE
  if (gamestate === "playerPhase") {
    console.log(e);
    var currentCard = e.target;
    cardsToTrade[parseInt(currentCard.id.slice(1, 2)) - 1] = !cardsToTrade[parseInt(currentCard.id.slice(1, 2)) - 1]; //Nehme die Nummer der ID, und ändere den Wert in der Trade Liste.
    animateCard(e, cardsToTrade[parseInt(currentCard.id.slice(1, 2)) - 1])
    if(!mute){  //Sound
      var bwoop = new Audio("sfx/bwoop.mp3");
      bwoop.play();
    }
  }
});

function animateCard(event, value) { //Animiert die Karte nach oben oder nach unten, je nachdem wo die Karte ist!
  if (value) {
    $(event.target).animate({
      top: "-30px"
    }, 100)
  } else {
    $(event.target).animate({
      top: "0"
    }, 100)
  }
}

$(document).click(function() {
  updateCenterButton();
})

function updateCenterButton(){
  if (cardsToTrade.includes(true)) {
    $(".centerButton img").attr("src", "img/button_swap.png");
    swapCards = true;
  } else {
    $(".centerButton img").attr("src", "img/button_hold.png")
    swapCards = false;
  }
}


$(".centerButton").click(function() { //Klick auf Hauptknopf, Quasi die Spielelogik
  if(!mute){  //Sound
    var ding = new Audio("sfx/ding.mp3");
    ding.play();
  }
  gamestate = "trading";
  $(".coinInput").prop('disabled', true);
  bettedCoins = parseInt($(".coinInput").val());
  $(".centerButton").css("opacity", "0%");
  if (swapCards) {
    swapDiscardedCards();
  }
  setTimeout(function () {
    revealEnemyCards();
    if(!mute){  //Sound
      var cardShuffle = new Audio("sfx/cardShuffle.mp3");
      cardShuffle.play();
    }
  }, 300);
  setTimeout(function () {
    var playerHandVector = handToVector(playerHand);
    var enemyHandVector = handToVector(enemyHand);
    evaluateHandValues(new HandValue(playerHandVector), new HandValue(enemyHandVector));
    $("#winText").css("opacity", "100%");
    $("#coinGainText").css("opacity", "100%");
  }, 600);
  setTimeout(function () {
    startNewRound();
  }, 3000);

})

//---------------------HAND OBJEKTE UND ALLES DRUM UND DRAN--------------------

function handToVector(hand){
  var finalVector = [0,0,0,0,0,0];
  for (var i = 0; i < symbols.length; i++) {
    var currentSymbol = symbols[i];
    for (var j = 0; j < hand.length; j++) {
      if(currentSymbol===hand[j]) finalVector[i]++;
    }
  }
  return finalVector;
}

function HandValue(handVector){ //HAND OBJEKT
  console.log(handVector);
  sortedVector = handVector.slice();
  sortedVector.sort(function(a, b){return b - a});
  this.highNo1 = sortedVector[0];
  this.highNo2 = sortedVector[1];
  this.highCard1 = handVector.lastIndexOf(sortedVector[0]);
  if(this.highNo2 != this.highNo1) this.highCard2 = handVector.lastIndexOf(sortedVector[1]);
  else this.highCard2 = handVector.indexOf(sortedVector[1]);
  this.highCard3 = handVector.lastIndexOf(sortedVector[1]-1);
}

function evaluateHandValues(p,e){
  console.log(p);
  console.log(e);
  if(p.highNo1 > e.highNo1) win(p);
  else if(p.highNo1 < e.highNo1) lose();
  else if(p.highNo2 > e.highNo2) win(p);
  else if(p.highNo2 < e.highNo2) lose();
  else if(p.highCard1 > e.highCard1) win(p);
  else if(p.highCard1 < e.highCard1) lose();
  else if(p.highCard2 > e.highCard2) win(p);
  else if(p.highCard2 < e.highCard2) lose();
  else win();
}

//--------------------------------------Game State-----------------------------
function win(hand){
  var wonCoins;
  if(hand.highNo1 === 5) wonCoins = 16*bettedCoins;
  else if(hand.highNo1 === 4) wonCoins = 8*bettedCoins;
  else if(hand.highNo1 === 3 && hand.highNo2 === 2) wonCoins = 6*bettedCoins;
  else if(hand.highNo1 === 3) wonCoins = 4*bettedCoins;
  else if(hand.highNo1 === 2 && hand.highNo2 === 2) wonCoins = 3*bettedCoins;
  else if(hand.highNo1 === 2) wonCoins = 2*bettedCoins;
  else if(hand.highNo1 === 1) wonCoins = bettedCoins;
  $("#winText").text("You win!");
  $("#coinGainText").text("+" + wonCoins);
  coinCount = coinCount + wonCoins;
  timesWon++;
  updateCoins();
}

function lose(){
  coinCount = coinCount - bettedCoins;
  if(coinCount <= 0){
    exit();
    return;
  }
  $("#winText").text("You lose!");
  $("#coinGainText").text("-"+bettedCoins);
  timesWon = clamp(timesWon-1,0,Infinity);
  updateCoins();
}

function updateCoins(){
  $("#coinCount").text(coinCount);
  $("#starCount").text(timesWon);
}
//--------------------------------------AUDIO----------------------------------
var audio = new Audio("LuigisCasino.mp3");
audio.loop = true;
var button = $(".musicButton");
var icon = $("i.fas");

button.click(function() {
  if (audio.paused) {
    audio.volume = 0.2;
    audio.play();
    icon.addClass('fa-volume-up');
    icon.removeClass('fa-volume-mute');
    mute = false;

  } else {
    audio.pause();
    icon.addClass('fa-volume-mute');
    icon.removeClass('fa-volume-up');
    mute = true;
  }
});
