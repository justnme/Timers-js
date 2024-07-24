function showDate() {
  const now = new Date();
  document.getElementById('dateOutput').innerText = now.toLocaleDateString();
}

function showTime() {
  const now = new Date();
  document.getElementById('timeOutput').innerText = now.toLocaleTimeString();
}

showDate();
showTime();

setInterval(showDate, 1000);
setInterval(showTime, 1000);

let alarmTimeout;
let alarms = [];
let alarmId = 0;

function setAlarm(alarm = null) {
  let alarmTime;
  if (alarm) {
    alarmTime = alarm.time;
  } else {
    alarmTime = new Date(document.getElementById('alarmTime').value);
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }

  const now = new Date();

  if (alarmTime > now) {
    const timeDifference = alarmTime.getTime() - now.getTime();
    const alarmSound = new Audio('spinnerspin.mp3');
    if (alarm) {
      clearTimeout(alarm.timeout);
    }
    alarmTimeout = setTimeout(() => {
      alarmSound.play();
      alert('Alarm ringing!');
      alarm.status = "Rang";
      updateAlarmList();
    }, timeDifference);

    if (!alarm) {
      alarm = {
        id: alarmId++,
        time: alarmTime,
        timeout: alarmTimeout,
        status: "Pending",
        remaining: Math.round(timeDifference / 1000)
      };
      alarms.push(alarm);
    } else {
      alarm.timeout = alarmTimeout;
      alarm.status = "Pending";
    }

    if (alarm.countdownInterval) {
      clearInterval(alarm.countdownInterval);
    }

    alarm.countdownInterval = setInterval(() => {
      if (alarm.status === "Pending") {
        const now = new Date();
        alarm.remaining = Math.round((alarm.time.getTime() - now.getTime()) / 1000);
      }
      if (alarm.remaining <= 0) {
        clearInterval(alarm.countdownInterval);
      }
      updateAlarmList();
    }, 1000);
  } else {
    alert('Alarm time has passed. Set the alarm to a future time.');
  }

  localStorage.setItem('alarms', JSON.stringify(alarms));
}

function updateAlarmList() {
  const alarmList = document.getElementById('alarmList');
  alarmList.innerHTML = '';

  for (let alarm of alarms) {
    const listItem = document.createElement('li');

    const onOffButton = document.createElement('button');
    onOffButton.innerText = alarm.status === "Pending" ? "Turn Off" : "Turn On";
    onOffButton.onclick = function () {
      if (alarm.status === "Pending") {
        clearTimeout(alarm.timeout);
        alarm.status = "Off";
      } else {
        setAlarm(alarm);
      }
      updateAlarmList();
    };

    const deleteButton = document.createElement('button');
    deleteButton.innerText = "Delete";
    deleteButton.onclick = function () {
      clearTimeout(alarm.timeout);
      alarms = alarms.filter(a => a.id !== alarm.id);
      updateAlarmList();
    };

    listItem.innerText = 
      `Alarm set for ${alarm.time.toISOString().slice(0, 19).replace('T', ' ')} - Status: ${alarm.status} - Time remaining: ${Math.round(alarm.remaining)} seconds`;
        
    listItem.appendChild(onOffButton);
    listItem.appendChild(deleteButton);
    alarmList.appendChild(listItem);
  }
}

function cancelAlarm() {
  for (let alarm of alarms) {
    clearTimeout(alarm.timeout);
  }
  alarms = [];
  updateAlarmList();
}

let timerInterval = null;
let timerTime = 0;
let timerPaused = false;

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  if (!timerPaused) {
    let hours = document.getElementById('timerHours').value;
    let minutes = document.getElementById('timerMinutes').value;
    let seconds = document.getElementById('timerSeconds').value;
    timerTime = hours * 3600 + minutes * 60 + seconds;
  }

  timerInterval = setInterval(() => {
    if (timerTime <= 0) {
      clearInterval(timerInterval);
      document.getElementById('timerOutput').innerText = 'Timer: 0 seconds';
      alert('Time is up!');
      timerPaused = false;
    } else {
      document.getElementById('timerOutput').innerText = `Timer: ${timerTime} seconds`;
      timerTime--;
    }
  }, 1000);

  document.getElementById('stopTimerButton').innerText = 'Stop Timer';
  timerPaused = false;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerPaused = true;
    document.getElementById('stopTimerButton').innerText = 'Resume Timer';
  } else if (timerPaused) {
    startTimer();
  }
}

let stopwatchInterval = null;
let stopwatchTime = 0;
let stopwatchPaused = false;

function startStopwatch() {
  stopwatchTime = 0;
  document.getElementById('stopwatchOutput').innerText = '';

  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
  }

  stopwatchInterval = setInterval(() => {
    stopwatchTime++;
    document.getElementById('stopwatchOutput').innerText = `Stopwatch: ${stopwatchTime} seconds`;
  }, 1000);

  document.getElementById('stopStopwatchButton').innerText = 'Stop Stopwatch';
  stopwatchPaused = false;
}

function stopStopwatch() {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchPaused = true;
    document.getElementById('stopStopwatchButton').innerText = 'Resume Stopwatch';
  } else if (stopwatchPaused) {
    stopwatchInterval = setInterval(() => {
      stopwatchTime++;
      document.getElementById('stopwatchOutput').innerText = `Stopwatch: ${stopwatchTime} seconds`;
    }, 1000);
  }
}

window.onload = function () {
  const savedAlarms = JSON.parse(localStorage.getItem('alarms'));
  if (savedAlarms) {
    alarms = savedAlarms;
    for (let alarm of alarms) {
      alarm.time = new Date(alarm.time);  
      if (alarm.status === "Pending") {
        const now = new Date();
        const timeDifference = alarm.time.getTime() - now.getTime();
        if (timeDifference > 0) {
          alarm.remaining = Math.round(timeDifference / 1000);
          setAlarm(alarm);
        } else {
          alarm.status = "Rang";
        }
      }
    }
    updateAlarmList();
  }
};
