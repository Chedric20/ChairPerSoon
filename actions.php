<?php $title = 'Recommended actions'; require 'includes/header.php';
$rank = ['Red'=>0,'Yellow'=>1,'Green'=>2]; $items = [];
foreach ($DATA['sections'] as $s) foreach (recommend($s, $DATA['faculty'][$s['fac']]['name']) as $r) $items[] = $r;
usort($items, fn($a, $b) => $rank[$a[0]] <=> $rank[$b[0]]);
$cls = ['Red'=>'danger','Yellow'=>'warning','Green'=>'success']; ?>
<section class="panel page-content-card" aria-label="Recommended action list">
 <div class="page-content-scroll actions-scroll">
  <?php foreach ($items as [$lvl, $why, $do]): ?>
   <article class="panel action-card border-start border-4 border-<?= $cls[$lvl] ?>"><div class="fw-semibold"><?= e($why) ?></div><div class="text-muted"><?= e($do) ?></div></article>
  <?php endforeach; if (!$items) echo '<p class="mb-0">No actions this term.</p>'; ?>
 </div>
</section>
<?php require 'includes/footer.php'; ?>
