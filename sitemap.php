<?php
$host = $_SERVER['HTTP_HOST'] ?? '';
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
$scheme = $https ? 'https' : 'http';
$path = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
$base = $scheme . '://' . $host . $path;
$pages = ['dashboard.php', 'sections.php', 'faculty.php', 'students.php', 'actions.php'];
foreach (['F01', 'F02', 'F03', 'F04'] as $facultyId) {
  $pages[] = 'faculty.php?id=' . $facultyId;
}

header('Content-Type: application/xml; charset=utf-8');
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
foreach ($pages as $page) {
  $url = $base . '/' . $page;
  echo '  <url><loc>' . htmlspecialchars($url, ENT_XML1 | ENT_QUOTES, 'UTF-8') . "</loc></url>\n";
}
echo "</urlset>\n";
