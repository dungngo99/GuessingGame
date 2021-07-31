// Initialize all global variables
let records = []
let remainTimes = 10;
const TIMEOUT = 30;
let timeOut = TIMEOUT, t = null, timer_is_on = 0;
let randomNum = Math.floor(Math.random() * 100);
let rounds = [];

/*
Function to keep counting. setTimeout(timeCount, 1000) will keep call back timeCount() every 1 second forever until it reaches base case
*/
async function timeCount() {
  if (timeOut == -1) {
    await countDown(5, 'dn-announce', 'Game over. Game restarts in');
    reset('Failed');
    return;
  }
  document.getElementById('dn-remain-time').innerText = `Remaing time: ${timeOut}`;
  timeOut--;
  t = setTimeout(timeCount, 1000);
}

/*
Function to start the game
*/
function start() {
  document.getElementById('dn-guess-btn').disabled = false;
  document.getElementById('dn-reset-btn').disabled = false;
  if (!timer_is_on) {
    timer_is_on = 1;
    timeCount();
  }
}

/*
Function to stop the game
*/
function stop() {
  document.getElementById('dn-guess-btn').disabled = true;
  document.getElementById('dn-reset-btn').disabled = true;
  clearTimeout(t);
  timer_is_on = 0;
}

/*
Function to reset all variables that are used during each round a user plays
*/
function reset(result) {
  if (result === undefined){
    result = 'Failed';
  }
  //Store the value in the database
  let name = document.getElementById('dn-input-tex').value;
  round = { 'name': name, 'time': TIMEOUT - timeOut, 'result': result};
  rounds.push(round);

  //Reset all variables to default values
  records = [];
  remainTimes = 10;
  timeOut = TIMEOUT;
  check = 30;
  randomNum = Math.floor(Math.random() * 100);

  //Stop the timer
  stop();

  //Reset innerText value of tag elements to default values.
  document.getElementById('dn-remain-times').innerText = `Remaining guessing times: ${remainTimes}`;
  document.getElementById('dn-remain-time').innerText = `Remaining time: ${timeOut}`;
  document.getElementById('dn-announce').innerText = 'Start a new game!';
  document.getElementById('dn-records').innerHTML = '...';
  document.getElementById('dn-input-tex').value = '';
  document.getElementById('dn-input-num').value = '';
}

/*
Function to check the user's input with computer's actual value
*/
async function guess() {
  let userNum = parseInt(document.getElementById('dn-input-num').value); // Take in user input

  // Check whether the user's input is valid. If not, return immediately
  if (checkNum(userNum) == -1) {
    return;
  }
  // Update game's state. If not valid, return immediately
  if (updateGame(userNum) == -1) {
    return;
  }

  // Update the result to user interface
  if (userNum > randomNum) {
    document.getElementById('dn-announce').innerText = 'The value is too high. Guess a lower number';
  } else if (userNum < randomNum) {
    document.getElementById('dn-announce').innerText = 'The value is too low. Guess a higher number';
  } else {
    stop();
    await countDown(5, 'dn-announce', 'You are correct. Game restarts in');
    reset('Success'); //reset() has to wait until countDown() finishes. Otherwise, when countDown() calls Promise() -> Timeout(), the program may run the next line, which reset() will run, even countDown() is not finished yet.
  }
}

/*
Function to make the program sleep for ms miliseconds before running again.
Promise() constructor is similar to setTimeout() function, but it is fulfilled, meaning that promise can be rejected with rejection function when error occurs. Customized function a is called back after timeout for ms miliseconds;
*/
async function sleep(ms) {
  return new Promise(a => setTimeout(a, ms));
}

/*
Function to count down to reset the program.
await literally makes JavaScript wait until the promise settles, and then go on with the result. That doesn’t cost any CPU resources, because the engine can do other jobs in the meantime: execute other scripts, handle events, etc.
If we try to use await in non-async function, there would be a syntax error:
*/
async function countDown(i, idTag, content) {
  for (i; i >= 0; i--) {
    await sleep(1000);
    document.getElementById(idTag).innerText = `${content} ${i}s`;
  }
}

/*
Function to check the validity of the user's input
*/
function checkNum(num) {
  // Check if a number is not a number
  if (isNaN(num)) {
    document.getElementById('dn-announce').innerText = 'Please enter a number';
    document.getElementById('dn-input-num').value = null;
    return -1;
  }

  // Check if a number is in range(0,100)
  if ((num > 100) || (num < 0)) {
    document.getElementById('dn-announce').innerText = 'Enter a number in range 0 to 100';
    document.getElementById('dn-input-num').value = null;
    return -1;
  }

  // Check if the user uses all chances
  for (i = 0; i < records.length; i++) {
    if (records[i] === num) {
      document.getElementById('dn-announce').innerText = 'You already guessed this number';
      document.getElementById('dn-input-num').value = null;
      return -1;
    }
  }
  return 0; //Return 0 if success
}

/*
Function to update the state of the game with user input
*/
async function updateGame(num) {
  records.push(num);          // Push a new value to records of current round
  document.getElementById('dn-records').innerHTML = records; // Display the records of current round

  remainTimes--;              // Update the remaining guessing times
  document.getElementById('dn-remain-times').innerText = `Remaining guessing times: ${remainTimes}`;
  document.getElementById('dn-input-num').value = null;

  // Check whether user has used all guessing times
  if (remainTimes == 0) {
    stop();
    await countDown(5, 'dn-announce', 'Game over. Game restarts in');
    reset('Failed');
    return -1;
  }
  return 0;
}

/**
 * Function to update the dashboard after the user finishes the game
 */
function updateDashboard(){
  for (i = 0; i < rounds.length; i++) {
    let table = document.getElementById('myTable');
    let row = table.insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);

    cell1.innerHTML = i+1;
    cell2.innerHTML = rounds[i].name;
    cell3.innerHTML = rounds[i].time;
    cell4.innerHTML = rounds[i].result;
  }
  resetDashboard();
}

function resetDashboard(){
  rounds = [];
}

