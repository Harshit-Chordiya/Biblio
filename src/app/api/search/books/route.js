const cheerio = require("cheerio");
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req, res) => {
    const body = await req.json();
    const scrapeURL = body.queryURL.split("&")[0];
    console.log(scrapeURL)
      const response = await fetch(`${scrapeURL}`, {
        method: "GET",
        headers: new Headers({
          "User-Agent":
            process.env.NEXT_PUBLIC_USER_AGENT ||
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
        }),
      });
      const htmlString = await response.text();
      const $ = cheerio.load(htmlString);
      const numberOfResults = $(".leftContainer > h3").text();
      const result = $("table > tbody > tr")
        .map((i, el) => {
          const $el = $(el);
          const cover = $el.find("tr > td > a > img").attr("src");
          const title = $el.find("tr > td:nth-child(2) > a > span").text();
          const bookURL = $el.find("tr > td:nth-child(2) > a").attr("href");
          const author = $el
            .find(
              "tr > td:nth-child(2) > span[itemprop = 'author'] > div > a > span[itemprop = 'name']"
            )
            .html();
          const authorURL = $el
            .find("tr > td:nth-child(2) > span[itemprop = 'author'] > div > a")
            .attr("href")
            .replace("https://www.goodreads.com", "")
            .split("?")[0];
          const rating = $el
            .find(
              "tr > td:nth-child(2) > div > span.greyText.smallText.uitext > span.minirating"
            )
            .text();

          const id = i + 1;
          return {
            id: id,
            cover: cover,
            title: title,
            bookURL: bookURL,
            author: author,
            authorURL: authorURL,
            rating: rating,
          };
        })
        .toArray();

      const lastScraped = new Date().toISOString();
      
      const respData = {
        status: "Received",
        source: "https://github.com/nesaku/biblioreads",
        scrapeURL: scrapeURL,
        searchType: "books",
        numberOfResults: numberOfResults,
        result: result,
        lastScraped: lastScraped,
      }
      return NextResponse.json(
        {message: "ok", respData},
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
          }
        }
      )
     
};

