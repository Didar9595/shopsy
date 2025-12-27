import React from 'react'
import Image from 'next/image'
import {ChevronRightIcon} from 'lucide-react'
import { assets } from '../../../assets/assets'

function Banner2() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  return (
    <div className="relative w-full flex flex-col justify-center bg-cyan-200 rounded-3xl xl:min-h-[440px] group overflow-hidden">
  <div className="p-5 sm:p-5 z-10"> 
    <div className="inline-flex items-center gap-3 bg-cyan-300 text-cyan-700 pr-4 p-1 rounded-full text-xs sm:text-sm">
      <span className="bg-cyan-600 px-3 py-1 rounded-full text-white text-xs">NEW</span>
      Free Shipping on Orders Above {currency}500
      <ChevronRightIcon className="group-hover:ml-2 transition-all" size={16} />
    </div>

    <h2 className="text-xl sm:text-3xl leading-tight my-4 font-medium bg-gradient-to-r from-slate-700 to-green-600 bg-clip-text text-transparent max-w-md">
      Gadgets you will love. Prices you will trust.
    </h2>

    <div className="text-slate-800 text-sm font-medium mt-6">
      <p>Starts from</p>
      <p className="text-3xl">{currency}490</p>
    </div>

    <button className="bg-slate-800 text-white text-sm py-3 px-8 mt-6 rounded-md hover:bg-slate-900 hover:scale-105 active:scale-95 transition">
      LEARN MORE
    </button>
  </div>

  <Image
    src={assets.product_img2}
    alt=""
    className="sm:absolute top-[-100] right-0 w-full sm:max-w-sm"
  />
</div>

  )
}

export default Banner2
