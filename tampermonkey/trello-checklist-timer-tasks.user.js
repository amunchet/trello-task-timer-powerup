// ==UserScript==
// @name         Trello Checklist Pomodoro Timers
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds Pomodoro timers to each checklist header on Trello cards
// @author       You
// @match        https://trello.com/c/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const TIMER_DURATION_MS = 25 * 60 * 1000; // 25 minutes
  const checklistSelector = 'hgroup.hZBEE2fmsk8bYB';

  let activeTimers = {};

  function formatTime(msLeft) {
    const totalSec = Math.max(0, Math.floor(msLeft / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = (totalSec % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

function insertTimerButtons() {
  document.querySelectorAll('[data-testid="checklist-container"]').forEach((container, index) => {
    if (container.dataset.hasPomodoroTimer) return;
    container.dataset.hasPomodoroTimer = 'true';

    // Create wrapper
    const timerWrapper = document.createElement('div');
    timerWrapper.style.display = 'flex';
    timerWrapper.style.alignItems = 'center';
    timerWrapper.style.gap = '8px';
    timerWrapper.style.margin = '8px 0';
    timerWrapper.style.padding = '4px 8px';
    timerWrapper.style.background = '#f4f5f7';
    timerWrapper.style.borderRadius = '4px';

    // Button
    const button = document.createElement('button');
    button.textContent = '🍅 Start Pomodoro';
    button.style.fontSize = '0.8em';

    // Timer display
    const timerDisplay = document.createElement('span');
    timerDisplay.textContent = '';
    timerDisplay.style.fontSize = '0.9em';

    timerWrapper.appendChild(button);
    timerWrapper.appendChild(timerDisplay);

    // Insert above the entire checklist container
    container.parentElement.insertBefore(timerWrapper, container);

    let timerId = null;
    let endTime = null;

    button.onclick = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
        timerDisplay.textContent = '';
        button.textContent = '🍅 Start Pomodoro';
      } else {
        endTime = Date.now() + 25 * 60 * 1000; // 25 mins
        button.textContent = '⏹ Stop Timer';

        timerId = setInterval(() => {
          const remaining = endTime - Date.now();
          if (remaining <= 0) {
            clearInterval(timerId);
            timerId = null;
            timerDisplay.textContent = '🎉 Done!';
            button.textContent = '🍅 Start Pomodoro';
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
            audio.play();
          } else {
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
            timerDisplay.textContent = `⏳ ${mins}:${secs}`;
          }
        }, 1000);
      }
    };
  });
}


  // Initial injection
  setInterval(insertTimerButtons, 1000); // repeat in case Trello re-renders

})();
