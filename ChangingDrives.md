# Changing Google Drives

To transfer your data files to a new Google Drive:
1. Get access
1. Transfer the files
1. Update file links in the spreadsheet
1. Recreate the archive
1. Update file links in the frontend
1. Test the updated site

## Get access
Firstly someone with _Manager_ access to the new Drive needs to:

1. In the new Drive, create a target folder into which the content will be copied. This could be named after the newspaper being clipped, e.g. **The Leader**.
1. Share the target folder to someone with access to the old Drive, by adding them as an _Editor_ on the folder (see [instructions](https://support.google.com/a/users/answer/9310248?hl=en)).
1. Email them a link to the new folder.

## Transfer the files
Then someone with access to the old Drive needs to:

1. Open the source folder in [Google Drive's My Drive](https://drive.google.com/drive/my-drive).
1. Type **Ctrl-A** to select all contents of the source folder.
1. Right-click on the source folder, and select **Move to**.
1. In the dialog which opens, navigate up the folder tree, out of My Drive, into _Shared with me_, select the target folder and click **MOVE**. This will move all newsclip content to the new Drive.

## Update file links in the spreadsheet

1. Open the newsclip spreadsheet in the new Drive under _Shared with me_. In our environment this is in **The Leader** folder and is called **Leader ecoNews - EDIT**.
1. From the sheets menu select **Tools > Script Editor**. This will open the script editor in a new browser tab and display the source of the **addLinks** script.
1. Repeat these steps for each sheet of stories in the spreadsheet:
    1. Select the browser tab with the newsclip spreadsheet.
    1. In the **Link** column (column H), delete all content other than the heading **Link** in the first row.
    1. Select the browser tab with the **addLinks** script.
    1. Click **Run**. This will add all missing links in the currently selected sheet.

## Recreate the archive

1. Open the subfolder containing JSON files in the new Drive under _Shared with me_. In our environment this subfolder is called **TheLeader_public**. In this folder you will see four files with names ending in **.JSON**.
1. Right-click and **Remove** the two newsclip archive files, which have names contain a range of years. In our environment, these are called:
    * econews_stories_2013-2020.json
    * econews_meta_2013-2020.json
1. Open **updateWeb** in the **The Leader** folder.
1. Click **Run** to run updateWeb and recreate the archive files.

## Update file links in the frontend

Edit a file on your website:
1. open the index.php file in a text or code editor.
1. Locate the lines like these ones near the top of the file:
    ```php
    $meta_json_id = '0B4rKiNtdxe1NVEFnTmkzYTJlalU';  // econews_meta.json
    $data_json_id = '0B4rKiNtdxe1Nd2ZtLUU2a3gxMEk'; // econews.json
    ```
Copy the new Drive links into the PHP file:
1. In your web browser, in **TheLeader_public** folder in the new Drive, right-click the **econews.json** file and select **Get Link**, then click **Copy Link**.
1. In your text editor, in the line beginning `$data_json_id`, select the ID value (e.g. `0B4rKiNtdxe1Nd2ZtLUU2a3gxMEk`), and replace it by pasting the link you just copied, e.g.
    ```php
     $data_json_id = 'https://drive.google.com/file/d/1qQnt4mf-HfxdLuWl1Uxs0PpDxDNR4iNa/view?usp=sharing'; // econews.json
    ```
1. From the link you just pasted, delete everything other than the ID itself, leaving the line with just the new ID, e.g.:
    ```php
     $data_json_id = '1qQnt4mf-HfxdLuWl1Uxs0PpDxDNR4iNa'; // econews.json
    ```
1. Now repeat the above steps for the **econews_meta.json** file, copying, pasting and trimming its file ID to leave a line like this:
    ```php
     $meta_json_id = '1YnSQBZaE1D8Trligzz7U7sR-Rgof7YtI'; // econews_meta.json
    ```

## Test the updated site

Open your newsclip site in a browser and check that the stories appear with images OK. Scroll back or use the filters to check a few previous years.