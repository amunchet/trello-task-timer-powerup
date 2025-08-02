window.TrelloPowerUp.initialize({
  'card-detail-badges': async function (t) {
    const card = await t.card('checklists');
    const timers = await t.get('card', 'shared', 'checklistTimers') || {};
    const now = Date.now();

    const badges = card.checklists.map(cl => {
      const state = timers[cl.id];
      const timeLeft = state ? Math.max(0, Math.ceil((state.startTime + 25 * 60 * 1000 - now) / 1000)) : null;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return {
        title: `Task Timer: ${cl.name}`,
        text: timeLeft ? `${minutes}:${seconds.toString().padStart(2, '0')}` : 'Start 25:00',
        color: timeLeft ? 'green' : 'blue',
        refresh: 1, // ⏱️ Trigger refresh every 1 second while the card is open
        callback: t => {
          setInterval(async () => {
            await t.get("card", "shared", "checklistTimers")
            console.log("Timer updated for checklist:", cl.name);
          }, 1000)

          return t.popup({
            title: `Task Timer for ${cl.name}`,
            url: './popup.html',
            height: 160,
            args: { checklistId: cl.id }
          })
        }
      };
    });

    console.log("HERE IN TASK TIMER!")
    return badges;
  }
});