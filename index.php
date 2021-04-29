<?php
    
define('BASE_URL', 'http://ssec.org.au/econews/');
$data_path = 'https://drive.google.com/uc?id=';
$data_json_id = '0B4rKiNtdxe1Nd2ZtLUU2a3gxMEk'; // econews.json
$meta_json_id = '0B4rKiNtdxe1NVEFnTmkzYTJlalU';  // econews_meta.json
$img_prefix = $data_path;
$paperName = 'Sutherland Shire Leader';

$copyright = 'Australian Community Media Pty Ltd';

$crawler = (preg_match('/facebookexternalhit|bot|crawl|slurp|spider/i', $_SERVER['HTTP_USER_AGENT']));

// Set meta vars to default
function set_defaults(&$t, &$d, &$u, &$i, &$a) {    
    $t = 'SSEC Leader EcoNews';
    $d = 'Environmental news monitoring for the Shire. Browse and search over a thousand stories from the Sutherland Shire edition of The Leader newspaper. Stay up-to-date with local environmental news and views.';
    $u = BASE_URL;
    $i = $u.'images/screenshot.jpg';
    $a = $paperName;
}

// User is crawler & URL has s parameter? Set meta vars to story
if ($crawler) {
    $paperTwitterHandle = "@theleadernews";
    if (empty($_GET["s"])) {
        set_defaults($title, $desc, $url, $img, $author);
    } else {
        $story_id = $_GET['s'];

        $json = file_get_contents($data_path.$meta_json_id);
        $meta = json_decode($json, true);

        $author = $meta[$story_id]['author'];
        $date = date_format(date_create($meta[$story_id]['date']), 'F j Y');
        $title = $meta[$story_id]['title'];
        $desc = $paperName.', '.$date;
        $img = $img_prefix.$story_id;
        $url = BASE_URL.'?s='.$story_id;
    }

    include "scraper_template.php";
} else {
    $data = file_get_contents($data_path.$data_json_id);
    set_defaults($title, $desc, $url, $img, $author);
    include('newsclip.html');
}

?>