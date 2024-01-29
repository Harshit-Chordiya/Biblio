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
      const image = $("div.bookImage > a > img").attr("src");
      const book = $(
        "div.bookDetails.stacked > h1.communityQABookIndexTitle > a"
      ).text();
      const bookURL = $(
        "div.bookDetails.stacked > h1.communityQABookIndexTitle > a"
      ).attr("href");
      const author = $("div.bookDetails.stacked > div.authorName > a").text();
      const questions = $(
        'div.bigBoxBody > div.bigBoxContent.containerWithHeaderContent > div[id="communityQuestionsWithAnswers"] > div.communityQuestionAndAnswer'
      )
        .map((i, el) => {
          const $el = $(el);
          const date = $el
            .find(
              "div.communityQuestion > div.communityQAFooter.questionFooter > ul.questionFooterActions > li.footerItem.communityQuestionTimestamp > a"
            )
            .text();

          const avatar = $el
            .find(
              "div.communityAnswerBody > div.answererUserIcon > a.leftAlignedImage.userPhoto > img"
            )
            .attr("src");
          const authorName = $el
            .find(
              "div.communityAnswerBody > div.communityAnswerTextContainer > span.communityAnswererName > a"
            )
            .text();
          const authorURL = $el
            .find(
              "div.communityAnswerBody > div.answererUserIcon > a.leftAlignedImage.userPhoto"
            )
            .attr("href");
          const question = $el
            .find("div.communityQuestion > div.questionText > a")
            .text();
          const spoilerQuestion = $el
            .find(
              "div.communityQuestion > div.questionText > div.spoiler > span.spoilerAnswerText > span.spoilerContainer"
            )
            .text();
          const shortAnswer = $el
            .find(
              "div.communityAnswerBody > div.communityAnswerTextContainer > span.communityAnswerText"
            )
            .text();
          const answer = $el
            .find(
              "div.communityAnswerBody > div.communityAnswerTextContainer > span.communityAnswerText > span.expandableContainer > span.fullContent"
            )
            .text();
          const likes = $el
            .find(
              "div.communityQuestion > div.communityQAFooter.questionFooter > ul.questionFooterActions > li.footerItem.like > span.likeItContainer > a > span.likesCount"
            )
            .text();

          const id = i + 1;
          return {
            id: id,
            date: date,
            avatar: avatar,
            authorName: authorName,
            authorURL: authorURL,
            question: question,
            spoilerQuestion: spoilerQuestion,
            shortAnswer: shortAnswer,
            answer: answer,
            likes: likes,
          };
        })
        .toArray();

      const lastScraped = new Date().toISOString();




      const respData = {
        status: "Received",
        source: "https://github.com/nesaku/biblioreads",
        scrapeURL: scrapeURL,
        image: image,
        book: book,
        bookURL: bookURL,
        author: author,
        questions: questions,
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

