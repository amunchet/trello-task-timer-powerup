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
    document.querySelectorAll(checklistSelector).forEach((header, index) => {
      if (header.dataset.hasTimer) return; // prevent duplicates
      header.dataset.hasTimer = 'true';

      const titleContainer = header.querySelector('[data-testid="checklist-title-container"]');

      // Create timer display
      const timerDisplay = document.createElement('div');
      timerDisplay.textContent = '';
      timerDisplay.style.fontSize = '0.9em';
      timerDisplay.style.marginTop = '4px';

      // Create start/stop button
      const button = document.createElement('button');
      button.textContent = '🍅 Start Pomodoro';
      button.style.marginLeft = '8px';
      button.style.fontSize = '0.8em';

      let timerId = null;
      let endTime = null;

      button.onclick = () => {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
          endTime = null;
          timerDisplay.textContent = '';
          button.textContent = '🍅 Start Pomodoro';
        } else {
          endTime = Date.now() + TIMER_DURATION_MS;
          timerDisplay.textContent = formatTime(TIMER_DURATION_MS);
          button.textContent = '⏹ Stop Timer';

          timerId = setInterval(() => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
              clearInterval(timerId);
              timerId = null;
              timerDisplay.textContent = '🎉 Done!';
              button.textContent = '🍅 Start Pomodoro';
              // Optional: play a sound
              const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
              audio.play();
            } else {
              timerDisplay.textContent = formatTime(remaining);
            }
          }, 1000);
        }
      };

      // Append to header
      titleContainer.appendChild(button);
      titleContainer.appendChild(timerDisplay);
    });
  }

  // Initial injection
  setInterval(insertTimerButtons, 1000); // repeat in case Trello re-renders

})();
