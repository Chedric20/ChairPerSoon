document.addEventListener('DOMContentLoaded', () => {
  const mobileNav = document.querySelector('.app-nav');
  const navToggle = document.querySelector('.nav-toggle');
  if (mobileNav && navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navToggle.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu');
      mobileNav.classList.toggle('menu-open', !expanded);
    });
  }

  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = 'Arial, sans-serif';
    Chart.defaults.color = '#76636a';
  }
  const j = (el, k) => JSON.parse(el.dataset[k]);
  const sec = document.getElementById('secChart');
  if (sec) new Chart(sec, { type: 'bar',
    data: { labels: j(sec, 'labels'), datasets: [
      { label: 'Pass rate (%)', data: j(sec, 'pass'), backgroundColor: '#9b0b1f', hoverBackgroundColor: '#690813', borderRadius: 6, maxBarThickness: 38, yAxisID: 'y' },
      { type: 'line', label: 'SETE (1-5)', data: j(sec, 'sete'), borderColor: '#c52239', backgroundColor: '#c52239', pointBackgroundColor: '#fffafb', pointBorderWidth: 2, pointRadius: 4, tension: .3, yAxisID: 'y1' }] },
    options: { plugins: { legend: { position: 'bottom', labels: { color: '#76636a', usePointStyle: true, padding: 18 } } },
      scales: { x: { grid: { display: false }, ticks: { color: '#76636a' } },
        y: { min: 0, max: 100, grid: { color: '#ead9de' }, ticks: { color: '#76636a' } },
        y1: { min: 1, max: 5, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#76636a' } } } } });
  const cr = document.getElementById('critChart');
  if (cr) new Chart(cr, { type: 'bar',
    data: { labels: j(cr, 'labels'), datasets: [
      { label: 'This faculty', data: j(cr, 'fac'), backgroundColor: '#9b0b1f', borderRadius: 5, maxBarThickness: 24 },
      { label: 'Program average', data: j(cr, 'prog'), backgroundColor: '#d9aeb7', borderRadius: 5, maxBarThickness: 24 }] },
    options: { indexAxis: 'y', plugins: { legend: { position: 'bottom', labels: { color: '#76636a', usePointStyle: true, padding: 18 } } },
      scales: { x: { min: 0, max: 5, grid: { color: '#ead9de' }, ticks: { color: '#76636a' } },
        y: { grid: { display: false }, ticks: { color: '#76636a' } } } } });
  // Section table filter
  const q = document.getElementById('filter'), f = document.getElementById('flagFilter'), rows = document.querySelectorAll('#secTable tbody tr');
  const apply = () => rows.forEach(r => {
    const t = r.textContent.toLowerCase(), badge = r.querySelector('.badge').textContent;
    r.style.display = t.includes(q.value.toLowerCase()) && (!f.value || badge === f.value) ? '' : 'none'; });
  if (q) { q.addEventListener('input', apply); f.addEventListener('change', apply); }

  const studentTable = document.getElementById('studentTable');
  if (studentTable) {
    const rows = Array.from(studentTable.querySelectorAll('tbody tr'));
    const search = document.getElementById('studentFilter');
    const summary = document.getElementById('studentSummary');
    const pageInfo = document.getElementById('studentPageInfo');
    const previous = document.getElementById('studentPrev');
    const next = document.getElementById('studentNext');
    const pageSize = 15;
    let page = 1;
    let emptyRow;

    const renderStudents = () => {
      const term = search.value.trim().toLowerCase();
      const visibleRows = rows.filter(row => row.textContent.toLowerCase().includes(term));
      const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
      page = Math.min(page, pageCount);
      rows.forEach(row => { row.hidden = true; });
      visibleRows.slice((page - 1) * pageSize, page * pageSize).forEach(row => { row.hidden = false; });

      if (!emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-row';
        const cell = document.createElement('td');
        cell.colSpan = window.matchMedia('(max-width: 767.98px)').matches ? 4 : 9;
        cell.textContent = 'No students match your search.';
        emptyRow.appendChild(cell);
        studentTable.querySelector('tbody').appendChild(emptyRow);
      }
      emptyRow.hidden = visibleRows.length > 0;
      summary.textContent = `${visibleRows.length} ${visibleRows.length === 1 ? 'record' : 'records'}`;
      pageInfo.textContent = `Page ${page} of ${pageCount}`;
      previous.disabled = page === 1 || visibleRows.length === 0;
      next.disabled = page === pageCount || visibleRows.length === 0;
    };

    search.addEventListener('input', () => { page = 1; renderStudents(); });
    previous.addEventListener('click', () => { page--; renderStudents(); });
    next.addEventListener('click', () => { page++; renderStudents(); });
    renderStudents();
  }
});
