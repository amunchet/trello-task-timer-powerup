// ==UserScript==
// @name         Trello Checklist Timer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds Timer functionality to each checklist header on Trello cards
// @author       You
// @match        https://trello.com/c/*
// @grant        GM_xmlhttpRequest
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
  function playFromBuffer(context, buffer) {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
    }

    function playMusic() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://creatorassets.com/cdn/ding-sound-effects/sound-1.mp3",
            responseType: "arraybuffer",
            onload: function(response) {
                context.decodeAudioData(
                    response.response,
                    buffer => playFromBuffer(context, buffer),
                    err => console.error("decode error:", err)
                );
            },
            onerror: function(err) {
                console.error("Request error:", err);
            }
        });
    }
function insertTimerButtons() {
  document.querySelectorAll('[data-testid="checklist-container"]').forEach((container, index) => {
    if (container.dataset.hasTaskTimer) return;
    container.dataset.hasTaskTimer = 'true';

    // Create wrapper
    const timerWrapper = document.createElement('div');
    timerWrapper.style.display = 'flex';
    timerWrapper.style.justifyContent = 'space-between';
    timerWrapper.style.alignItems = 'center';
    timerWrapper.style.margin = '8px 0';
    timerWrapper.style.padding = '4px 8px';
    timerWrapper.style.background = '#f4f5f7';
    timerWrapper.style.borderRadius = '4px';

    // Left: button + timer
    const leftSection = document.createElement('div');
    leftSection.style.display = 'flex';
    leftSection.style.alignItems = 'center';
    leftSection.style.gap = '8px';

    const button = document.createElement('button');
    button.textContent = '🍅 Start Timer';
    //button.style.fontSize = '0.8em';
    button.style.fontWeight = '500';
    button.style.backgroundColor = 'white';
    button.style.borderRadius = '0.5rem';
    button.style.borderWidth = '2px';
    button.style.borderColor = 'lightgrey';
    button.style.boxShadow = 'none !important';
    button.style.padding = '5px';

    const timerDisplay = document.createElement('span');
    timerDisplay.textContent = '';
    //timerDisplay.style.fontSize = '0.9em';
    timerDisplay.style.fontWeight = 'bold';

    leftSection.appendChild(button);
    leftSection.appendChild(timerDisplay);

    // Right: time input
    const timeInput = document.createElement('input');
    timeInput.type = 'text';
    timeInput.value = '25:00';
    timeInput.placeholder = 'MM:SS';
    timeInput.title = 'Timer Duration';
    timeInput.style.width = '60px';
    timeInput.style.textAlign = 'right';
    timeInput.style.fontSize = '0.8em';

    // Compose final wrapper
    timerWrapper.appendChild(leftSection);
    timerWrapper.appendChild(timeInput);

    // Insert before checklist container
    container.parentElement.insertBefore(timerWrapper, container);

    let timerId = null;
    let endTime = null;

    button.onclick = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
        timerDisplay.textContent = '';
        button.textContent = '🍅 Start Timer';
      } else {
        // Parse MM:SS
        const match = timeInput.value.match(/^(\d{1,2}):(\d{2})$/);
        let durationMs = 25 * 60 * 1000; // fallback
        if (match) {
          const min = parseInt(match[1], 10);
          const sec = parseInt(match[2], 10);
          durationMs = (min * 60 + sec) * 1000;
        }

        endTime = Date.now() + durationMs;
        button.textContent = '⏹ Stop Timer';

        timerId = setInterval(() => {
          const remaining = endTime - Date.now();
          if (remaining <= 0) {
            clearInterval(timerId);
            timerId = null;
            timerDisplay.textContent = '🎉 Done!';
            button.textContent = '🍅 Start Timer';
            //const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
            //audio.play();
            playMusic();
          } else {
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
            timerDisplay.textContent = `⏳ ${mins}:${secs}`;
          }
        }, 300);
      }
    };
  });
}



  // Initial injection
  setInterval(insertTimerButtons, 1000); // repeat in case Trello re-renders

})();
