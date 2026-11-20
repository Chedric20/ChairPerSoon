<?php
const MIN_RESPONDENTS = 5;   // privacy + reliability threshold
const FAIL_LIMIT = 25;       // % failure that triggers review
const SETE_LOW = 3.0;        // criterion score considered low

$DATA = require __DIR__ . '/data.php';

function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function pass_rate($s) { return round($s['passed'] / $s['size'] * 100, 1); }
function drop_rate($s) { return round($s['dropped'] / $s['size'] * 100, 1); }
function fail_rate($s) { return round(100 - pass_rate($s) - drop_rate($s), 1); }
function sete_visible($s) { return $s['resp'] >= MIN_RESPONDENTS; }
function sete_overall($s) { return round(array_sum($s['sete']) / count($s['sete']), 2); }
function sete_low_criteria($s) { return array_keys(array_filter($s['sete'], fn($v) => $v < SETE_LOW)); }
function trend_dir($s) {
  $t = $s['trend'];
  if ($t[0] < $t[1] && $t[1] < $t[2]) return 'up';
  if ($t[0] > $t[1] && $t[1] > $t[2]) return 'down';
  return 'flat';
}

// Integrated rule (only possible with the proposed portal + SETE integration)
function section_flag($s) {
  $low = sete_visible($s) ? sete_low_criteria($s) : [];
  if (fail_rate($s) > FAIL_LIMIT && $low) return 'red';
  if (fail_rate($s) > FAIL_LIMIT || $low || trend_dir($s) === 'down') return 'yellow';
  if (trend_dir($s) === 'up' && sete_visible($s)) return 'green';
  return 'none';
}

function recommend($s, $fac) {
  $f = section_flag($s); $low = sete_low_criteria($s); $out = [];
  if ($f === 'red') {
    $out[] = ['Red', "{$s['id']} ({$fac}): failure rate " . fail_rate($s) . "% with low " . implode(', ', $low) . '.',
              'Schedule a classroom observation, offer an instructional workshop, and arrange tutoring for failing students.'];
  } elseif ($f === 'yellow') {
    $why = $low ? 'low ' . implode(', ', $low) : (fail_rate($s) > FAIL_LIMIT ? 'high failure rate' : 'declining SETE trend');
    $out[] = ['Yellow', "{$s['id']} ({$fac}): {$why}.", 'Hold a consultation with the faculty member and monitor next term.'];
  } elseif ($f === 'green') {
    $out[] = ['Green', "{$s['id']} ({$fac}): SETE improved three terms in a row.", 'Invite as a peer mentor and share the practices used.'];
  }
  return $out;
}

function student_flag($st) {
  $g = $st['grades'];
  if ($g[0] > $g[1] && $g[1] > $g[2]) return ['Yellow', 'Grades fell two terms in a row: advising referral.'];
  if ($st['failed'] >= 3 || ($st['dropped'] !== null && $st['dropped'] >= 2)) return ['Yellow', 'Repeated failures or drops: check study load.'];
  return ['None', 'On track.'];
}

function program_kpis($d) {
  $n = array_sum(array_column($d['sections'], 'size'));
  $p = array_sum(array_column($d['sections'], 'passed'));
  $dr = array_sum(array_column($d['sections'], 'dropped'));
  $vis = array_filter($d['sections'], 'sete_visible');
  return [
    'pass' => round($p / $n * 100, 1), 'drop' => round($dr / $n * 100, 1), 'fail' => round(100 - $p / $n * 100 - $dr / $n * 100, 1),
    'sete' => round(array_sum(array_map('sete_overall', $vis)) / count($vis), 2),
    'flagged' => count(array_filter($d['sections'], fn($s) => in_array(section_flag($s), ['red', 'yellow']))),
    'resp' => round(array_sum(array_column($d['sections'], 'resp')) / $n * 100),
  ];
}
function badge($flag) {
  $m = ['red'=>['danger','Review'],'yellow'=>['warning text-dark','Watch'],'green'=>['success','Strong'],'none'=>['secondary','Normal']];
  return '<span class="badge bg-' . $m[$flag][0] . '">' . $m[$flag][1] . '</span>';
}
