Issues
======
## Image file name inconsistencies
/1. RENAME TheLeader_2021-03-10_p01and2.jpg TheLeader_2021-03-10_p01.jpg ?

/2. RENAME TheLeader_2021-03-03_p28e.jpg TheLeader_2021-03-03_p28d.jpg ? (d is missing)

/3. Converted all 2021-03-03 png's to jpg's. Deleted png's /offline and /online

/4. Move January to 2021-01 folder

/Update spreadsheet with Sharing URLs of new jpgs (as above)
 /1 - no need (rename doesn't change file URL)
 /2
 /3
 /4 - no need (move doesn't change file URL)

## Suffix code is wrong:
2021 row 2: =if(B2="","",if(A3&B2=A2&B1,char(code(C1)+1),if(A3&B2=A4&B3,"a","")))
2020 row 2: =if(B2="","",if(A3&B2=A2&B1,char(code(C1)+1),if(A3&B2=A4&B3,"a","")))

Correct:
2019 row 2: =if(B2="","",if(A2&B2=A1&B1,char(code(C1)+1),if(A2&B2=A3&B3,"a","")))

But even for correct code, the files are not saved with suffix 'a',
because the next line hasn't been written by the time the user is writing this line.

/Change the code in all years:
  /2009
  /2013
  /2014
  /2015
  /2016
  /2017
  /2018
  /2019
  /2020
  /2021
... to do what the user is doing:
E.g.:
TheLeader_2018-01-10_p12.jpg
TheLeader_2018-01-10_p12b.jpg

Not:
TheLeader_2018-01-10_p12a.jpg
TheLeader_2018-01-10_p12b.jpg

## Update the website
/Transfer details from Libre Calc to Google sheet for:
  /17/3/2021
  /24/3/2021

/Add image links and online links
  /17/3/2021
  /24/3/2021

[ ] Run updateweb for all stories since 2021-03-10 (inclusive)

## Send emails
[ ] Draft mailchimp emails for:
  17/3/2021
  24/3/2021

## Security alert on running updateweb

Can proceed to 'Advanced' to run it anyway.

## Site not loading

New Chrome restriction prevents Cross-Origin access to JavaScript file.

=> Replace with JSON file.

Need FTP access to site to load and test solutions.

# Transfer to SSEC Google Drive

## Replace File IDs with new IDs

Can list File IDs for each folder with the script here:
https://webapps.stackexchange.com/questions/86846/getting-all-files-file-id-from-a-folder-in-google-drive

