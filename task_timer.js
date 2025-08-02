window.TrelloPowerUp.initialize({
  'card-detail-badges': function (t) {
    return t.card('checklists')
      .then(card => {
        return card.checklists.map(cl => ({
          dynamic: function () {
            console.log("Calling dynamic function for checklist:", cl.name);
            return t.get('card', 'shared', 'checklistTimers')
              .then(timers => {
                console.log("Current timers:", timers);
                timers = timers || {};
                const now = Date.now();
                const state = timers[cl.id];
                const timeLeft = state
                  ? Math.max(0, Math.ceil((state.startTime + 25 * 60 * 1000 - now) / 1000))
                  : null;

                const minutes = Math.floor((timeLeft || 0) / 60);
                const seconds = (timeLeft || 0) % 60;

                return {
                  title: `Task Timer: ${cl.name}`,
                  text: timeLeft !== null
                    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
                    : 'Start 25:00',
                  color: timeLeft ? 'green' : 'blue',
                  refresh: 10, // minimum allowed by Trello
                  callback: function () {
                    return t.popup({
                      title: `Task Timer for ${cl.name}`,
                      url: './popup.html',
                      height: 160,
                      args: { checklistId: cl.id }
                    });
                  }
                };
              });
          }
        }));
      });
  }
});
