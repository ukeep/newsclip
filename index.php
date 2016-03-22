<?php
if (in_array($_SERVER['HTTP_USER_AGENT'], array(
  'facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
))) {
  header("HTTP/1.1 200 OK");
  print '<html prefix="og: http://ogp.me/ns#">
               <head>
                  <title>Title for Facebook crawler 1</title>
                  <meta property="og:title" content="Title for Facebook crawler 2" />
                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="http://ssec.org.au/dev/econews/index.php" />
                  <meta property="og:image" content="https://drive.google.com/uc?export=view&id=0B-5xeZI7ht6TUWk2VkJHbTNIVjQ" />
              </head>
        </html>';
}
else {
  // You're not Facebook agent '__' 
  header('Location: index.html');
}