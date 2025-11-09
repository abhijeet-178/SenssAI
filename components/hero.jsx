'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import Link from 'next/link'

const HeroSection = () => {
  const imageRef = useRef(null)

  useEffect(() => {
    const imageElement = imageRef.current
    if (!imageElement) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const scrollThreshold = 100

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add('scrolled')
      } else {
        imageElement.classList.remove('scrolled')
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <section className="w-full pt-36 md:pt-48 pb-20 overflow-visible min-h-screen">
      <div className="space-y-6 text-center">
        {/* Title + Subtitle */}
        <div className="space-y-6 mx-auto">
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title">
            Your AI Career Coach for
            <br />
            Professional Success
          </h1>

          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" className="px-8" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Image */}
        <div ref={imageRef} className="hero-image">
          <div className="hero-image-wrapper mt-5 md:mt-0 min-h-[300px]">
            <Image
              src="/banner (2).jpeg"
              width={1280}
              height={720}
              alt="Banner Sensai"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
