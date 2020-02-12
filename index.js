const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE_URL = "https://www.footballoutsiders.com/stats/nfl/team-efficiency/";
const YEAR_START = 1986;
const YEAR_END = 2019;
const EXPANDED_COLUMNS = 1992;

async function fetchForYear(year) {
  return await fetch(`${BASE_URL}${year}`)
    .then(res => res.text())
    .then(body => body);
}

function getRows(html) {
  const $ = cheerio.load(html);
  return Object.values(
    $("tbody")
      .first()
      .find("tr")
  ).filter(row => row.name === "tr");
}

function getCellData(row) {
  return row.children
    .filter(cell => cell.name === "td")
    .map(cell => cell.children[0].data);
}

function parseFullTableRow(row) {
  const [
    rank,
    team,
    totalDVOA,
    _,
    nonAdjTotalDVOA,
    record,
    offenseDVOA,
    offenseRank,
    defenseDVOA,
    defenseRank,
    stDVOA,
    stRank
  ] = getCellData(row);

  return {
    rank,
    team,
    totalDVOA,
    nonAdjTotalDVOA,
    record,
    offenseDVOA,
    offenseRank,
    defenseDVOA,
    defenseRank,
    stDVOA,
    stRank
  };
}

function parseSansLastYearRow(row) {
  const [
    rank,
    team,
    totalDVOA,
    nonAdjTotalDVOA,
    record,
    offenseDVOA,
    offenseRank,
    defenseDVOA,
    defenseRank,
    stDVOA,
    stRank
  ] = getCellData(row);

  return {
    rank,
    team,
    totalDVOA,
    nonAdjTotalDVOA,
    record,
    offenseDVOA,
    offenseRank,
    defenseDVOA,
    defenseRank,
    stDVOA,
    stRank
  };
}

function scrape(html, rowParser) {
  const rows = getRows(html);
  const teamRanks = rows.map(rowParser);
  return teamRanks.filter(team => team.team);
}

function writeToJson(year, data) {
  fs.writeFile(
    `./out/season-${year}.json`,
    JSON.stringify(data, null, 2),
    err => {
      if (err) {
        console.error(err);
      }
    }
  );
}

async function scrapeAndWrite(year) {
  const html = await fetchForYear(year);
  const rowParser =
    year < EXPANDED_COLUMNS ? parseSansLastYearRow : parseFullTableRow;
  const data = scrape(html, rowParser);

  writeToJson(year, data);
}

// This is what runs the script
for (let year = YEAR_START; year <= YEAR_END; year++) {
  scrapeAndWrite(year);
}
