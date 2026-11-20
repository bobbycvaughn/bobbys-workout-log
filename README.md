# Bobby’s Workout Log

A mobile-first, locally saved workout and activity tracker with a black-and-red metal theme. Track lifting, runs and walks, sauna visits, and body weight. The app works offline after its files have been cached and can be installed on a phone’s Home Screen.

[Open Bobby’s Workout Log](https://bobbycvaughn.github.io/bobbys-workout-log/)

## Main features

- **Bobby’s Dashboard:** live local clock, level, favorite badges, running distance, latest weigh-in, weekly recap, and buttons for Almost There and the achievement timeline.
- **Workout:** A/B/C full-body sessions, editable sets, suggested and previous weights, add-set controls, custom exercises, written how-to guidance with video-search links, rest timers, and a plank countdown. Completed exercises collapse and can be reopened. Arrow controls reorder exercises for the selected session. Reordering preserves the base program and historical exercise identities. Swipe right on a set to delete it after confirming (keyboard: focus the set and press Delete). Use Hide beside Add Set at the bottom right of a card to collapse its sets, and Show to reopen them.
- **Run:** Run, Walk, or Run/Walk; optional Treadmill/Outside/Event location, route notes, and effort rating; minutes and seconds; pace; an eight-week distance chart; and separate whole-session records by distance and activity type. Running calorie figures are estimates. Walk and Run/Walk have no calorie estimate.
- **Sauna:** time and temperature entries, a daily line graph with previous-week browsing, and a weekly summary of visits, total minutes, and average visit length.
- **Weight:** multiple weigh-ins per day with automatic local times, daily-average monthly graph, and morning/evening averages. Older entries without a time stay labeled as unknown.
- **History and corrections:** recent workouts and runs with backlog access; editable/deletable activity entries; the last ten data changes can be undone in the same browser, including after reopening.

## Achievements

175 achievements include visible goals and hidden mysteries, personal-record improvements, three-workout weeks, and balanced weeks with a run. First dated results establish PR baselines. Qualifying weeks do not need to be consecutive. A full workout completes both original sets of all six planned exercises; extra sets are optional.

Gold, Blue Flame, Green Flame, and Super badges have distinct artwork and celebrations. Mystery requirements stay hidden until earned. All unfinished visible goals use red progress bars. Phone screens show four compact badge cards per row; tap a known goal for its full description and progress. Mystery goals remain hidden. Tap an unlocked badge to view its celebration, choose up to three favorites, or use its name as a showcase title. Favorites have a corner star. Animations respect the device’s Reduce Motion preference.

Almost There shows the three closest known goals. The achievement timeline scrolls horizontally from oldest to newest, with Earlier/Later controls and swipe/keyboard support. New unlocks retain their triggering activity; older badges explain when the original activity was not recorded.

Running achievements and balanced-week run requirements count Run entries. Walking and mixed sessions are tracked separately in the Run tab. Distance records compare whole sessions at matching distances, not estimated splits from longer runs. Standard distances allow 0.5% rounding.

## Use on your phone

Open the live link above. In Safari on iPhone, use Share → Add to Home Screen. In Chrome on Android, use the browser menu’s Install app or Add to Home screen option. Open the installed app online once to cache its files for offline use.

After an update, close and reopen the app while online so it can load the latest files. The app requests portrait orientation; phone/browser support can vary. Web vibration is used where available, and some phones do not support it.

## Data and backups

Logs stay in browser storage on that device and under that website address. They are not uploaded to GitHub or synchronized across browsers or devices. Browser storage has a quota and can be cleared or evicted. Private browsing may discard data when the session ends.

Use **Export workout data** to save a JSON backup. **Restore backup** replaces the current data after confirmation. Export before switching devices, browsers, or site addresses. Weekly exports are optional; choose a schedule that matches how much recent history you would be comfortable losing.

Backups retain exercises, session order, activity fields, achievements, favorites, unlock evidence, and showcase title. Undo history remains in the same browser and is not included in exports. Unlocks stay earned after a log correction, while XP reflects current records. Older version-1 backups remain supported.

## Run locally

With Python 3 installed, run this command from the app folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000/ on the same computer. Local-preview data is separate from data saved at the live GitHub Pages address. The site has no backend or database dependency.

## Files and hosting

Publish the app files at the site root: `index.html`, `app.js`, the feature JavaScript files, `style.css`, `sw.js`, the web manifest, icons, font/license, and artwork. Keep personal JSON backups and screenshots outside the published folder.

The service worker caches app assets for offline use. The custom font is supplied for personal/noncommercial use; see `daemon-sickness-license.txt`. Scripture attribution appears in the app footer.
