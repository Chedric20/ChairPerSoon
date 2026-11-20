// Static build for Netlify: renders the same pages as the PHP prototype into plain HTML.
// Netlify hosts static files and does not execute PHP, so the pages are generated here
// from the shared sample data in includes/data.json. No dependencies are required.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.env.OUT_DIR || join(root, 'dist'));
const siteUrl = (process.env.URL || 'https://chairpersoon.netlify.app').replace(/\/+$/, '');
const DATA = JSON.parse(readFileSync(join(root, 'includes/data.json'), 'utf8'));

// ---- Analytics rules (mirrors includes/functions.php) ----
const MIN_RESPONDENTS = 5; // privacy + reliability threshold
const FAIL_LIMIT = 25; // % failure that triggers review
const SETE_LOW = 3.0; // criterion score considered low

const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);
const round = (x, d = 0) => { const f = 10 ** d; return Math.round(Number((x * f).toPrecision(15))) / f; };
const sum = (a) => a.reduce((t, v) => t + v, 0);
const passRate = (s) => round((s.passed / s.size) * 100, 1);
const dropRate = (s) => round((s.dropped / s.size) * 100, 1);
const failRate = (s) => round(100 - passRate(s) - dropRate(s), 1);
const seteVisible = (s) => s.resp >= MIN_RESPONDENTS;
const seteOverall = (s) => round(sum(Object.values(s.sete)) / Object.keys(s.sete).length, 2);
const seteLowCriteria = (s) => Object.keys(s.sete).filter((c) => s.sete[c] < SETE_LOW);
const trendDir = ({ trend: t }) => (t[0] < t[1] && t[1] < t[2] ? 'up' : t[0] > t[1] && t[1] > t[2] ? 'down' : 'flat');

function sectionFlag(s) {
  const low = seteVisible(s) ? seteLowCriteria(s) : [];
  if (failRate(s) > FAIL_LIMIT && low.length) return 'red';
  if (failRate(s) > FAIL_LIMIT || low.length || trendDir(s) === 'down') return 'yellow';
  if (trendDir(s) === 'up' && seteVisible(s)) return 'green';
  return 'none';
}

function recommend(s, fac) {
  const f = sectionFlag(s), low = seteLowCriteria(s);
  if (f === 'red') return [['Red', `${s.id} (${fac}): failure rate ${failRate(s)}% with low ${low.join(', ')}.`,
    'Schedule a classroom observation, offer an instructional workshop, and arrange tutoring for failing students.']];
  if (f === 'yellow') {
    const why = low.length ? `low ${low.join(', ')}` : failRate(s) > FAIL_LIMIT ? 'high failure rate' : 'declining SETE trend';
    return [['Yellow', `${s.id} (${fac}): ${why}.`, 'Hold a consultation with the faculty member and monitor next term.']];
  }
  if (f === 'green') return [['Green', `${s.id} (${fac}): SETE improved three terms in a row.`, 'Invite as a peer mentor and share the practices used.']];
  return [];
}

function studentFlag(st) {
  const g = st.grades;
  if (g[0] > g[1] && g[1] > g[2]) return ['Yellow', 'Grades fell two terms in a row: advising referral.'];
  if (st.failed >= 3 || (st.dropped !== null && st.dropped >= 2)) return ['Yellow', 'Repeated failures or drops: check study load.'];
  return ['None', 'On track.'];
}

function programKpis(d) {
  const n = sum(d.sections.map((s) => s.size)), p = sum(d.sections.map((s) => s.passed)), dr = sum(d.sections.map((s) => s.dropped));
  const vis = d.sections.filter(seteVisible);
  return {
    pass: round((p / n) * 100, 1), drop: round((dr / n) * 100, 1), fail: round(100 - (p / n) * 100 - (dr / n) * 100, 1),
    sete: round(sum(vis.map(seteOverall)) / vis.length, 2),
    flagged: d.sections.filter((s) => ['red', 'yellow'].includes(sectionFlag(s))).length,
    resp: round((sum(d.sections.map((s) => s.resp)) / n) * 100),
  };
}

