<?php $title = 'Faculty teaching profile'; require 'includes/header.php';
$id = $_GET['id'] ?? array_key_first($DATA['faculty']); if (!isset($DATA['faculty'][$id])) $id = array_key_first($DATA['faculty']);
$mine = array_values(array_filter($DATA['sections'], fn($s) => $s['fac'] === $id)); $vis = array_values(array_filter($mine, 'sete_visible'));
$crit = []; $avg = [];
foreach ($vis as $s) foreach ($s['sete'] as $c => $v) $crit[$c][] = $v;
foreach ($crit as $c => $v) $avg[$c] = round(array_sum($v) / count($v), 2);
$all = []; foreach (array_filter($DATA['sections'], 'sete_visible') as $s) foreach ($s['sete'] as $c => $v) $all[$c][] = $v;
$prog = array_map(fn($v) => round(array_sum($v) / count($v), 2), $all); ?>
<section class="panel page-content-card"><div class="page-content-scroll">
<form class="mb-3" method="get"><label class="form-label" for="fid">Faculty member</label>
 <select class="form-select w-auto" id="fid" name="id" onchange="this.form.submit()">
 <?php foreach ($DATA['faculty'] as $k => $f): ?><option value="<?= $k ?>" <?= $k===$id?'selected':'' ?>><?= e($f['name']) ?></option><?php endforeach; ?></select></form>
<div class="row g-4"><div class="col-lg-6"><div class="panel"><h2 class="h5"><?= e($DATA['faculty'][$id]['name']) ?></h2>
 <p class="text-muted"><?= e($DATA['faculty'][$id]['rank']) ?> &middot; <?= count($mine) ?> section(s)</p>
 <?php if ($avg): ?><canvas id="critChart" height="170" data-labels='<?= json_encode(array_keys($avg)) ?>' data-fac='<?= json_encode(array_values($avg)) ?>' data-prog='<?= json_encode(array_values($prog)) ?>'></canvas>
 <?php else: ?><p>No SETE results can be shown yet: sections have too few respondents.</p><?php endif; ?></div></div>
 <div class="col-lg-6"><div class="panel"><h2 class="h5">Sections taught</h2><ul class="list-group list-group-flush">
 <?php foreach ($mine as $s): ?><li class="list-group-item px-0 d-flex justify-content-between"><span><strong><?= e($s['id']) ?></strong> <?= e($s['course']) ?><br>
  <small class="text-muted">Pass <?= pass_rate($s) ?>% &middot; SETE trend <?= implode(' &rarr; ', $s['trend']) ?></small></span><?= badge(section_flag($s)) ?></li><?php endforeach; ?></ul>
<p class="small text-muted mt-3 mb-0">Comment themes: anonymized text analysis is a proposed module and is not part of this prototype.</p></div></div></div>
</div></section>
<?php require 'includes/footer.php'; ?>
