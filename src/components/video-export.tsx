'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Download, Share2, Link2 } from 'lucide-react'

interface VideoExportProps {
  video: {
    id: string
    url?: string
    tiktokId?: string
    views: string
    likes: string
    comments?: string
    shares?: string
    author: string
    description: string
    duration?: string
    viralScore?: number
    engagementRate?: number
    trend?: {
      title?: string
      category?: string
    }
  }
  velocity?: number
}

export default function VideoExport({ video }: VideoExportProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const videoId = video.id
  const title = video.trend?.title || video.description?.slice(0, 100) || 'TikTok Video'
  const author = video.author || 'Unknown'
  const views = parseInt(video.views) || 0
  const likes = parseInt(video.likes) || 0
  const comments = parseInt(video.comments || '0')
  const shares = parseInt(video.shares || '0')
  const viralScore = video.viralScore || 0
  const engagementRate = video.engagementRate || 0

  const tiktokUrl = video.url || `https://tiktok.com/@${author}/video/${videoId}`
  const analysisUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/video/${videoId}`
    : `https://tiktok.tubefission.com/video/${videoId}`

  function formatNumber(n: number): string {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
    return n.toLocaleString()
  }

  // Generate TikTok-style PDF report
  async function generatePDF() {
    setIsGenerating(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let y = 20

      // TikTok Brand Header (Dark theme)
      doc.setFillColor(0, 0, 0)
      doc.rect(0, 0, pageWidth, 55, 'F')

      // TikTok logo text
      doc.setTextColor(255, 0, 80) // TikTok Red
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('TikTok', margin, 35)
      doc.setTextColor(0, 242, 234) // TikTok Cyan
      doc.text('Intelligence', margin + 45, 35)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Professional Video Analysis Report', margin, 48)

      // Report metadata
      y = 65
      doc.setFillColor(24, 24, 27) // Zinc-900
      doc.rect(margin, y, pageWidth - margin * 2, 25, 'F')
      doc.setTextColor(161, 161, 170) // Zinc-400
      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin + 5, y + 12)
      doc.text(`Video ID: ${videoId}`, pageWidth - margin - 60, y + 12)
      doc.text(`Creator: @${author}`, margin + 5, y + 20)

      // Video Information Section
      y = 100
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 70, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Video Information', margin + 5, y + 5)

      y += 18
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(161, 161, 170)
      const displayTitle = title.length > 80 ? title.substring(0, 80) + '...' : title
      doc.text(`Title: ${displayTitle}`, margin + 5, y)

      y += 12
      doc.text(`Creator: @${author}`, margin + 5, y)

      y += 12
      doc.text(`TikTok URL: ${tiktokUrl}`, margin + 5, y)

      y += 12
      doc.text(`Duration: ${video.duration || '0:15'}`, margin + 5, y)

      // Performance Metrics with Bar Chart
      y = 180
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Performance Metrics', margin, y)

      // Bar chart
      y += 20
      const chartData = [
        { label: 'Views', value: views, max: Math.max(views, 1000000), color: [0, 242, 234] },
        { label: 'Likes', value: likes, max: Math.max(likes, 100000), color: [255, 0, 80] },
        { label: 'Comments', value: comments, max: Math.max(comments, 10000), color: [16, 185, 129] },
        { label: 'Shares', value: shares, max: Math.max(shares, 5000), color: [245, 158, 11] },
      ]

      const barWidth = (pageWidth - margin * 2) / chartData.length - 10
      const maxBarHeight = 50

      chartData.forEach((item, index) => {
        const x = margin + index * (barWidth + 12)
        const barHeight = Math.min((item.value / item.max) * maxBarHeight, maxBarHeight)

        // Draw bar background
        doc.setFillColor(39, 39, 42)
        doc.rect(x, y + maxBarHeight - barHeight, barWidth, barHeight, 'F')

        // Draw colored bar
        doc.setFillColor(item.color[0], item.color[1], item.color[2])
        doc.rect(x, y + maxBarHeight - barHeight, barWidth, barHeight, 'F')

        // Label
        doc.setTextColor(161, 161, 170)
        doc.setFontSize(8)
        doc.text(item.label, x + barWidth / 2 - 10, y + maxBarHeight + 10)

        // Value
        doc.setFontSize(7)
        doc.setTextColor(255, 255, 255)
        const valueText = formatNumber(item.value)
        doc.text(valueText, x + 3, y + maxBarHeight - barHeight + 10)
      })

      // Stats Summary
      y += 80
      const stats = [
        { label: 'Total Views', value: formatNumber(views), color: [0, 242, 234] },
        { label: 'Total Likes', value: formatNumber(likes), color: [255, 0, 80] },
        { label: 'Engagement Rate', value: `${engagementRate.toFixed(2)}%`, color: [16, 185, 129] },
        { label: 'Viral Score', value: `${viralScore.toFixed(0)}/100`, color: [245, 158, 11] },
      ]

      stats.forEach((stat, index) => {
        const x = margin + index * ((pageWidth - margin * 2) / 4)
        const boxWidth = (pageWidth - margin * 2) / 4 - 8

        doc.setFillColor(stat.color[0], stat.color[1], stat.color[2])
        doc.rect(x, y, boxWidth, 35, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.text(stat.label.toUpperCase(), x + 5, y + 12)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(stat.value, x + 5, y + 28)
      })

      // Engagement Distribution (Pie Chart)
      y += 60
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Engagement Distribution', margin, y)

      y += 20
      const totalEngagement = likes + comments * 2 + shares * 3
      const chartX = margin + 40
      const chartY = y + 30
      const radius = 25

      // Draw pie segments
      // let currentAngle = 0
      const segments = [
        { value: likes, label: 'Likes', color: [0, 242, 234] },
        { value: comments * 2, label: 'Comments', color: [255, 0, 80] },
        { value: shares * 3, label: 'Shares', color: [16, 185, 129] },
      ]

      segments.forEach((seg) => {
        if (totalEngagement > 0 && seg.value > 0) {
          // const angle = (seg.value / totalEngagement) * 360
          doc.setFillColor(seg.color[0], seg.color[1], seg.color[2])
          // Draw segment (simplified as circle sectors)
          doc.ellipse(chartX, chartY, radius, radius, 'F')
        }
      })

      // Legend
      y -= 5
      segments.forEach((seg, index) => {
        const legendY = y + index * 15
        doc.setFillColor(seg.color[0], seg.color[1], seg.color[2])
        doc.rect(margin + 90, legendY, 8, 8, 'F')
        doc.setTextColor(161, 161, 170)
        doc.setFontSize(9)
        doc.text(`${seg.label}: ${formatNumber(seg.value)}`, margin + 102, legendY + 6)
      })

      // AI Analysis Section
      y += 90
      if (y > 240) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(255, 0, 80)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('AI Analysis Insights', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 80, 'F')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(161, 161, 170)

      const likeRate = views > 0 ? ((likes / views) * 100).toFixed(2) : '0'
      const commentRate = views > 0 ? ((comments / views) * 100).toFixed(3) : '0'

      doc.text(`Engagement Rate: ${engagementRate.toFixed(2)}% (TikTok avg: 5-8%)`, margin + 5, y + 10)
      doc.text(`Like-to-View Ratio: ${likeRate}%`, margin + 5, y + 25)
      doc.text(`Comment-to-View Ratio: ${commentRate}%`, margin + 5, y + 40)
      doc.text(`Viral Score: ${viralScore.toFixed(0)}/100`, margin + 5, y + 55)

      // Data Analysis Conclusions
      y += 95
      doc.setFillColor(0, 242, 234)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Data Analysis Conclusions', margin + 5, y)

      y += 12
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 50, 'F')
      doc.setTextColor(0, 242, 234)
      doc.setFontSize(10)

      const conclusions = []
      if (engagementRate > 8) {
        conclusions.push(`• Excellent engagement rate (${engagementRate.toFixed(2)}%) - Above TikTok average`)
      } else if (engagementRate > 5) {
        conclusions.push(`• Good engagement rate (${engagementRate.toFixed(2)}%) - Average performance`)
      } else {
        conclusions.push(`• Below average engagement (${engagementRate.toFixed(2)}%) - Optimization needed`)
      }

      if (views > 1000000) {
        conclusions.push('• Viral content with 1M+ views')
      } else if (views > 100000) {
        conclusions.push('• Strong performance with 100K+ views')
      }

      if (viralScore > 70) {
        conclusions.push('• High viral potential detected')
      }

      conclusions.forEach((conclusion, index) => {
        doc.text(conclusion, margin + 5, y + 10 + index * 12)
      })

      // Recommendations
      y += 65
      if (y > 240) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(255, 0, 80)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Key Recommendations', margin + 5, y)

      y += 12
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 65, 'F')
      doc.setTextColor(255, 0, 80)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      const recommendations = [
        '• Analyze the hook in first 3 seconds',
        '• Study the caption strategy used',
        '• Note the hashtag combinations',
        '• Observe the audio/sound selection',
        '• Apply similar tactics to your content',
      ]

      recommendations.forEach((rec, index) => {
        doc.text(rec, margin + 5, y + 10 + index * 12)
      })

      // Footer
      doc.setFillColor(0, 0, 0)
      doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F')
      doc.setTextColor(161, 161, 170)
      doc.setFontSize(8)
      doc.text('Generated by TikTok Intelligence - tiktok.tubefission.com', margin, doc.internal.pageSize.getHeight() - 10)
      doc.text('tiktok.tubefission.com', pageWidth - margin - 50, doc.internal.pageSize.getHeight() - 10)

      doc.save(`tiktok-intelligence-report-${videoId}.pdf`)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function copyVideoUrl() {
    try {
      await navigator.clipboard.writeText(tiktokUrl)
      alert('TikTok URL copied to clipboard!')
    } catch {
      alert('Failed to copy URL')
    }
  }

  function shareToSocial(platform: string) {
    const text = encodeURIComponent(`Check out this TikTok analysis: ${title} by @${author}`)
    const url = encodeURIComponent(analysisUrl)

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
    setShowShareMenu(false)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        variant="outline"
        className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
      >
        <Download className="w-4 h-4 mr-2" />
        {isGenerating ? 'Generating...' : 'Export PDF'}
      </Button>

      <Button
        onClick={copyVideoUrl}
        variant="outline"
        className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
      >
        <Link2 className="w-4 h-4 mr-2" />
        Copy URL
      </Button>

      <div className="relative">
        <Button
          onClick={() => setShowShareMenu(!showShareMenu)}
          variant="outline"
          className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        {showShareMenu && (
          <div className="absolute bottom-full left-0 mb-2 bg-zinc-900 rounded-xl border border-zinc-700 p-2 z-50 min-w-[160px]">
            <button
              onClick={() => shareToSocial('twitter')}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-lg transition text-left text-white text-sm"
            >
              <span className="w-4 h-4 text-blue-400">𝕏</span>
              Twitter
            </button>
            <button
              onClick={() => shareToSocial('facebook')}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-lg transition text-left text-white text-sm"
            >
              <span className="w-4 h-4 text-blue-600">f</span>
              Facebook
            </button>
            <button
              onClick={() => shareToSocial('linkedin')}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-lg transition text-left text-white text-sm"
            >
              <span className="w-4 h-4 text-blue-700">in</span>
              LinkedIn
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
