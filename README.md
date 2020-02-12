# dvoa-scraper

This is a quick and (very) dirty script to scrape all years of overall team efficiency (DVOA) data from [Football Outsiders](https://www.footballoutsiders.com/).

I created this script for the sole purpose of quickly extracting DVOA data to put in a separate data source to make analysis easier. I could have probably done this quicker and cleaner with Python + BeautifulSoup (since I'm more familiar with how that is supposed to be used, compared to Cheerio) but I didn't feel like context-switching languages since I mainly use JavaScript currently and was able to make it work.

I have committed the [out](./out) directory that contains all of the generated json files (up to 2019 at the time of publish) in case somebody just wants to play with the data without having to run the script.

## Usage notes

- If the most recent league year was not 2019, you will want to update `YEAR_END` in `index.js`.
- This is currently only designed to work with the "Overall Team Efficiency" page for each season. I could have made it more flexible by converting rows into objects based on their table headings, but do not currently have a need for that.
- This may not follow conventions for using [cheerio](https://www.npmjs.com/package/cheerio), particularly with the way I looped through rows and found the data from each cell.

## Future improvements if I ever find a need or desire to do so

- [ ] Making this functionality more flexible so that it can work for other DVOA pages from Football Outsiders
- [ ] Doing some parsing and cleanup of the data (converting ranks and percentages to numbers, normalizing team abbreviations by franchise)
