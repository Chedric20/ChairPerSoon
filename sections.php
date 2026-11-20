<?php $title = 'Course and section comparison'; require 'includes/header.php'; ?>
<section class="panel page-content-card"><div class="page-content-scroll">
 <div class="row g-2 mb-3"><div class="col-md-4"><input id="filter" class="form-control" placeholder="Filter by course, section or faculty" aria-label="Filter sections"></div>
 <div class="col-md-3"><select id="flagFilter" class="form-select" aria-label="Filter by status"><option value="">All statuses</option><option>Review</option><option>Watch</option><option>Strong</option><option>Normal</option></select></div></div>
 <div class="table-responsive"><table class="table align-middle" id="secTable"><thead><tr>
  <th>Section</th><th>Course</th><th>Faculty</th><th class="text-end">Size</th><th class="text-end">Pass %</th><th class="text-end">Fail %</th><th class="text-end">Avg grade</th><th class="text-end">SETE</th><th>Trend</th><th>Status</th></tr></thead><tbody>
 <?php foreach ($DATA['sections'] as $s): $vis = sete_visible($s); $t = trend_dir($s); ?>
  <tr><td><?= e($s['id']) ?></td><td><?= e($s['course']) ?></td><td><?= e($DATA['faculty'][$s['fac']]['name']) ?></td>
   <td class="text-end"><?= $s['size'] ?></td><td class="text-end"><?= pass_rate($s) ?></td><td class="text-end"><?= fail_rate($s) ?></td><td class="text-end"><?= $s['avg'] ?></td>
   <td class="text-end"><?= $vis ? sete_overall($s) : '<span class="text-muted" title="Fewer than ' . MIN_RESPONDENTS . ' respondents">Hidden</span>' ?></td>
   <td><?= ['up'=>'Rising','down'=>'Falling','flat'=>'Steady'][$t] ?></td><td><?= badge(section_flag($s)) ?></td></tr>
 <?php endforeach; ?></tbody></table></div>
 <p class="small text-muted mb-0">Review = failure above <?= FAIL_LIMIT ?>% and a SETE criterion below <?= SETE_LOW ?>. Watch = one of those, or a falling SETE trend. Strong = SETE rising three terms. Thresholds are illustrative.</p>
</div>
</div></section>
<?php require 'includes/footer.php'; ?>
