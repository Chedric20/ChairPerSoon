<?php
require_once __DIR__ . '/functions.php';
$page = basename($_SERVER['PHP_SELF']);
$navItems = [
  'dashboard.php' => ['label' => 'Overview', 'icon' => '◫'],
  'sections.php' => ['label' => 'Sections', 'icon' => '▤'],
  'faculty.php' => ['label' => 'Faculty', 'icon' => '♙'],
  'students.php' => ['label' => 'Student watchlist', 'icon' => '◎'],
  'actions.php' => ['label' => 'Recommended actions', 'icon' => '✳'],
];
$pageDescriptions = [
  'dashboard.php' => 'A clear view of teaching outcomes and sections that may need support.',
  'sections.php' => 'Compare section outcomes, SETE scores, and teaching trends.',
  'faculty.php' => 'Review teaching profiles and SETE results in context.',
  'students.php' => 'Find students who may benefit from additional academic support.',
  'actions.php' => 'Turn the current analytics into practical next steps.',
];
?>
<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title ?? 'ChairPerSoon') ?> | ChairPerSoon</title>
<meta name="description" content="<?= e($pageDescriptions[$page] ?? 'Explore program academic and teaching analytics in ChairPerSoon.') ?>">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ChairPerSoon">
<meta property="og:title" content="<?= e($title ?? 'ChairPerSoon') ?> | ChairPerSoon">
<meta property="og:description" content="<?= e($pageDescriptions[$page] ?? 'Explore program academic and teaching analytics in ChairPerSoon.') ?>">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="assets/css/style.css" rel="stylesheet">
</head><body>
<div class="app-layout">
<aside class="app-nav">
  <a class="brand-lockup" href="dashboard.php">
  <span class="brand-mark" aria-hidden="true">CPS</span>
  <span class="brand-copy"><strong>ChairPerSoon</strong><small>Academic analytics</small></span>
 </a>
 <div class="mobile-nav-heading">
  <p class="nav-section-label">Workspace</p>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu">
   <span></span><span></span><span></span>
  </button>
 </div>
 <nav class="nav flex-column" id="primary-navigation" aria-label="Main navigation">
    <?php foreach ($navItems as $f => $item): ?>
     <a class="nav-link <?= $page === $f ? 'active' : '' ?>" href="<?= $f ?>" <?= $page === $f ? 'aria-current="page"' : '' ?>>
      <span class="nav-link-icon" aria-hidden="true"><?= e($item['icon']) ?></span><span><?= e($item['label']) ?></span>
     </a>
    <?php endforeach; ?>
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
 <div class="breadcrumbs"><span>ChairPerSoon</span><span class="breadcrumb-divider">/</span><strong><?= e($title ?? '') ?></strong></div>
 <div class="term-chip"><span class="term-indicator" aria-hidden="true"></span><span class="program-name"><?= e($DATA['program']) ?></span><span class="term-divider"></span><span>Term <?= e(end($DATA['terms'])) ?></span></div>
</header>
<main class="app-main">
<section class="page-heading">
 <p class="page-eyebrow">PROGRAM ANALYTICS</p>
 <h1 class="page-title"><?= e($title ?? '') ?></h1>
 <p class="page-description"><?= e($pageDescriptions[$page] ?? 'Explore academic and teaching insights.') ?></p>
</section>