function badge(flag) {
  const m = { red: ['danger', 'Review'], yellow: ['warning text-dark', 'Watch'], green: ['success', 'Strong'], none: ['secondary', 'Normal'] };
  return `<span class="badge bg-${m[flag][0]}">${m[flag][1]}</span>`;
}

const facultyName = (id) => DATA.faculty[id].name;

// ---- Layout (mirrors includes/header.php and includes/footer.php) ----
const navItems = {
  dashboard: { label: 'Overview', icon: '◫' },
  sections: { label: 'Sections', icon: '▤' },
  faculty: { label: 'Faculty', icon: '♙' },
  students: { label: 'Student watchlist', icon: '◎' },
  actions: { label: 'Recommended actions', icon: '✳' },
};
const pageDescriptions = {
  dashboard: 'A clear view of teaching outcomes and sections that may need support.',
  sections: 'Compare section outcomes, SETE scores, and teaching trends.',
  faculty: 'Review teaching profiles and SETE results in context.',
  students: 'Find students who may benefit from additional academic support.',
  actions: 'Turn the current analytics into practical next steps.',
};

function layout({ page, title, path, body }) {
  const desc = pageDescriptions[page] ?? 'Explore program academic and teaching analytics in ChairPerSoon.';
  const nav = Object.entries(navItems).map(([slug, item]) => `
     <a class="nav-link ${page === slug ? 'active' : ''}" href="/${slug}" ${page === slug ? 'aria-current="page"' : ''}>
      <span class="nav-link-icon" aria-hidden="true">${e(item.icon)}</span><span>${e(item.label)}</span>
     </a>`).join('');
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)} | ChairPerSoon</title>
<meta name="description" content="${e(desc)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${e(siteUrl + path)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ChairPerSoon">
<meta property="og:title" content="${e(title)} | ChairPerSoon">
<meta property="og:description" content="${e(desc)}">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="/assets/css/style.css" rel="stylesheet">
</head><body>
<div class="app-layout">
<aside class="app-nav">
  <a class="brand-lockup" href="/dashboard">
  <span class="brand-mark" aria-hidden="true">CPS</span>
  <span class="brand-copy"><strong>ChairPerSoon</strong><small>Academic analytics</small></span>
 </a>
 <div class="mobile-nav-heading">
  <p class="nav-section-label">Workspace</p>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu">
   <span></span><span></span><span></span>
  </button>
 </div>
 <nav class="nav flex-column" id="primary-navigation" aria-label="Main navigation">${nav}
 </nav>
 <div class="app-nav-account">
  <div class="sidebar-user">
   <span class="user-avatar" aria-hidden="true">C</span>
   <span class="sidebar-user-copy"><strong>ChairPerSoon</strong><small>Program Chair</small></span>
  </div>
 </div>
</aside>
<div class="app-content">
<header class="app-topbar">
 <div class="breadcrumbs"><span>ChairPerSoon</span><span class="breadcrumb-divider">/</span><strong>${e(title)}</strong></div>
 <div class="term-chip"><span class="term-indicator" aria-hidden="true"></span><span class="program-name">${e(DATA.program)}</span><span class="term-divider"></span><span>Term ${e(DATA.terms.at(-1))}</span></div>
</header>
<main class="app-main">
<section class="page-heading">
 <p class="page-eyebrow">PROGRAM ANALYTICS</p>
 <h1 class="page-title">${e(title)}</h1>
 <p class="page-description">${e(pageDescriptions[page] ?? 'Explore academic and teaching insights.')}</p>
