<?php
// Local prototype data, shared with the static build (scripts/build.mjs).
// Edit includes/data.json to change it. No database connection is required.
return json_decode(file_get_contents(__DIR__ . '/data.json'), true, 512, JSON_THROW_ON_ERROR);
