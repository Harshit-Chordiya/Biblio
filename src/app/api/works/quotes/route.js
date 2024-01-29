const cheerio = require("cheerio");
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req, res) => {
const body = await req.json();
    const scrapeURL = body.queryURL.split("?")[0];
    try {
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
      const bookURL = $("div.leftContainer > a.leftAlignedImage").attr("href");
      const image = $("div.leftContainer > a.leftAlignedImage > img").attr(
        "src"
      );
      const name = $("div.mainContentFloat > h1").text();

      const quotes = $(
        "div.mainContent > div.mainContentFloat > div.leftContainer > div.quotes > div.quote"
      )
        .map((i, el) => {
          const $el = $(el);
          const text = $el
            .find("div.quote > div.quoteDetails > div.quoteText")
            .text()
            .split(" ―")[0];
          const author = $el
            .find(
              "div.quote > div.quoteDetails > div.quoteText > span.authorOrTitle"
            )
            .text();
          const book = $el
            .find(
              "div.quote > div.quoteDetails > div.quoteText > span > a.authorOrTitle"
            )
            .text();
          /*           const quoteBookURL = $el
            .find(
              "div.quote > div.quoteDetails > div.quoteText > span > a.authorOrTitle"
            )
            .attr("href"); */
          const likes = $el
            .find(
              " div.quoteDetails > div.quoteFooter > div.right > a.smallText"
            )
            .text();
          const id = i + 1;
          return {
            id: id,
            text: text,
            author: author,
            book: book,
            likes: likes,
          };
        })
        .toArray();

      const lastScraped = new Date().toISOString();



      const respData = {
        status: "Received",
        source: "https://github.com/nesaku/biblioreads",
        scrapeURL: scrapeURL,
        bookURL: bookURL,
        image: image,
        name: name,
        quotes: quotes,
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