</section>
${body}
</main>
</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<script src="/assets/js/app.js"></script>
</body></html>
`;
}

const json = (v) => e(JSON.stringify(v));

// ---- Pages ----
function dashboardPage() {
  const k = programKpis(DATA);
  const labels = DATA.sections.map((s) => s.id), pass = DATA.sections.map(passRate);
  const sete = DATA.sections.map((s) => (seteVisible(s) ? seteOverall(s) : null));
  const kpis = [['Pass rate', `${k.pass}%`], ['Failure rate', `${k.fail}%`], ['Drop rate', `${k.drop}%`], ['Average SETE', `${k.sete} / 5`], ['SETE responses', `${k.resp}%`], ['Sections to review', k.flagged]]
    .map(([l, v]) => `
  <div class="col-6 col-md-4 col-xl-2"><div class="kpi"><div class="kpi-v">${e(v)}</div><div class="kpi-l">${e(l)}</div></div></div>`).join('');
  const flagged = DATA.sections.filter((s) => sectionFlag(s) !== 'none').map((s) => `
   <li class="list-group-item d-flex justify-content-between align-items-center px-0">
    <span><strong>${e(s.id)}</strong> ${e(s.course)}<br><small class="text-muted">${e(facultyName(s.fac))}</small></span>${badge(sectionFlag(s))}</li>`).join('')
    || '<li class="list-group-item px-0">No flagged sections this term.</li>';
  return `<section class="panel page-content-card">
<div class="page-content-scroll">
<div class="row g-3 mb-4">${kpis}
</div>
<div class="row g-4">
 <div class="col-lg-7"><div class="panel"><h2 class="h5">Pass rate and SETE score by section</h2>
  <canvas id="secChart" height="140" data-labels="${json(labels)}" data-pass="${json(pass)}" data-sete="${json(sete)}"></canvas>
  <p class="small text-muted mt-2 mb-0">SETE is not plotted for sections below the respondent threshold.</p></div></div>
 <div class="col-lg-5"><div class="panel"><h2 class="h5">Sections that need attention</h2>
  <ul class="list-group list-group-flush">${flagged}
  </ul><a class="btn btn-sm btn-outline-primary mt-3" href="/actions">See recommended actions</a></div></div>
</div>
 </div>
</section>`;
}

function sectionsPage() {
  const rows = DATA.sections.map((s) => {
    const vis = seteVisible(s), t = trendDir(s);
    return `
  <tr><td>${e(s.id)}</td><td>${e(s.course)}</td><td>${e(facultyName(s.fac))}</td>
   <td class="text-end">${e(s.size)}</td><td class="text-end">${passRate(s)}</td><td class="text-end">${failRate(s)}</td><td class="text-end">${e(s.avg)}</td>
   <td class="text-end">${vis ? seteOverall(s) : `<span class="text-muted" title="Fewer than ${MIN_RESPONDENTS} respondents">Hidden</span>`}</td>
   <td>${{ up: 'Rising', down: 'Falling', flat: 'Steady' }[t]}</td><td>${badge(sectionFlag(s))}</td></tr>`;
  }).join('');
  return `<section class="panel page-content-card"><div class="page-content-scroll">
 <div class="row g-2 mb-3"><div class="col-md-4"><input id="filter" class="form-control" placeholder="Filter by course, section or faculty" aria-label="Filter sections"></div>
 <div class="col-md-3"><select id="flagFilter" class="form-select" aria-label="Filter by status"><option value="">All statuses</option><option>Review</option><option>Watch</option><option>Strong</option><option>Normal</option></select></div></div>
 <div class="table-responsive"><table class="table align-middle" id="secTable"><thead><tr>
  <th>Section</th><th>Course</th><th>Faculty</th><th class="text-end">Size</th><th class="text-end">Pass %</th><th class="text-end">Fail %</th><th class="text-end">Avg grade</th><th class="text-end">SETE</th><th>Trend</th><th>Status</th></tr></thead><tbody>${rows}
 </tbody></table></div>
 <p class="small text-muted mb-0">Review = failure above ${FAIL_LIMIT}% and a SETE criterion below ${SETE_LOW}. Watch = one of those, or a falling SETE trend. Strong = SETE rising three terms. Thresholds are illustrative.</p>
