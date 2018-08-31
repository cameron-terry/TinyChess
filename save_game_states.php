<?php
$now = new DateTime();
$preciseNow = $now->format('Y-m-d s-i-H');
$file = 'game_state_' . $preciseNow . '.txt';
file_put_contents($file, file_get_contents('php://input'));

if (file_exists($file)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="'.basename($file).'"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}
?>