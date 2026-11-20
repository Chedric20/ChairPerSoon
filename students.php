<?php $title = 'Student watchlist'; require 'includes/header.php'; ?>
<section class="panel page-content-card"><div class="page-content-scroll">
<div class="dataset-note"><span class="dataset-note-label">Sample dataset</span>UCI Student Performance (Mathematics) &middot; grades use a 0&ndash;20 scale; drop counts are not provided.</div>
 <div class="table-toolbar">
  <label class="search-control"><span>Find a student</span><input type="search" class="form-control" id="studentFilter" placeholder="Search ID, name, or status" aria-label="Search student records"></label>
  <span class="table-summary" id="studentSummary" aria-live="polite"><?= count($DATA['students']) ?> records</span>
 </div>
 <div class="table-responsive"><table class="table align-middle" id="studentTable"><thead><tr>
 <th>Student ID</th><th>Name</th><?php foreach ($DATA['grade_periods'] as $index => $t): ?><th class="text-end <?= $index < 2 ? 'd-none d-md-table-cell' : '' ?>"><?= e($t) ?></th><?php endforeach; ?><th class="text-end d-none d-md-table-cell">Fails</th><th class="text-end d-none d-md-table-cell">Drops</th><th>Status</th><th class="d-none d-md-table-cell">Suggested action</th></tr></thead><tbody>
<?php foreach ($DATA['students'] as $st): [$f, $m] = student_flag($st); ?>
 <tr><td><?= e($st['id']) ?></td><td><?= e($st['name']) ?></td><?php foreach ($st['grades'] as $index => $g): ?><td class="text-end <?= $index < 2 ? 'd-none d-md-table-cell' : '' ?>"><?= e($g) ?> / 20</td><?php endforeach; ?>
  <td class="text-end d-none d-md-table-cell"><?= e($st['failed']) ?></td><td class="text-end d-none d-md-table-cell"><?= $st['dropped'] === null ? 'N/A' : e($st['dropped']) ?></td>
  <td><?= $f === 'None' ? '<span class="badge bg-secondary">On track</span>' : '<span class="badge bg-warning text-dark">Advise</span>' ?></td><td class="d-none d-md-table-cell"><?= e($m) ?></td></tr>
<?php endforeach; ?></tbody></table></div>
 <div class="table-pagination">
  <span class="pagination-status" id="studentPageInfo" aria-live="polite"></span>
  <div class="table-pagination-controls"><button class="btn btn-sm btn-outline-primary" type="button" id="studentPrev">Previous</button><button class="btn btn-sm btn-outline-primary" type="button" id="studentNext">Next</button></div>
 </div>
 <p class="small text-muted mt-3 mb-0">Grades are period scores on a 0&ndash;20 scale. Risk flags are illustrative and should not be used as a sole basis for decisions.</p>
</div>
</div></section>
<?php require 'includes/footer.php'; ?>
