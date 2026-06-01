import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { query, country, categoryId } = await request.json();
    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Query too short' }, { status: 400 });
    }

    const now = new Date();
    const ads = await prisma.ad.findMany({
      where: {
        isActive:   true,
        isPaid:     true,
        expiryDate: { gte: now },
        ...(country    && { countries:  { has: country } }),
        ...(categoryId && { categoryId }),
      },
      select: {
        id:          true,
        title:       true,
        description: true,
        companyName: true,
        location:    true,
        countries:   true,
        category:    { select: { name: true, type: true } },
      },
      orderBy: { visibilityScore: 'desc' },
      take:    500,
    });

    if (ads.length === 0) {
      return NextResponse.json({ success: true, data: { adIds: [], answer: 'No active listings found.' } });
    }

    const adsContext = JSON.stringify(
      ads.map((a) => ({
        id:       a.id,
        title:    a.title,
        desc:     a.description.slice(0, 150),
        company:  a.companyName,
        location: a.location,
        category: a.category.name,
        type:     a.category.type,
        countries:a.countries.slice(0, 5),
      }))
    );

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: `You are a search assistant for Yubbox, a global advertising platform. Given a list of active listings and a user's natural language query, return the IDs of the most relevant listings ranked by relevance. Also write a one-sentence summary of what you found.

LISTINGS (JSON array):
${adsContext}

Return ONLY valid JSON in this exact format, no markdown:
{"adIds": ["id1","id2","id3"], "answer": "Found X listings matching your query for ..."}

Return at most 12 adIds. If nothing matches, return {"adIds": [], "answer": "No listings found for that query."}`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: query.trim() }],
    });

    const raw  = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';
    const parsed = JSON.parse(raw) as { adIds: string[]; answer: string };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
