let field = document.getElementById('field');
let snakeHead = document.createElement('div');
let currentScore = document.getElementById('current-score');
let bestScore = document.getElementById('best-score');
let currentScoreVal = 0;
let previousScoreVal = 0;
let bestScoreVal = 0;
const prize = 10;
const scoreSpeedStep = prize;
const timeSpeedStep = 2;
const fieldIncrease = 2;
let fieldSize = parseInt( getComputedStyle(document.documentElement).getPropertyValue('--field-size') );
const themeDarkColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-secondary-dark-color');
const themeLightColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-secondary-light-color');
const snakeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-light-color');
const foodColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-dark-color');
const tSizeBiglogo = getComputedStyle(document.documentElement).getPropertyValue('--text-size-biglogo');
const tSizeHeader = getComputedStyle(document.documentElement).getPropertyValue('--text-size-header');
const tSizeText = getComputedStyle(document.documentElement).getPropertyValue('--text-size-text');
const fontText = getComputedStyle(document.documentElement).getPropertyValue('--font-text');
const fontHeaders = getComputedStyle(document.documentElement).getPropertyValue('--font-headers');
const snakeStartingPos = [Math.floor(fieldSize/2), Math.floor(fieldSize/2)];
const defaultFrameDelayMs = 400;
const snakeTail = [];
const snakeTailCoords = [];
let pleaseStop;
let snakePosX = snakeStartingPos[0];
let snakePosY = snakeStartingPos[1];
let snakeVelocity = 1;
let snakeLightDecrease = 2;
let lastFrameTimeMs = 0; // The last time the loop was run
let frameDelayMs = defaultFrameDelayMs;
let lastDirection = "none";
let lastDirectionPrev;
let prepausedState = "unsetted";
let gameState = "unpaused";
let isStarted = false;

