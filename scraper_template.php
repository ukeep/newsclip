<html>

<head>
    <title>
        <?=$title?>
    </title>

    <!-- for Google -->
    <meta name="description" content="<?=$desc?>"/>
    <!--    <meta name="keywords" content="" />-->
    <meta name="copyright" content="<?=$copyright?>" />
    <!--    <meta name="application-name" content="" />-->

    <?php if(!empty($author)): ?>
        <meta name="author" content="<?=$author?>" />
    <?php endif; ?>

    <!-- for Facebook -->
    <meta property="og:title" content="<?=$title?>"/>
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="<?=$url?>"/>
    <meta property="og:description" content="<?=$desc?>"/>
    <meta property="og:image" content="<?=$img?>"/>

    <!-- for Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="<?=$paperTwitterHandle?>" />
    <meta name="twitter:title" content="<?=$title?>"/>
    <meta name="twitter:description" content="<?=$desc?>"/>
    <meta name="twitter:image" content="<?=$img?>"/>

</head>

</html>
