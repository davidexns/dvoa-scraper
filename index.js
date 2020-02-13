const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE_URL = "https://www.footballoutsiders.com/stats/nfl/team-efficiency/";
const YEAR_START = 1986;
const YEAR_END = 2019;
const LESS_COLUMNS = [1986, 1987, 1988, 1989, 1991];
const EXTRA_COLUMNS = 2018;

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
    ,
    ,
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
    ,
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
    record,
    offenseDVOA,
    offenseRank,
    defenseDVOA,
    defenseRank,
    stDVOA,
    stRank
  };
}

function parseExtraColumnsRow(row) {
  const [
    rank,
    team,
    totalDVOA,
    ,
    ,
    ,
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
    record,
    offenseDVOA,
    offenseRank,
    defenseDVOA,
    defenseRank,
    stDVOA,
    stRank
  };
}

const percentageToNumber = percent => +percent.replace("%", "");

function normalizeData(raw) {
  const games = raw.record
    .trim()
    .split("-")
    .map(num => +num);

  return {
    rank: +raw.rank,
    team: raw.team,
    totalDVOA: percentageToNumber(raw.totalDVOA),
    wins: games[0],
    games: games.reduce((acc, cur) => acc + cur, 0),
    offenseDVOA: percentageToNumber(raw.offenseDVOA),
    offenseRank: +raw.offenseRank,
    defenseDVOA: percentageToNumber(raw.defenseDVOA),
    defenseRank: +raw.defenseRank,
    stDVOA: percentageToNumber(raw.stDVOA),
    stRank: +raw.stRank
  };
}

function scrape(html, rowParser) {
  const rows = getRows(html);
  const teamRanks = rows
    .map(rowParser)
    .filter(team => team.team)
    .map(normalizeData);
  return teamRanks;
}

function writeToJson(name, data) {
  fs.writeFile(`./out/${name}.json`, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error(err);
    }
  });
}

function getRowParser(year) {
  if (LESS_COLUMNS.includes(year)) {
    return parseSansLastYearRow;
  } else if (year === EXTRA_COLUMNS) {
    return parseExtraColumnsRow;
  }
  return parseFullTableRow;
}

async function scrapeYear(year) {
  const html = await fetchForYear(year);

  const rowParser = getRowParser(year);
  return scrape(html, rowParser);
}

async function runner() {
  let fullData = {};

  for (let year = YEAR_START; year <= YEAR_END; year++) {
    const yearData = await scrapeYear(year);
    // write individual year file
    writeToJson(`season-${year}`, yearData);
    fullData[String(year)] = yearData;
  }

  // write full file
  writeToJson(`all-seasons`, fullData);
}

// This is what runs the script
runner();
