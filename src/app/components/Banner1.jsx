import React from 'react'
import Image from 'next/image'
import {ChevronRightIcon} from 'lucide-react'
import { assets } from '../../../assets/assets'

function Banner1() {
  return (
    <div className="relative w-full flex flex-col bg-slate-900 rounded-3xl xl:min-h-[420px] group overflow-hidden">
  <div className="p-5 sm:p-16 z-10">
    <div className="inline-flex items-center gap-3 bg-slate-800 text-slate-200 pr-4 p-1 rounded-full text-xs sm:text-sm">
      <span className="bg-yellow-500 px-3 py-1 rounded-full text-black text-xs">MEGA</span>
      Limited Time Mega Sale
      <ChevronRightIcon className="group-hover:ml-2 transition-all" size={16} />
    </div>

    <h2 className="text-3xl sm:text-5xl leading-tight my-4 font-medium bg-gradient-to-r from-white to-yellow-400 bg-clip-text text-transparent max-w-md">
      Biggest deals of the season.
    </h2>

    <div className="text-slate-200 text-sm font-medium mt-6">
      <p>Up to</p>
      <p className="text-3xl">70% OFF</p>
    </div>

    <button className="bg-yellow-400 text-black text-sm py-3 px-8 mt-6 rounded-md hover:bg-yellow-500 hover:scale-105 active:scale-95 transition">
      GRAB DEALS
    </button>
  </div>

  <Image
    src={assets.product_img14}
    alt=""
    className="sm:absolute bottom-0 right-24 w-full sm:max-w-sm p-5"
  />
</div>

  )
}

export default Banner1
