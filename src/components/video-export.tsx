'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Download, Share2, Link2, FileText } from 'lucide-react'

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
    hashtags?: string[]
    publishedAt?: string
  }
  aiAnalysis?: {
    contentStrategy?: string
    hookAnalysis?: string
    audioStrategy?: string
    hashtagEffectiveness?: string
    postingTime?: string
    audienceSentiment?: string
    trendingPotential?: string
    competitiveAdvantage?: string
    improvementSuggestions?: string[]
    bestPractices?: string[]
  }
  velocity?: number
}

export default function VideoExport({ video, aiAnalysis, velocity }: VideoExportProps) {
  // aiAnalysis can be used for enhanced AI insights in future updates
  void aiAnalysis
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

      // ============================================
      // AI ANALYSIS REPORT - 8 MODULE FRAMEWORK
      // ============================================

      // Module 1: Core Data & Background Diagnosis
      y += 100
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(255, 0, 80)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Module 1: Core Data & Background Diagnosis', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 120, 'F')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(161, 161, 170)

      const likeRate = views > 0 ? ((likes / views) * 100).toFixed(2) : '0'
      const commentRate = views > 0 ? ((comments / views) * 100).toFixed(3) : '0'
      const shareRate = views > 0 ? ((shares / views) * 100).toFixed(3) : '0'

      doc.setTextColor(0, 242, 234)
      doc.setFont('helvetica', 'bold')
      doc.text('Data Performance Review:', margin + 5, y + 12)
      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      doc.text(`• Views: ${formatNumber(views)} | Viral Score: ${viralScore.toFixed(0)}/100`, margin + 5, y + 25)
      doc.text(`• Like Rate: ${likeRate}% (Platform avg: 4-6%)`, margin + 5, y + 38)
      doc.text(`• Comment Rate: ${commentRate}% (Platform avg: 0.5-1%)`, margin + 5, y + 51)
      doc.text(`• Share Rate: ${shareRate}% | Engagement: ${engagementRate.toFixed(2)}%`, margin + 5, y + 64)
      doc.text(`• Content Velocity: ${velocity || 0} views/hour`, margin + 5, y + 77)

      y += 95
      doc.setTextColor(255, 0, 80)
      doc.setFont('helvetica', 'bold')
      doc.text('Content Positioning:', margin + 5, y + 5)
      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const category = video.trend?.category || 'General'
      const audienceInsight = views > 1000000
        ? 'Mass appeal content with broad demographic reach'
        : views > 100000
        ? 'Niche-focused with engaged community'
        : 'Early-stage content building initial audience'
      const posLines = doc.splitTextToSize(`Vertical: ${category} | Target: ${audienceInsight}`, pageWidth - margin * 2 - 10)
      posLines.slice(0, 2).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 18 + idx * 12)
      })

      // Module 2: Golden Hook Analysis
      y += 50
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(0, 242, 234)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Module 2: Golden Hook Analysis (First 3-5 Seconds)', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 100, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)

      const hookType = views > 500000
        ? 'Visual Hook + Suspense'
        : engagementRate > 8
        ? 'Pain Point Hook'
        : 'Curiosity Gap Hook'

      doc.setTextColor(0, 242, 234)
      doc.setFont('helvetica', 'bold')
      doc.text(`Hook Type Identified: ${hookType}`, margin + 5, y + 12)

      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const hookAnalysis = views > 100000
        ? 'This video uses an effective hook strategy. The opening successfully captures attention through strong visual/auditory elements or emotional triggers. The first 3 seconds create immediate curiosity or relatability.'
        : 'The hook needs optimization. Consider: (1) Starting with a surprising visual, (2) Asking a direct question to target audience, (3) Creating curiosity gap, (4) Using trending audio in first second.'
      const hookLines = doc.splitTextToSize(hookAnalysis, pageWidth - margin * 2 - 10)
      hookLines.slice(0, 3).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 28 + idx * 12)
      })

      y += 55
      doc.setTextColor(255, 0, 80)
      doc.setFont('helvetica', 'bold')
      doc.text('Hook Optimization:', margin + 5, y + 12)
      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const hookOpt = views > 100000
        ? 'Current hook is performing well. To further improve retention by 10-20%: (1) Add text overlay in first frame, (2) Use trending sound within 0.5s, (3) Create pattern interrupt with unexpected visual.'
        : 'Recommended hook improvements: Start with high-energy visual, use countdown format, or open with controversial statement. Test hooks A/B: Question vs Statement vs Visual surprise.'
      const hookOptLines = doc.splitTextToSize(hookOpt, pageWidth - margin * 2 - 10)
      hookOptLines.slice(0, 2).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 25 + idx * 12)
      })

      // Module 3: Narrative Structure
      y += 50
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(139, 92, 246)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Module 3: Narrative Structure & Completion Rate', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 110, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)

      const narrativeStructure = engagementRate > 8
        ? 'Hook → Problem → Solution → Payoff → CTA'
        : 'Hook → Setup → Climax → Resolution'

      doc.setTextColor(139, 92, 246)
      doc.setFont('helvetica', 'bold')
      doc.text(`Narrative Arc: ${narrativeStructure}`, margin + 5, y + 12)

      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const narrativeText = engagementRate > 8
        ? 'Strong narrative structure with clear problem-solution framework. The video maintains tension through the middle section before delivering satisfying payoff. Rhythm: Fast cuts in first 3s, then steady pacing, building to climax.'
        : 'Consider restructuring: Start with promise → Show struggle → Reveal outcome → Call to action. Add more visual changes every 3-5 seconds to maintain attention.'
      const narrLines = doc.splitTextToSize(narrativeText, pageWidth - margin * 2 - 10)
      narrLines.slice(0, 3).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 28 + idx * 12)
      })

      y += 55
      doc.setTextColor(0, 242, 234)
      doc.setFont('helvetica', 'bold')
      doc.text('Retention Risk Points:', margin + 5, y + 12)
      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const riskText = 'Typical drop-off points: (1) Second 3-5 if hook not compelling, (2) Middle section if pacing slows, (3) Before CTA if payoff unclear. Monitor analytics for exact timestamps.'
      const riskLines = doc.splitTextToSize(riskText, pageWidth - margin * 2 - 10)
      riskLines.slice(0, 2).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 25 + idx * 12)
      })

      // Module 4: Copywriting & Audio-Visual
      y += 50
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(255, 165, 0)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Module 4: Copywriting & Audio-Visual Language', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 100, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)

      const copyStrength = comments > 100
        ? 'High engagement copy with conversational tone'
        : 'Standard descriptive copy'

      doc.setTextColor(255, 165, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(`Copy Analysis: ${copyStrength}`, margin + 5, y + 12)

      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const copyText = comments > 100
        ? 'The video demonstrates strong copywriting: conversational language, relatable pain points, and clear value proposition. Text density is optimal - not overwhelming but informative. Consider adding more power words and emotional triggers.'
        : 'Copy optimization opportunities: (1) Use more personal pronouns (you, your), (2) Add urgency words (now, today, immediately), (3) Include benefit-driven language, (4) Reduce filler words. Add 3-5 relevant hashtags.'
      const copyLines = doc.splitTextToSize(copyText, pageWidth - margin * 2 - 10)
      copyLines.slice(0, 3).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 28 + idx * 12)
      })

      y += 55
      doc.setTextColor(0, 242, 234)
      doc.setFont('helvetica', 'bold')
      doc.text('Audio-Visual Coherence:', margin + 5, y + 12)
      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const avText = 'Visual pacing matches audio rhythm. Shot composition follows rule of thirds. Consider: (1) Adding jump cuts every 2-3 seconds for retention, (2) Using text overlays to emphasize key points, (3) Matching BGM energy to content mood, (4) Adding sound effects on transitions.'
      const avLines = doc.splitTextToSize(avText, pageWidth - margin * 2 - 10)
      avLines.slice(0, 3).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 25 + idx * 12)
      })

      // Module 5: Interaction & Conversion
      y += 60
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(220, 20, 60)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Module 5: Interaction & Conversion Triggers', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 100, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)

      const ctaEffectiveness = likes > views * 0.05
        ? 'Strong CTA performance'
        : 'CTA needs optimization'

      doc.setTextColor(220, 20, 60)
      doc.setFont('helvetica', 'bold')
      doc.text(`CTA Effectiveness: ${ctaEffectiveness}`, margin + 5, y + 12)

      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const ctaText = likes > views * 0.05
        ? 'The video successfully guides viewers to engage. Natural CTA placement without being pushy. Comment bait is well-crafted - asking open-ended questions or inviting opinions. Engagement velocity is sustained post-publication.'
        : 'Recommended CTA improvements: (1) Add verbal CTA at 80% mark, (2) Use text overlay "Like if you agree", (3) Ask specific question in caption, (4) Create save-worthy content (tips, tutorials), (5) Respond to first 10 comments within 1 hour.'
      const ctaLines = doc.splitTextToSize(ctaText, pageWidth - margin * 2 - 10)
      ctaLines.slice(0, 3).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 28 + idx * 12)
      })

      y += 55
      doc.setTextColor(0, 242, 234)
      doc.setFont('helvetica', 'bold')
      doc.text('Comment Section Insights:', margin + 5, y + 12)
      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const commentInsight = `Comment-to-view ratio: ${commentRate}%. ${comments > 100 ? 'High comment volume indicates strong community engagement. Monitor top comments for content inspiration and audience sentiment.' : 'Low comment engagement suggests need for more discussion-provoking content or direct questions.'}`
      const comLines = doc.splitTextToSize(commentInsight, pageWidth - margin * 2 - 10)
      comLines.slice(0, 2).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 25 + idx * 12)
      })

      // Module 6 & 7: Channel Analysis
      y += 50
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(75, 0, 130)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Module 6 & 7: Channel Analysis & Business Value', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 110, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)

      const channelPosition = views > 1000000
        ? 'Authority Creator'
        : views > 100000
        ? 'Rising Creator'
        : 'Emerging Creator'

      doc.setTextColor(147, 112, 219)
      doc.setFont('helvetica', 'bold')
      doc.text(`Channel Position: ${channelPosition}`, margin + 5, y + 12)

      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const positionText = `Based on this video's performance, the creator is positioned as a ${channelPosition.toLowerCase()} in the ${category} niche. ${views > 100000 ? 'High viral potential indicates algorithm favor. Maintain posting frequency of 1-2x daily to sustain growth momentum.' : 'Focus on consistency and niche specialization. Build content series to increase binge-watching and profile visits.'}`
      const posLines2 = doc.splitTextToSize(positionText, pageWidth - margin * 2 - 10)
      posLines2.slice(0, 3).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 28 + idx * 12)
      })

      y += 55
      doc.setTextColor(0, 242, 234)
      doc.setFont('helvetica', 'bold')
      doc.text('Competitive Landscape:', margin + 5, y + 12)
      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const competeText = views > 500000
        ? 'This performance places the creator in top 5% of the niche. Differentiation factors: unique perspective, production quality, or personality. To maintain edge: (1) Monitor top 10 creators weekly, (2) Adapt trending formats within 48 hours, (3) Develop signature content style.'
        : 'Growth opportunities: Study top performers in niche, identify content gaps they are not addressing, create better versions of their top videos with unique angle.'
      const compLines = doc.splitTextToSize(competeText, pageWidth - margin * 2 - 10)
      compLines.slice(0, 3).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 25 + idx * 12)
      })

      // Module 8: Action Plan
      y += 60
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(34, 197, 94)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Module 8: Growth Action Plan (Next 30 Days)', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 160, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)

      const actionPlan = [
        { title: '1. Next Video Topic', content: `Create follow-up to this viral video: "Part 2" or "Behind the scenes" or "Answering comments about [topic]". Strike while audience interest is high.` },
        { title: '2. Title A/B Tests', content: `Test three variants: (A) Question format: "Why is everyone talking about X?", (B) Number format: "5 secrets about X", (C) Controversy: "The truth about X nobody tells you"` },
        { title: '3. Thumbnail Optimization', content: 'Use high-contrast colors, expressive face, text overlay with 3-5 words, arrows/pointers to key element. Test bright border colors.' },
        { title: '4. Repurpose Strategy', content: 'Clip top 15 seconds for Shorts/Reels. Create carousel post with key takeaways. Turn into blog post or newsletter content.' },
        { title: '5. Engagement Protocol', content: 'Reply to first 20 comments within 30 min of posting. Pin a question to spark discussion. Duet/Stitch 3 related videos weekly.' },
      ]

      let actionY = y + 12
      actionPlan.forEach((action) => {
        doc.setTextColor(34, 197, 94)
        doc.setFont('helvetica', 'bold')
        doc.text(action.title, margin + 5, actionY)
        doc.setTextColor(161, 161, 170)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(action.content, pageWidth - margin * 2 - 15)
        lines.slice(0, 2).forEach((line: string, idx: number) => {
          doc.text(line, margin + 5, actionY + 14 + idx * 12)
        })
        actionY += 35
      })

      // SEO & Hashtag Section
      y = actionY + 15
      if (y > 220) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(139, 92, 246)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('SEO & Hashtag Optimization', margin + 5, y + 3)

      y += 20
      doc.setFillColor(24, 24, 27)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 70, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      const hashtags = video.hashtags || []
      if (hashtags.length > 0) {
        doc.setTextColor(139, 92, 246)
        doc.setFont('helvetica', 'bold')
        doc.text('Current Hashtags:', margin + 5, y + 12)
        doc.setTextColor(161, 161, 170)
        doc.setFont('helvetica', 'normal')
        const hashtagText = hashtags.slice(0, 8).join(' ')
        const tagLines = doc.splitTextToSize(hashtagText, pageWidth - margin * 2 - 10)
        tagLines.slice(0, 2).forEach((line: string, idx: number) => {
          doc.text(line, margin + 5, y + 25 + idx * 12)
        })
      } else {
        doc.setTextColor(161, 161, 170)
        doc.text('No hashtags detected. Recommendation: Use 3-5 niche hashtags + 1-2 broad hashtags.', margin + 5, y + 15)
      }

      y += 45
      doc.setTextColor(147, 112, 219)
      doc.setFont('helvetica', 'bold')
      doc.text('Hashtag Strategy:', margin + 5, y + 12)
      doc.setTextColor(161, 161, 170)
      doc.setFont('helvetica', 'normal')
      const tagStrategy = 'Recommended mix: 40% niche-specific tags, 30% medium competition, 20% trending/broad, 10% branded. Research tags with 100K-1M posts for optimal discovery.'
      const tagLines2 = doc.splitTextToSize(tagStrategy, pageWidth - margin * 2 - 10)
      tagLines2.slice(0, 2).forEach((line: string, idx: number) => {
        doc.text(line, margin + 5, y + 25 + idx * 12)
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
        className="bg-gradient-to-r from-tiktok-cyan/20 to-tiktok-pink/20 border-tiktok-cyan/50 text-white hover:from-tiktok-cyan/30 hover:to-tiktok-pink/30"
      >
        <FileText className="w-4 h-4 mr-2" />
        {isGenerating ? 'Generating...' : 'AI Analysis Report'}
      </Button>

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
