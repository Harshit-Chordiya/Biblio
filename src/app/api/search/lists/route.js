const cheerio = require("cheerio");
import { NextResponse } from 'next/server'

export const POST = async (req, res) => {
    const body = await req.json();
    const scrapeURL = body.queryURL.split("&")[0];

    try {
      const response = await fetch(`${scrapeURL}&search_type=lists`, {
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
          const cover = $el.find("td > div > a > img").attr("src");
          const title = $el.find("td > a").text();
          const listURL = $el.find("td > a").attr("href");
          const rating = $el.find("td > div").text().replaceAll("\n", "");
          const id = i + 1;
          return {
            id: id,
            cover: cover,
            title: title,
            listURL: listURL,
            rating: rating,
          };
        })
        .toArray();
      const lastScraped = new Date().toISOString();
      const respData = {
        status: "Received",
        source: "https://github.com/nesaku/biblioreads",
        scrapeURL: scrapeURL,
        searchType: "lists",
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
    } catch (error) {
      console.error("An error has occurred with the scraper.");
        return NextResponse.json(
          {
            status: "Error - Invalid Query",
            scrapeURL: scrapeURL,
          },
          {
            status: 404
          }
        )
    }
};

