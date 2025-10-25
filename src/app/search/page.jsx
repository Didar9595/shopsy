import React, { Suspense } from 'react'
import SearchContent from '../components/SearchContent'

function page() {
  return (
    <Suspense  fallback={<div className="p-6 text-center">Loading…</div>}>
        <SearchContent/>
    </Suspense>
  )
}

export default page