</div>
</div></section>`;
}

function criteriaAverages(sections) {
  const crit = {};
  for (const s of sections) for (const [c, v] of Object.entries(s.sete)) (crit[c] ??= []).push(v);
  return Object.fromEntries(Object.entries(crit).map(([c, v]) => [c, round(sum(v) / v.length, 2)]));
}

function facultyPage(id) {
  const fac = DATA.faculty[id];
  const mine = DATA.sections.filter((s) => s.fac === id);
  const avg = criteriaAverages(mine.filter(seteVisible));
  const prog = criteriaAverages(DATA.sections.filter(seteVisible));
  const options = Object.entries(DATA.faculty).map(([k, f]) => `<option value="${e(k)}" ${k === id ? 'selected' : ''}>${e(f.name)}</option>`).join('');
  const chart = Object.keys(avg).length
    ? `<canvas id="critChart" height="170" data-labels="${json(Object.keys(avg))}" data-fac="${json(Object.values(avg))}" data-prog="${json(Object.values(prog))}"></canvas>`
    : '<p>No SETE results can be shown yet: sections have too few respondents.</p>';
  const list = mine.map((s) => `<li class="list-group-item px-0 d-flex justify-content-between"><span><strong>${e(s.id)}</strong> ${e(s.course)}<br>
  <small class="text-muted">Pass ${passRate(s)}% &middot; SETE trend ${s.trend.map(e).join(' &rarr; ')}</small></span>${badge(sectionFlag(s))}</li>`).join('');
  return `<section class="panel page-content-card"><div class="page-content-scroll">
<form class="mb-3" method="get" action="/faculty"><label class="form-label" for="fid">Faculty member</label>
 <select class="form-select w-auto" id="fid" name="id" onchange="window.location.href = '/faculty/' + encodeURIComponent(this.value)">
 ${options}</select></form>
<div class="row g-4"><div class="col-lg-6"><div class="panel"><h2 class="h5">${e(fac.name)}</h2>
 <p class="text-muted">${e(fac.rank)} &middot; ${mine.length} section(s)</p>
 ${chart}</div></div>
 <div class="col-lg-6"><div class="panel"><h2 class="h5">Sections taught</h2><ul class="list-group list-group-flush">
 ${list}</ul>
<p class="small text-muted mt-3 mb-0">Comment themes: anonymized text analysis is a proposed module and is not part of this prototype.</p></div></div></div>
</div></section>`;
}

function studentsPage() {
  const hideMobile = (i) => (i < 2 ? 'd-none d-md-table-cell' : '');
  const heads = DATA.grade_periods.map((t, i) => `<th class="text-end ${hideMobile(i)}">${e(t)}</th>`).join('');
  const rows = DATA.students.map((st) => {
    const [f, m] = studentFlag(st);
    return `
 <tr><td>${e(st.id)}</td><td>${e(st.name)}</td>${st.grades.map((g, i) => `<td class="text-end ${hideMobile(i)}">${e(g)} / 20</td>`).join('')}
  <td class="text-end d-none d-md-table-cell">${e(st.failed)}</td><td class="text-end d-none d-md-table-cell">${st.dropped === null ? 'N/A' : e(st.dropped)}</td>
  <td>${f === 'None' ? '<span class="badge bg-secondary">On track</span>' : '<span class="badge bg-warning text-dark">Advise</span>'}</td><td class="d-none d-md-table-cell">${e(m)}</td></tr>`;
  }).join('');
  return `<section class="panel page-content-card"><div class="page-content-scroll">
<div class="dataset-note"><span class="dataset-note-label">Sample dataset</span>UCI Student Performance (Mathematics) &middot; grades use a 0&ndash;20 scale; drop counts are not provided.</div>
 <div class="table-toolbar">
  <label class="search-control"><span>Find a student</span><input type="search" class="form-control" id="studentFilter" placeholder="Search ID, name, or status" aria-label="Search student records"></label>
  <span class="table-summary" id="studentSummary" aria-live="polite">${DATA.students.length} records</span>
 </div>
 <div class="table-responsive"><table class="table align-middle" id="studentTable"><thead><tr>
 <th>Student ID</th><th>Name</th>${heads}<th class="text-end d-none d-md-table-cell">Fails</th><th class="text-end d-none d-md-table-cell">Drops</th><th>Status</th><th class="d-none d-md-table-cell">Suggested action</th></tr></thead><tbody>${rows}
