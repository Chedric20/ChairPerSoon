<?php
$host = $_SERVER['HTTP_HOST'] ?? '';
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
$scheme = $https ? 'https' : 'http';
$path = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
$base = $scheme . '://' . $host . $path;

header('Content-Type: text/plain; charset=utf-8');
echo "User-agent: *\nAllow: /\nSitemap: {$base}/sitemap.xml\n";
