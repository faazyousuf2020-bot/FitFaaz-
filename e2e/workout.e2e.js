// Clicks through a full workout in the real app (browser build, phone-sized) with a simulated clock.
// Run: npm run e2e   (builds the browser version, serves it and runs this)
const { chromium } = require("playwright-core");
const OUT = process.env.E2E_OUT || __dirname + "/out";
const URL = process.env.E2E_URL || "http://localhost:8089/";
require("fs").mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "✓" : "✗"} ${name}${extra ? " — " + extra : ""}`); };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const p = await browser.newPage({ viewport: { width: 390, height: 780 } });
  const errors = []; p.on("pageerror", (e) => errors.push(e.message));
  await p.clock.install({ time: new Date("2026-10-06T07:00:00+05:30") });
  await p.goto(URL); await p.clock.runFor(3000);
  const tick = (ms) => p.clock.runFor(ms);
  const text = async () => (await p.locator("body").innerText()).replace(/\s+/g, " ");
  const shot = (n) => p.screenshot({ path: `${OUT}/${n}.png` });
  const onScreen = async (label) => {
    const el = p.getByText(label, { exact: true }).first();
    if (!(await el.count())) return false;
    const b = await el.boundingBox();
    return !!b && b.y >= 0 && b.y + b.height <= 780 - 70; // above the tab bar, without scrolling
  };

  // profile: 80 kg
  await p.getByLabel("Your details and settings").click(); await tick(500);
  await p.locator("input").nth(0).fill("80");
  await p.getByText("Save", { exact: true }).click(); await tick(3000);

  // plan today
  await p.getByText("Workout", { exact: true }).last().click(); await tick(300);
  await p.getByText("Plan", { exact: true }).click(); await tick(300);
  const add = p.getByPlaceholder(/Add to/).first();
  await add.fill("pushups 3x10"); await add.press("Enter"); await tick(300);
  await add.fill("squats 3x12"); await add.press("Enter"); await tick(300);
  ok("plan has both exercises", /pushups.*squats/.test(await text()));

  // log tab shows the plan with Start buttons
  await p.getByText("Log", { exact: true }).click(); await tick(300);
  let t = await text();
  ok("Log tab shows today's plan", t.includes("Today's plan") && t.includes("pushups") && t.includes("squats"));
  ok("each planned exercise has a Start button", (await p.getByText("Start", { exact: true }).count()) === 2);
  await shot("1-log");

  // start with pushups
  await p.getByText("Start", { exact: true }).first().click(); await tick(500);
  ok("workout opens on pushups", (await text()).includes("Start set 1 of 3"));
  await tick(60000); // a minute before starting: not rest
  for (const [name, reps] of [["pushups", 10], ["squats", 12]]) {
    for (let set = 1; set <= 3; set++) {
      ok(`${name}: "Start set ${set} of 3" is on screen without scrolling`, await onScreen(`Start set ${set} of 3`));
      await p.getByText(`Start set ${set} of 3`, { exact: true }).click(); await tick(40000);
      ok(`${name}: set ${set} running, "Finish set ${set}" is on screen`, await onScreen(`Finish set ${set}`));
      if (name === "pushups" && set === 1) await shot("2-set-running");
      await p.getByText(`Finish set ${set}`, { exact: true }).click(); await tick(500);
      if (set < 3) {
        t = await text();
        ok(`${name}: resting after set ${set}`, t.includes("Resting between sets") && t.includes(`Start set ${set + 1} of 3`));
        if (name === "pushups" && set === 1) await shot("3-resting");
        await tick(59500);
      }
    }
    t = await text();
    ok(`${name}: marked done after 3 sets`, t.includes(`✓ ${name} done`) && t.includes("3 sets"), t.match(/✓[^·]*·[^·]*·[^·]*·[^·]*/)?.[0]);
    if (name === "pushups") {
      await shot("4-exercise-done");
      ok('"Next: squats" offered', await onScreen("Next: squats"));
      await tick(60000); // walking over to the next exercise: counted as rest
      await p.getByText("Next: squats", { exact: true }).click(); await tick(500);
    }
  }
  t = await text();
  ok("all planned exercises done", t.includes("All planned exercises done"));
  ok("plan checklist shows 2 of 2 done", t.includes("2 of 2 done"));
  await tick(10 * 60000); // forgot to tap Finish for 10 minutes

  // home: exercise 6×40 s = 4 min, rest 5 gaps × 60 s = 5 min, calories (6−1)×80×240/3600 + 1×80×300/3600 ≈ 33
  await p.getByText("Today", { exact: true }).last().click(); await tick(6000);
  t = await text();
  const burned = +(t.match(/Calories burned (\d+)/)?.[1] ?? -1);
  ok("home: calories burned ≈ 33 kcal (idle time not counted)", Math.abs(burned - 33) <= 1, `${burned} kcal`);
  ok("home: workout time 9 min (4 exercise + 5 rest)", /Workout 9 min/.test(t) && /exercise 4 min · rest 5 min/.test(t), t.match(/Workout: [^|]*?rest [0-9a-z ]+/)?.[0]);
  await shot("5-home");

  // finish → summary
  await p.getByText("Workout", { exact: true }).last().click(); await tick(500);
  await p.getByText("Finish", { exact: true }).click(); await tick(300);
  await p.evaluate(() => globalThis.__pressAlert("Finish")); await tick(1000);
  t = await text();
  ok("summary shows 9 min · exercise 4 min · rest 5 min · about 33 kcal", t.includes("9 min · exercise 4 min · rest 5 min · about 33 kcal"), t.match(/Workout done[^|]{0,80}/)?.[0]);
  ok("summary lists pushups 3 sets · 10, 10, 10 reps", t.includes("3 sets · 10, 10, 10 reps"));
  ok("summary lists squats 3 sets · 12, 12, 12 reps", t.includes("3 sets · 12, 12, 12 reps"));
  await shot("6-summary");
  await p.getByText("Close", { exact: true }).click(); await tick(500);
  t = await text();
  ok("after finishing, the log shows the workout", t.includes("exercise 4 min · rest 5 min"));
  ok("no errors in the app", errors.length === 0, errors.join(" | "));

  console.log(`\nworkout click-through: ${pass} passed · ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