let hslString = (h,s,l) => {
  let result = "hsl(" + h + ", " + s + "%, " + l + "%)";
  return result;
};
let extractHslValue = (string, hORsORl) => {
  let h, s, l;
  h = parseInt(   string.substring(  string.indexOf("(")+1 , string.indexOf(",")  )   );
  s = parseInt(   string.substring(  string.indexOf(",")+1 , string.indexOf("%")  )   );
  l = parseInt(   string.substring(  string.lastIndexOf(",")+1 , string.lastIndexOf("%")  )   );
  switch (hORsORl) {
    case 'h': return h; break;
    case 's': return s; break;
    case 'l': return l; break;
  };
};
let initialize = () => {
  currentScoreVal = 0;
  currentScore.innerHTML = currentScoreVal;
  snakeHead.style.backgroundColor = hslString(extractHslValue(snakeColor,'h'), extractHslValue(snakeColor,'s'), extractHslValue(snakeColor,'l'));
  snakeHead.style.gridArea = snakeStartingPos[1] + ' / ' + snakeStartingPos[0] + ' / ' + (snakeStartingPos[1]+1) + ' / ' + (snakeStartingPos[0]+1);
  field.appendChild(snakeHead);
  snakeTailCoords.push([snakeStartingPos[0]+1, snakeStartingPos[1]]);
  snakeTail.push(document.createElement('div'));
  snakeTail[0].style.backgroundColor = hslString(extractHslValue(snakeColor,'h'), extractHslValue(snakeColor,'s'), (extractHslValue(snakeColor,'l') - snakeLightDecrease) );
  snakeTail[0].style.gridArea = snakeStartingPos[1] + ' / ' + (snakeStartingPos[0]+1) + ' / ' + (snakeStartingPos[1]+1) + ' / ' + (snakeStartingPos[0]+2);
  field.appendChild(snakeTail[0]);
  snakePosX = snakeStartingPos[0];
  snakePosY = snakeStartingPos[1];
  lastDirection = "left";
  generateFood();
  requestAnimationFrame(mainLoop);
};
let clearField = () => {
  lastDirection = "none";
  //cancelAnimationFrame(pleaseStop);
  frameDelayMs = defaultFrameDelayMs;
  removeFood();
  for (let i=0; i < snakeTail.length; i++) { // removing divs away from the field
    document.getElementById('field').removeChild(snakeTail[i]);
  };
  for (let i = snakeTail.length-1; i >= 0 ; i--) { // removing elements from tail array
    snakeTail.pop();
  };
  for (let i = snakeTailCoords.length-1; i >= 0 ; i--) { // removing elements from tail coordinates array
    snakeTailCoords.pop();
  };
  document.getElementById('field').removeChild(snakeHead);
};
let draw = () => {
  snakeHead.style.gridArea = snakePosY + ' / ' + snakePosX + ' / ' + (snakePosY+1) + ' / ' + (snakePosX+1);
  for (let i=0; i < snakeTail.length; i++) {
    snakeTail[i].style.gridArea = snakeTailCoords[i][1] + ' / ' + snakeTailCoords[i][0] + ' / ' + (snakeTailCoords[i][1]+1) + ' / ' + (snakeTailCoords[i][0]+1);
  };
};
let logKey = (key) => {  // here the game STARTS
  switch (key.code) {
    case "KeyW": lastDirection = "up"; break;
    case "KeyS": lastDirection = "down"; break;
    case "KeyA": lastDirection = "left"; break;
    case "KeyD": lastDirection = "right"; break;
    case "KeyX": addTail(); currentScoreVal+=prize; currentScore.innerHTML = currentScoreVal; break;
    case "KeyZ": increaseFieldSize(); break;
    case "Space": {
      if (!isStarted) { // here the game STARTS
        isStarted = true;
        removeStartLabel();
        initialize();
        break;
      } else if (gameState==="stop") {
        clearField();
        removeStopLabel();
        initialize();
        gameState = "unpaused";
        break;
      } else {
        lastDirection = "pause";
        break;
      };
    };
    default: break;
  }
};
let increaseFieldSize = () => {
  fieldSize+=fieldIncrease;
  document.documentElement.style.setProperty('--field-size', fieldSize);
};
let addTail = () => {
  snakeTailCoords.push(snakeTailCoords[snakeTailCoords.length-1]);
  // Taking the last tail's segment coordinates and copying them to new segment
  snakeTail.push(document.createElement('div'));
  snakeTail[snakeTail.length-1].style.backgroundColor = hslString(extractHslValue(snakeColor,'h'), extractHslValue(snakeColor,'s'), (extractHslValue(snakeColor,'l')-(snakeTail.length*snakeLightDecrease)-snakeLightDecrease) );
  field.appendChild(snakeTail[snakeTail.length-1]);
};
let generateFood = () => {
  let food = document.createElement('div');
  food.id = 'food';
  food.style.backgroundColor = foodColor;
  let randX = 1 + Math.floor(Math.random() * fieldSize);
  let randY = 1 + Math.floor(Math.random() * fieldSize);
  food.style.gridArea = randY + ' / ' + randX + ' / ' + (randY+1) + ' / ' + (randX+1);
  field.appendChild(food);
};
let removeFood = () => {
  let food = document.getElementById('food');
  document.getElementById('field').removeChild(food);
};
let addPauseLabel = () => {
  let pauseLabel = document.createElement('div');
  pauseLabel.id = "pause";
  pauseLabel.style.gridArea =  ' 1 / 1 / ' + (fieldSize+1) + ' / ' + (fieldSize+1) ;
  pauseLabel.style.fontSize = tSizeBiglogo;
  pauseLabel.style.backgroundColor = "rgba(255,255,255,0.2)";
  pauseLabel.style.fontFamily = fontHeaders;
  pauseLabel.style.textAlign = "center";
  pauseLabel.innerHTML = "Paused";
  pauseLabel.style.padding = "50% 0";
  field.appendChild(pauseLabel);
};
let removePauseLabel = () => {
  let pauseLabel = document.getElementById('pause');
  document.getElementById('field').removeChild(pauseLabel);
};
let addStopLabel = () => {
  let addStopLabel = document.createElement('div');
  addStopLabel.id = "stop";
  addStopLabel.style.gridArea =  ' 1 / 1 / ' + (fieldSize+1) + ' / ' + (fieldSize+1) ;
  addStopLabel.style.fontSize = tSizeBiglogo;
  addStopLabel.style.backgroundColor = "rgba(255,255,255,0.2)";
  addStopLabel.style.fontFamily = fontHeaders;
  addStopLabel.style.textAlign = "center";
  addStopLabel.innerHTML = "GAME OVER";
  addStopLabel.style.padding = "50% 0";
  field.appendChild(addStopLabel);
};
let removeStopLabel = () => {
  let stopLabel = document.getElementById('stop');
  document.getElementById('field').removeChild(stopLabel);
};
let addStartLabel = () => {
  let startLabel = document.createElement('div');
  let startLabelRules = document.createElement('table');
  let startLabelGo = document.createElement('div');
  const startLabelRulesStyleHeaders = "text-align: center; font-size: " + tSizeHeader + ";";
  const startLabelRulesStyleKeys = "text-align: center; background-color: white; padding: 1vmin; border: 1vmin outset gray; font-size: " + tSizeText + ";";

  startLabel.id = "start";
  startLabel.style.gridArea =  ' 1 / 1 / ' + (fieldSize+1) + ' / ' + (fieldSize+1) ;
  startLabel.style.backgroundColor = "transparent";
  startLabel.style.fontFamily = fontHeaders;

  startLabelRules.style.width = getComputedStyle(document.documentElement).getPropertyValue('--central-column-width');

  startLabelGo.style.width = getComputedStyle(document.documentElement).getPropertyValue('--central-column-width');
  startLabelGo.style.color = themeLightColor;
  startLabelGo.style.fontSize = tSizeHeader;
  startLabelGo.style.paddingTop = "10vmin";
  startLabelGo.style.textAlign = "center";
  startLabelGo.innerHTML = "Hit spacebar to start";

  let startLabelRulesTrHow = document.createElement('tr');
  let startLabelRulesTrMovePause = document.createElement('tr');
  let startLabelRulesTrWSpacebar = document.createElement('tr');
  let startLabelRulesTrASD = document.createElement('tr');

  let startLabelRulesTdHow = document.createElement('td');
  let startLabelRulesTdMove = document.createElement('td');
  let startLabelRulesTdPause = document.createElement('td');
  let startLabelRulesTdBlank1 = document.createElement('td');
  let startLabelRulesTdW = document.createElement('td');
  let startLabelRulesTdBlank2 = document.createElement('td');
  let startLabelRulesTdBlank3 = document.createElement('td');
  let startLabelRulesTdSpacebar = document.createElement('td');
  let startLabelRulesTdA = document.createElement('td');
  let startLabelRulesTdS = document.createElement('td');
  let startLabelRulesTdD = document.createElement('td');

  startLabelRules.appendChild(startLabelRulesTrHow);
  startLabelRules.appendChild(startLabelRulesTrMovePause);
  startLabelRules.appendChild(startLabelRulesTrWSpacebar);
  startLabelRules.appendChild(startLabelRulesTrASD);

  startLabelRulesTrHow.appendChild(startLabelRulesTdHow);

  startLabelRulesTrMovePause.appendChild(startLabelRulesTdMove);
  startLabelRulesTrMovePause.appendChild(startLabelRulesTdPause);

  startLabelRulesTrWSpacebar.appendChild(startLabelRulesTdBlank1);
  startLabelRulesTrWSpacebar.appendChild(startLabelRulesTdW);
  startLabelRulesTrWSpacebar.appendChild(startLabelRulesTdBlank2);
  startLabelRulesTrWSpacebar.appendChild(startLabelRulesTdBlank3);

  startLabelRulesTrASD.appendChild(startLabelRulesTdA);
  startLabelRulesTrASD.appendChild(startLabelRulesTdS);
  startLabelRulesTrASD.appendChild(startLabelRulesTdD);
  startLabelRulesTrASD.appendChild(startLabelRulesTdSpacebar);

  startLabelRulesTdHow.innerHTML = "How to play:";
  startLabelRulesTdMove.innerHTML = "Move";
  startLabelRulesTdPause.innerHTML = "Pause & Restart";
  startLabelRulesTdBlank1.innerHTML = "&nbsp;";
  startLabelRulesTdW.innerHTML = "W";
  startLabelRulesTdBlank2.innerHTML = "&nbsp;";
  startLabelRulesTdSpacebar.innerHTML = "Spacebar";
  startLabelRulesTdA.innerHTML = "A";
  startLabelRulesTdS.innerHTML = "S";
  startLabelRulesTdD.innerHTML = "D";

  startLabelRulesTdHow.colSpan = "6";
  startLabelRulesTdMove.colSpan = "3";
  startLabelRulesTdPause.colSpan = "3";
  startLabelRulesTdBlank3.colSpan = "3";
  startLabelRulesTdSpacebar.colSpan = "3";

  startLabelRulesTdHow.style = "color: " + themeLightColor + "; padding: 2vmin; background-color: " + themeDarkColor + "; " + startLabelRulesStyleHeaders;
  startLabelRulesTdMove.style = "color: " + themeDarkColor + "; padding: 2vmin; " + startLabelRulesStyleHeaders;
  startLabelRulesTdPause.style = "color: " + themeDarkColor + "; padding:  2vmin; " + startLabelRulesStyleHeaders;
  startLabelRulesTdW.style = startLabelRulesStyleKeys;
  startLabelRulesTdSpacebar.style = startLabelRulesStyleKeys;
  startLabelRulesTdA.style = startLabelRulesStyleKeys;
  startLabelRulesTdS.style = startLabelRulesStyleKeys;
  startLabelRulesTdD.style = startLabelRulesStyleKeys;



  startLabel.appendChild(startLabelRules);
  startLabel.appendChild(startLabelGo);
  field.appendChild(startLabel);
};
let removeStartLabel = () => {
  let startLabel = document.getElementById('start');
  document.getElementById('field').removeChild(startLabel);
};
let updateSnakeTaleCoords = (newX, newY) => {
  for (let i = snakeTailCoords.length-1; i > 0 ; i--) {
    snakeTailCoords[i] = snakeTailCoords[i-1];
  };
  snakeTailCoords[0] = [newX, newY];
};
let update = (direction) => { // Most of game logic is here
  switch (direction) {
      case "none": {
        lastDirection = "none";
        break;
      };
      case "pause": {
        if (gameState === "unpaused") {
          gameState = "paused";
          direction = "none";
          lastDirection = "none";
          prepausedState = lastDirectionPrev;
          addPauseLabel();
          break;
        } else if (gameState === "paused") {
          removePauseLabel();
          gameState = "unpaused";
          direction = prepausedState;
          lastDirection = prepausedState;
          prepausedState = "unsetted";
          break;
        };
      };
      case "up": {
        if (gameState === "paused") {
          direction = "none";
          lastDirection = "none";
          break;
        } else if (lastDirectionPrev === "down") {
          updateSnakeTaleCoords(snakePosX, snakePosY);
          snakePosY += snakeVelocity;
          direction = "down";
          lastDirection = "down";
          break;
        } else {
          updateSnakeTaleCoords(snakePosX, snakePosY);
          snakePosY -= snakeVelocity;
          break;
        };
      };
      case "down": {
        if (gameState === "paused") {
          direction = "none";
          lastDirection = "none";
          break;
        } else if (lastDirectionPrev === "up") {
          updateSnakeTaleCoords(snakePosX, snakePosY);
          snakePosY -= snakeVelocity;
          direction = "up";
          lastDirection = "up";
          break;
        } else {
          updateSnakeTaleCoords(snakePosX, snakePosY);
          snakePosY += snakeVelocity;
          break;
        };
      };
      case "left": {
        if (gameState === "paused") {
          direction = "none";
          lastDirection = "none";
          break;
        } else if (lastDirectionPrev === "right") {
          updateSnakeTaleCoords(snakePosX, snakePosY);
          snakePosX += snakeVelocity;
          direction = "right";
          lastDirection = "right";
          break;
        } else {
          updateSnakeTaleCoords(snakePosX, snakePosY);
          snakePosX -= snakeVelocity;
          break;
        };
      };
      case "right": {
        if (gameState === "paused") {
          direction = "none";
          lastDirection = "none";
          break;
        } else if (lastDirectionPrev === "left") {
          updateSnakeTaleCoords(snakePosX, snakePosY);
          snakePosX -= snakeVelocity;
          direction = "left";
          lastDirection = "left";
          break;
        } else {
          updateSnakeTaleCoords(snakePosX, snakePosY);
          snakePosX += snakeVelocity;
          break;
        };
      };
    };
  lastDirectionPrev = direction;
//  if (snakePosX > fieldSize || snakePosX < 1) reset(); // possible deadly edge scenario
//  if (snakePosY > fieldSize || snakePosY < 1) reset();
  { // checking if head reaches field edge
    if (snakePosX > fieldSize) snakePosX = 1;
    if (snakePosX < 1) snakePosX = fieldSize;
    if (snakePosY > fieldSize) snakePosY = 1;
    if (snakePosY < 1) snakePosY = fieldSize;
  }
  if (snakeHead.style.gridArea === document.getElementById('food').style.gridArea) { // checking if head gets the food
    currentScoreVal += prize;
    currentScore.innerHTML = currentScoreVal;
    addTail();
    removeFood();
    generateFood();
  };
  for (let i = snakeTailCoords.length-1; i > 0 ; i--) { // checking if head hits the tail
    if (snakeHead.style.gridArea === snakeTail[i].style.gridArea) {
      gameState = "stop";
    };
  };
  if ( (currentScoreVal - previousScoreVal) >= scoreSpeedStep ) { // increasing speed according to score
    frameDelayMs -= timeSpeedStep;
    previousScoreVal = currentScoreVal;
  };
};
let mainLoop = (timestamp) => {
  if (gameState === "stop") {
    addStopLabel();
    if (currentScoreVal > bestScoreVal) { // Updating Best Score
      bestScoreVal = currentScoreVal;
      bestScore.innerHTML = bestScoreVal;
    };
  } else {
    if (timestamp < lastFrameTimeMs + frameDelayMs) {
      requestAnimationFrame(mainLoop);
      return;
    };
    lastFrameTimeMs = timestamp;
    update(lastDirection);
    draw();
    requestAnimationFrame(mainLoop);
  };
};

addStartLabel();

document.addEventListener('keypress', logKey);
