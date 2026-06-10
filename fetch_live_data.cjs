const https = require('https');
const fs = require('fs');

const url = 'https://firestore.googleapis.com/v1/projects/zahau-music-school/databases/(default)/documents/courses';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.documents) {
        const courses = json.documents.map(doc => {
          const fields = doc.fields;
          const course = {};
          for (const key in fields) {
            const valObj = fields[key];
            if (valObj.stringValue !== undefined) {
              course[key] = valObj.stringValue;
            } else if (valObj.integerValue !== undefined) {
              course[key] = parseInt(valObj.integerValue, 10);
            } else if (valObj.booleanValue !== undefined) {
              course[key] = valObj.booleanValue;
            } else if (valObj.arrayValue !== undefined) {
              course[key] = (valObj.arrayValue.values || []).map(v => v.stringValue || v);
            } else {
              course[key] = valObj;
            }
          }
          return course;
        });
        console.log("Success! Found courses:");
        console.log(JSON.stringify(courses, null, 2));
        fs.writeFileSync('live_courses.json', JSON.stringify(courses, null, 2));
      } else {
        console.log("No documents found:", json);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
      console.log("Raw response:", data);
    }
  });
}).on('error', (err) => {
  console.error("HTTP error:", err);
});
