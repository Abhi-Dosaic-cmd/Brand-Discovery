/**
 * GOOGLE APPS SCRIPT: WEB APP ENDPOINT FOR CUSTOM FORM
 * Use this to receive data from your custom Brand Discovery Web App and save it to a sheet.
 * 
 * TO DEPLOY:
 * 1. Go to script.google.com
 * 2. Paste this code.
 * 3. Click 'Deploy' -> 'New Deployment'.
 * 4. Select 'Web App'.
 * 5. Execute as: 'Me'.
 * 6. Who has access: 'Anyone'.
 * 7. COPY the 'Web App URL' and paste it into your script.js file.
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait for 10 seconds for other processes to finish

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Web App Submissions") || ss.getSheets()[0];
    
    // Fallback: If no sheet exists or is named correctly, create/use the first one
    if (sheet.getName() !== "Web App Submissions") {
      try {
        sheet = ss.insertSheet("Web App Submissions");
      } catch (err) {
        // Just use the existing first sheet if insert fails
      }
    }

    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (i) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    // --- Dynamic Column Management ---
    const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    
    // If sheet is brand new/empty
    if (headers[0] === "") {
      const firstHeaders = ["Timestamp", ...Object.keys(data)];
      sheet.appendRow(firstHeaders);
      sheet.getRange(1, 1, 1, firstHeaders.length).setFontWeight("bold");
    }

    // Refresh headers
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = currentHeaders.map(header => {
      if (header === "Timestamp") return new Date();
      return data[header] || "";
    });

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Helper to test if script is working
function doGet() {
  return ContentService.createTextOutput("Endpoint is active. Use POST to submit data.");
}
