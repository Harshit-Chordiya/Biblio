"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Header from '@/components/global/Header'
import Footer from '@/components/global/Footer'
import Loader from '@/components/global/Loader'
import ErrorMessage from '@/components/global/ErrorMessage'
import AuthorBookList from '@/components/authorpage/AuthorBookList'

const Slug = ({params}) => {
  const router = useRouter()
  // const { params.slug } = router.query
  const [scrapedData, setScrapedData] = useState({})
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/author/books`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          page: 1,
          queryURL: `https://www.goodreads.com/author/list/${params.slug}`
        })
      })
      if (res.ok) {
        const data = await res.json()
        setScrapedData(data.respData)
      } else {
        setError(true)
      }
    }
    if (params.slug) {
      fetchData()
    }
  }, [params.slug])

  return (
    <div>
      <div className='bg-gradient-to-tr from-rose-50 to-rose-200 dark:bg-gradientedge text-gray-900 dark:text-gray-100 min-h-screen'>
        <Header />
        {error && (
          <ErrorMessage
            status='500'
            url={`https://www.goodreads.com/author/list/${params.slug}`}
          />
        )}
        {!error && (
          <>
            {scrapedData.title === undefined && <Loader other={true} />}
            {scrapedData.error && (
              <ErrorMessage
                status='404'
                url={`https://www.goodreads.com/author/list/${params.slug}`}
              />
            )}
            {scrapedData.title === '' && (
              <ErrorMessage
                status='ScraperError'
                url={`https://www.goodreads.com/author/list/${params.slug}`}
              />
            )}
            {scrapedData && <AuthorBookList scrapedData={scrapedData} />}
          </>
        )}
        <Footer />
      </div>
    </div>
  )
}

export default Slug
