<?
    
define('BASE_URL', 'http://ssec.org.au/dev/econews/');
$data_folder = "https://googledrive.com/host/0B4rKiNtdxe1NZ1NKa3ItTXR0RkU/";
$copyright = 'Fairfax Media Limited';

$crawler = (preg_match('/facebookexternalhit|bot|crawl|slurp|spider/i', $_SERVER['HTTP_USER_AGENT']));

// Set meta vars to default
function set_defaults(&$t, &$d, &$u, &$i, &$a) {    
    $t = 'SSEC Leader ecoNews';
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
        $meta_json = 'econews_meta.json';
        $img_prefix = 'https://drive.google.com/uc?id=';
        $paperName = 'Sutherland Shire Leader';

        $json = file_get_contents("$data_folder/$meta_json");
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
    set_defaults($title, $desc, $url, $img, $author);
    include('newsclip.html');
}
