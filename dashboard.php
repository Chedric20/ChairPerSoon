<?php $title = 'Program overview'; require 'includes/header.php'; $k = program_kpis($DATA);
$labels = array_column($DATA['sections'], 'id'); $pass = array_map('pass_rate', $DATA['sections']);
$sete = array_map(fn($s) => sete_visible($s) ? sete_overall($s) : null, $DATA['sections']); ?>
<section class="panel page-content-card">
<div class="page-content-scroll">
<div class="row g-3 mb-4">
 <?php foreach ([['Pass rate',$k['pass'].'%'],['Failure rate',$k['fail'].'%'],['Drop rate',$k['drop'].'%'],['Average SETE',$k['sete'].' / 5'],['SETE responses',$k['resp'].'%'],['Sections to review',$k['flagged']]] as [$l,$v]): ?>
  <div class="col-6 col-md-4 col-xl-2"><div class="kpi"><div class="kpi-v"><?= e($v) ?></div><div class="kpi-l"><?= e($l) ?></div></div></div>
 <?php endforeach; ?>
</div>
<div class="row g-4">
 <div class="col-lg-7"><div class="panel"><h2 class="h5">Pass rate and SETE score by section</h2>
  <canvas id="secChart" height="140" data-labels='<?= json_encode($labels) ?>' data-pass='<?= json_encode($pass) ?>' data-sete='<?= json_encode($sete) ?>'></canvas>
  <p class="small text-muted mt-2 mb-0">SETE is not plotted for sections below the respondent threshold.</p></div></div>
 <div class="col-lg-5"><div class="panel"><h2 class="h5">Sections that need attention</h2>
  <ul class="list-group list-group-flush">
  <?php $any = false; foreach ($DATA['sections'] as $s) { $f = section_flag($s); if ($f === 'none') continue; $any = true; ?>
   <li class="list-group-item d-flex justify-content-between align-items-center px-0">
    <span><strong><?= e($s['id']) ?></strong> <?= e($s['course']) ?><br><small class="text-muted"><?= e($DATA['faculty'][$s['fac']]['name']) ?></small></span><?= badge($f) ?></li>
  <?php } if (!$any) echo '<li class="list-group-item px-0">No flagged sections this term.</li>'; ?>
  </ul><a class="btn btn-sm btn-outline-primary mt-3" href="actions.php">See recommended actions</a></div></div>
</div>
 </div>
</section>
<?php require 'includes/footer.php'; ?>