</tbody></table></div>
 <div class="table-pagination">
  <span class="pagination-status" id="studentPageInfo" aria-live="polite"></span>
  <div class="table-pagination-controls"><button class="btn btn-sm btn-outline-primary" type="button" id="studentPrev">Previous</button><button class="btn btn-sm btn-outline-primary" type="button" id="studentNext">Next</button></div>
 </div>
 <p class="small text-muted mt-3 mb-0">Grades are period scores on a 0&ndash;20 scale. Risk flags are illustrative and should not be used as a sole basis for decisions.</p>
</div>
</div></section>`;
}

function actionsPage() {
  const rank = { Red: 0, Yellow: 1, Green: 2 }, cls = { Red: 'danger', Yellow: 'warning', Green: 'success' };
  const items = DATA.sections.flatMap((s) => recommend(s, facultyName(s.fac))).sort((a, b) => rank[a[0]] - rank[b[0]]);
  const cards = items.map(([lvl, why, todo]) => `
   <article class="panel action-card border-start border-4 border-${cls[lvl]}"><div class="fw-semibold">${e(why)}</div><div class="text-muted">${e(todo)}</div></article>`).join('')
    || '<p class="mb-0">No actions this term.</p>';
  return `<section class="panel page-content-card" aria-label="Recommended action list">
 <div class="page-content-scroll actions-scroll">${cards}
 </div>
</section>`;
}

const indexPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="1;url=/dashboard">
  <meta name="description" content="ChairPerSoon provides program analytics for academic outcomes, sections, faculty teaching profiles, and student support.">
  <meta name="robots" content="index,follow">
  <title>Loading | ChairPerSoon</title>
  <link href="/assets/css/style.css" rel="stylesheet">
</head>
<body class="loading-body">
  <main class="loading-card" role="status" aria-live="polite">
    <span class="loading-mark" aria-hidden="true">CPS</span>
    <p class="loading-eyebrow">ACADEMIC ANALYTICS</p>
    <h1 class="page-title">ChairPerSoon</h1>
    <p class="loading-message">Preparing your program overview</p>
    <span class="loading-spinner" aria-hidden="true"></span>
    <a class="loading-fallback" href="/dashboard">Continue to dashboard</a>
  </main>
  <script>window.setTimeout(() => window.location.replace('/dashboard'), 800);</script>
</body>
</html>
`;

const notFoundPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Page not found | ChairPerSoon</title>
  <link href="/assets/css/style.css" rel="stylesheet">
</head>
<body class="loading-body">
  <main class="loading-card">
    <span class="loading-mark" aria-hidden="true">CPS</span>
    <p class="loading-eyebrow">PAGE NOT FOUND</p>
    <h1 class="page-title">ChairPerSoon</h1>
    <p class="loading-message">This page doesn't exist or has moved.</p>
    <a class="loading-fallback" href="/dashboard">Go to the dashboard</a>
  </main>
</body>
</html>
`;

// ---- Write output ----
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'faculty'), { recursive: true });
const write = (file, content) => writeFileSync(join(out, file), content);

const pages = [
  ['dashboard.html', '/dashboard', 'dashboard', 'Program overview', dashboardPage()],
  ['sections.html', '/sections', 'sections', 'Course and section comparison', sectionsPage()],
  ['faculty.html', '/faculty', 'faculty', 'Faculty teaching profile', facultyPage(Object.keys(DATA.faculty)[0])],
  ...Object.keys(DATA.faculty).map((id) => [`faculty/${id}.html`, `/faculty/${id}`, 'faculty', 'Faculty teaching profile', facultyPage(id)]),
  ['students.html', '/students', 'students', 'Student watchlist', studentsPage()],
  ['actions.html', '/actions', 'actions', 'Recommended actions', actionsPage()],
];
for (const [file, path, page, title, body] of pages) write(file, layout({ page, title, path, body }));

write('index.html', indexPage);
write('404.html', notFoundPage);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
  pages.filter(([file]) => file !== 'faculty.html').map(([, path]) => `  <url><loc>${e(siteUrl + path)}</loc></url>\n`).join('')}</urlset>\n`);
cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });

console.log(`Built ${pages.length} pages to ${out}`);
