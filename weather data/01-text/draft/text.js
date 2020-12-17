async function getWords() {

  // 1. Access data
  const spreadsheet = await d3.json("https://spreadsheets.google.com/feeds/list/1DLdcP-2n_q8kJ-yxlD3mTdUzhoQbZNCLE6cVDcqVKSQ/od6/public/values?alt=json")
  const dataset = spreadsheet.feed.entry[0]["gsx$data"];
  console.log(dataset)
  var data = {
  	data: spreadsheet.feed.entry[0]['gsx$data']['t'],
  }
  console.log(data);
}
getWords();
